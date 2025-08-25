+++
title = "Creating a ring buffer using Go Channels for Server-Sent Events"
date = "2024-04-05"
slug = "go-channels-sse"
tags = ["go", "flyemoji"]
+++

Server-Sent Events (SSE) are a simple way to send real-time updates from the server to the browser.
Go channels pair nicely with SSE as they allow easy communication between Go routines.
This post will examine using SSE in a recent side project and the implementation of a ring buffer in Go.

If you aren't already familiar with SSE, like WebSockets, they enable updates on the web browser without having to poll or refresh the browser.
However, unlike WebSockets, they don't support bidirectional communication.
This makes them more suitable for sending updates in one direction.
The main advantage of using SSE is that it builds on top of HTTP (normal HTTP request with additional headers).
This allows requests to pass through firewalls and proxies.

[flyemoji.com](https://flyemoji.com) sets up a reaction poll that users access with a QR code.
The idea is that during a presentation or a video call, you can collect feedback from an audience.
From the poll, users select an emoji reaction to a question.
The reactions get tallied and sent to one or more connected clients listening for results.

It looks something like this:

<h3 style="text-align:center">How are you feeling today?</h3>
<div style="text-align:center;font-style:italic">Press one of the reactions, see tallies in real-time.</div>

<div style="width:300px;margin:auto">
<iframe id="flyemoji" src="{{<smdemo>}}" style="width:300px;height:250px;border:0;margin:auto"></iframe>
</div>

For simplicity, we will assume a large number of clients are sending reactions, and there is a single client receiving the tallies.

1. The browser makes an SSE request to get real-time updates for the emoji tallies and blocks on a Go channel.
1. Emoji presses send a PUT request; the server takes that request and updates emoji tallies in an SQLite database and sends it to the channel.
1. The browser displays the tally result after receiving the tallies via the SSE request.

<img src="/img/tallies.png" alt="tallies" class="light">
<img src="/img/tallies-dark.png" alt="tallies" class="dark">

On the server, sending the tallies in real-time is the easy part since all it requires is a HTTP handler and headers set on the response:

```go
mux.HandleFunc("GET /events", func(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Content-Type", "text/event-stream")
  w.Header().Set("Cache-Control", "no-cache")
  w.Header().Set("Connection", "keep-alive")

  // Setup a channel for receiving data
  // ...

  for tally := range ch {
    // Send the data
    fmt.Fprintf(w, "data: %s\n\n", tally)
    w.(http.Flusher).Flush()
  }
})
```

The trickier part is how to send the SSE data through a Go channel.
By default a Go channel blocks on send until the other side receives data.
Obviously for web clients, we cannot assume that the receiver will be continuously available for receiving tallies.

For this reason a [buffered channel](https://go.dev/tour/concurrency/3) is necessary.
It takes a buffer length parameter on initialization and when data is received the channel won't block until it's full.
Because we only care about the most recent tally data, it's fine to discard old tallies as newer tallies come in.
This is essentially a [ring buffer](https://en.wikipedia.org/wiki/Circular_buffer) with a buffer length of one, that discards the oldest value when new data comes.

## A channel based ring buffer in Go

Below we will discuss two implementations of a ring buffer that pass messages using channels for SSE notifications.
Here is the first implementation that has a couple issues, can you spot them?

```go {linenos=true,hl_lines=[18 21]}
package main

import "fmt"

type RingBuffer struct {
  ch chan string
}

func NewRingBuffer() *RingBuffer {
  return &RingBuffer{
    ch: make(chan string, 1),
  }

}

func (r *RingBuffer) Send(item string) {
  select {
  case r.ch <- item:
  default:
    <-r.ch
    r.ch <- item
  }
}

func (r *RingBuffer) C() <-chan string {
  return r.ch
}

func main() {
  rb := NewRingBuffer()

  rb.Send("some value")
  rb.Send("some other value")

  complete := false
  for !complete {
    select {
    case v := <-rb.C():
      fmt.Println(v)
    default:
      complete = true
    }
  }
}
```

[run on the go playground](https://go.dev/play/p/5q1AkSklE8z)

- When an item is sent, we call `select { ... }` on the channel.
- If the channel is empty, we add the item
- If the channel is full, we remove an item and add a new one

Two race conditions exist in this code, one is fairly obvious and other one might be so at first glance.

### First issue: Concurrent calls to Send()

If we have a large number of clients, calling `Send()` concurrently then we may end up in a race condition causing the channel to block.
In the above code if one sender adds an item to the channel on line `18` as another sender adds an item on line `21` the channel will block because it's trying to add to a full channel.

Here are two possible options to resolve it:

1. Wrap `Send()` in a locking Mutex
2. Use a single Go routine that moves data in and out of the channel

Option (2) creates an input and output channel and moves data between them.

Here is an implementation using two channels:

```go {linenos=true,hl_lines=[23 48]}
package main

import "fmt"

type RingBuffer struct {
  inputChannel  chan string
  outputChannel chan string
}

func NewRingBuffer() *RingBuffer {
  return &RingBuffer{
    inputChannel:  make(chan string),
    outputChannel: make(chan string, 1),
  }
}

// https://tanzu.vmware.com/content/blog/a-channel-based-ring-buffer-in-go
func (r *RingBuffer) Run() {
  for v := range r.inputChannel {
    select {
    case r.outputChannel <- v:
    default:
      <-r.outputChannel
      r.outputChannel <- v
    }
  }
  close(r.outputChannel)
}

func (r *RingBuffer) C() <-chan string {
  return r.outputChannel
}

func (r *RingBuffer) Send(item string) {
  r.inputChannel <- item
}

func main() {
  rb := NewRingBuffer()
  go rb.Run()

  rb.Send("some value")
  rb.Send("some other value")

  complete := false
  for !complete {
    select {
    case v := <-rb.C():
      fmt.Println(v)
    default:
      complete = true
    }
  }
}
```

[run on the go playground](https://go.dev/play/p/m2D_7DkMEmr)

Now the `Send()` function does not have the same issue.
To setup the ring buffer we call `go rb.Run()` before sending data that in the background will move data from the input channel to the output channel.

Note that in this version you might see both values printed or just the first one printed instead.
This is because we are reading from the output channel while a background Go routine moves the messages to it.

### Second issue: Concurrent reads and calls to Send()

As I mentioned earlier, there is another race condition that is also present in this version.
Not only do we have to account for clients sending concurrently, but also sending and receiving concurrently!
In the above code, if we read all the data from the channel (line `48`) while trying to Send simultaneously on line `23`, then it will block forever since the channel will be empty.

Here is a modification to `Run()` that resolves it:

```go {linenos=true}
func (r *RingBuffer) Run() {
  for v := range r.inputChannel {
    select {
    case r.outputChannel <- v:
    default:
      select {
      case <-r.outputChannel:
        r.outputChannel <- v
      default:
        // channel is empty
        r.outputChannel <- v
      }
    }
  }
  close(r.outputChannel)
}
```

This adds an additional `select {...}` to catch the scenario where the channel is empty immediately after we detect it's full.

For the full implementations of both the good and bad ring buffers see
https://github.com/jarv/ringbuffer/tree/master .

## Benchmarks

After writing these impelementations, I was curious which one can move data faster.
Not surprisignly, a background Go routine that moves data between channels is much slower than calling moving data in and out of a channel in the call to `Send()`.

Here are benchmarks of both ring buffer implementations with a buffer length of `1`:

```sh
$ go test -bench=. ./...
goos: darwin
goarch: arm64

## 1 channel where data is moved in the call to Send() with a locking Mutex
pkg: github.com/jarv/ringbuffer/good/singlechan
BenchmarkParallelSendReceive/BufSize:1-10                6284988               191.2 ns/op
BenchmarkSendReceive/BufSize:1-10                       21763442                54.01 ns/op

## 2 channels with a Go routine moving data between them
pkg: github.com/jarv/ringbuffer/good/dualchan
BenchmarkParallelSendReceive/BufSize:1-10                4342477               288.8 ns/op
BenchmarkSendReceive/BufSize:1-10                        5103054               229.2 ns/op

```

https://github.com/jarv/ringbuffer/tree/master/good

The two channel implementation is slower because when the buffer is full, sends will block until the Go routine moves the data to the output channel.
It is exacerbated by a short buffer because it's necessary for the background Go routine to move data between channels frequently.
While performance improves when the buffer length increases, it's generally slower than discarding data in the call to `Send()` even though it requires a locking Mutex.

Notice that in the first benchmark test, it slows down considerably when we add parallelism, which is likely due to contention because of the locking Mutex.

## Conclusion

Figuring out how to use channels for SSE was a lot of fun!
It gave me the opportunity to learn a bit more about how to troubleshoot and think better about concurrency in Go.
One valuable takeaway for me is that it's important to validate background Go routines in unit tests.
This was essential to uncover bugs that were not immediately apparent.

If you like this post, check out my other post on [debugging a deadlock in Go](/posts/go-deadlock/) or subscribe to the [RSS feed](/index.xml).
If you would like a fun way to send out a reaction poll during your next video or conference presentation, check out [flyemoji.com](https://flyemoji.com).
