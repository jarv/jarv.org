+++
title = "Debugging a deadlock in Go"
date = "2023-10-11"
slug = "go-deadlock"
tags = ["cmdchallenge", "go"]
+++

![empty-solutions-email](/img/empty-solutions-email.png)

Occasionally, [cmdchallenge.com](https://cmdchallenge.com) would get into a state where requests to list user-submitted solutions to challenges would hang.
The first few times it happened, I restarted the service which was enough to get it working again.
Only later did I try to figure out what is going on, and thought I would do a small write-up as it ended up being a very common problem with deadlocks in Go.

## Background

When I rewrote this application in Go, rate limiting was added using a popular package called [tollbooth](https://github.com/didip/tollbooth).

The reasons for rate limiting were:

1. Every solution submission starts a new Docker container so I didn't want that happening too frequently per IP.
2. Every solution request does a lookup on a sqlite3 DB so I wanted to limit that as well.

Adding rate limits for (2) was hardly necessary since it only does a simple sqlite lookup, but this was where I was seeing the issue and also the place where I was mostly likely to receive concurrent requests.

The first time I investigated this problem I created a test deployment and ran a bunch of concurrent requests.
I didn't see the issue and was a bit perplexed, **the problem was that my testing environment had rate-limiting disabled!**.
A good lesson here is that when you are trying to reproduce a bug, keep your testing environment as similar as possible to where it is happening.

The bug itself was pretty easy to extract, here is a small program that reproduces it (also [on GitHub](https://github.com/jarv/godeadlock/blob/master/app.go)):

```go
package main

import (
        "fmt"
        "log"
        "net/http"
        _ "net/http/pprof"

        "github.com/didip/tollbooth/v7"
)

func testHandler(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "OK\n")
}

func main() {
        listenStr := fmt.Sprintf(":%d", 6060)

        lmt := tollbooth.NewLimiter(float64(1), nil) // 1 req/s
        lmt.SetOnLimitReached(func(w http.ResponseWriter, r *http.Request) {
                log.Printf("Rate limit reached StatusCode: %d\n", lmt.GetStatusCode())
        })

        http.Handle("/", tollbooth.LimitFuncHandler(lmt, testHandler))

        log.Printf("Server started %s\n", listenStr)
        log.Fatal(http.ListenAndServe(listenStr, nil))
}
```

If you would like to see the bug yourself:

```bash
git clone https://github.com/jarv/godeadlock
go run app.go
```
And then send concurrent requests using [ab](https://httpd.apache.org/docs/2.4/programs/ab.html) or [bombardier](https://github.com/codesenberg/bombardier)

```bash
# ab https://httpd.apache.org/docs/2.4/programs/ab.html
ab -n 100 -c 50 'http://localhost:6060/'

# bombardier https://github.com/codesenberg/bombardier
bombardier -n 100 -c 50 -l http://localhost:6060
```

Once connections start timing out you will have a deadlock and nothing will get through. You can try to `curl http://localhost:6060` to be sure.
Once it is in this state, try to figure out what caused the deadlock yourself, or read on if you would like to learn how to find the cause.


## View the stack traces of all Go routines

Once the deadlock occurs, the best way to figure out where your program is stuck is by viewing the stack trace of all Go routines.
There are two options, one is using [pprof](https://pkg.go.dev/net/http/pprof) which is configured in the example code, another is to issue a `SIGQUIT` (CTRL-`/` in your terminal) which will dump the Go routines to STDERR.


The `pprof` method is the easiest since we have it setup in the code to reproduce the issue.
Connect your browser to [http://localhost:6060/debug/pprof/goroutine?debug=1](http://localhost:6060/debug/pprof/goroutine?debug=1) to see the traces for all Go routines.
The ones to focus on are the ones that call `sync`.
From these we can see that there are multiple go routines blocked on `RLock()` and `Lock()`.

`Lock()` allows only one Go routine to read/write at a time, `RLock()` allows multiple Go routines to read, but not write.

The traces reveal that there are multiple Go routines are waiting for a `Rlock()`, and another Go routine is waiting for a `Lock()` (abbreviated output below):

```html
197 @ 0x1027596c8 0x10276b6f8 0x10276b6d5 0x102788358 0x102954a3c 0x1029549e9 0x102956e34 0x102958afc 0x102958f80 0x1029049b8 0x102905ff4 0x102906ccc 0x102903a48 0x10278c8f4
#	0x102788357	sync.runtime_SemacquireRWMutexR+0x27				/Users/jarv/.local/share/rtx/installs/go/1.21.1/go/src/runtime/sema.go:82
#	0x102954a3b	sync.(*RWMutex).RLock+0x7b					/Users/jarv/.local/share/rtx/installs/go/1.21.1/go/src/sync/rwmutex.go:71
#	0x1029549e8	github.com/didip/tollbooth/v7/limiter.(*Limiter).GetMax+0x28	/Users/jarv/go/pkg/mod/github.com/didip/tollbooth/v7@v7.0.1/limiter/limiter.go:182
...
1 @ 0x1027596c8 0x10276b6f8 0x10276b6d5 0x102788358 0x102955238 0x1029551e5 0x1029590d0 0x10295549c 0x102958f9c 0x1029049b8 0x102905ff4 0x102906ccc 0x102903a48 0x10278c8f4
#	0x102788357	sync.runtime_SemacquireRWMutexR+0x27						/Users/jarv/.local/share/rtx/installs/go/1.21.1/go/src/runtime/sema.go:82
#	0x102955237	sync.(*RWMutex).RLock+0x77							/Users/jarv/.local/share/rtx/installs/go/1.21.1/go/src/sync/rwmutex.go:71
#	0x1029551e4	github.com/didip/tollbooth/v7/limiter.(*Limiter).GetStatusCode+0x24		/Users/jarv/go/pkg/mod/github.com/didip/tollbooth/v7@v7.0.1/limiter/limiter.go:247
#	0x1029590cf	main.main.func1+0x1f								/Users/jarv/src/jarv/godeadlock/app.go:21
#	0x10295549b	github.com/didip/tollbooth/v7/limiter.(*Limiter).ExecOnLimitReached+0xdb	/Users/jarv/go/pkg/mod/github.com/didip/tollbooth/v7@v7.0.1/limiter/limiter.go:268
...
1 @ 0x1027596c8 0x10276b6f8 0x10276b6d5 0x1027883b8 0x1027a47e8 0x102956ac4 0x102956cf8 0x102957724 0x102958b74 0x102958f80 0x1029049b8 0x102905ff4 0x102906ccc 0x102903a48 0x10278c8f4
#	0x1027883b7	sync.runtime_SemacquireRWMutex+0x27							/Users/jarv/.local/share/rtx/installs/go/1.21.1/go/src/runtime/sema.go:87
#	0x1027a47e7	sync.(*RWMutex).Lock+0xf7								/Users/jarv/.local/share/rtx/installs/go/1.21.1/go/src/sync/rwmutex.go:152
#	0x102956ac3	github.com/didip/tollbooth/v7/limiter.(*Limiter).limitReachedWithTokenBucketTTL+0x63	/Users/jarv/go/pkg/mod/github.com/didip/tollbooth/v7@v7.0.1/limiter/limiter.go:572
#	0x102956cf7	github.com/didip/tollbooth/v7/limiter.(*Limiter).LimitReached+0x57			/Users/jarv/go/pkg/mod/github.com/didip/tollbooth/v7@v7.0.1/limiter/limiter.go:599
...
```

1. `limiter.go:182`:
```go
// GetMax is thread-safe way of getting maximum number of requests to limit per second.
func (l *Limiter) GetMax() float64 {
    l.RLock()
    defer l.RUnlock()
    return l.max
}
```
2. `limiter.go:247`
```go
func (l *Limiter) GetStatusCode() int {
    l.RLock()
    defer l.RUnlock()
    return l.statusCode
}
```

3. `limiter.go:572`

```go
func (l *Limiter) limitReachedWithTokenBucketTTL(key string, tokenBucketTTL time.Duration) bool {
    lmtMax := l.GetMax()
    lmtBurst := l.GetBurst()
    l.Lock()
    defer l.Unlock()

...
```
`GetStatusCode()` stands out here as it is a function we call in the example.
Also, if we delete `lmt.GetStatusCode()` the deadlock is resolved, but why?

## Fixing the deadlock

To figure this out, we follow the trace up to see how function we pass to `SetOnLimitReached` function is called:

```go
// ExecOnLimitReached is thread-safe way of executing after-rejection function when limit is reached.
func (l *Limiter) ExecOnLimitReached(w http.ResponseWriter, r *http.Request) {
    l.RLock()
    defer l.RUnlock()

    fn := l.onLimitReached
    if fn != nil {
        fn(w, r)
    }
}
```

Right there is the issue, there is an `RLock()` acquired right before the function call.
In that function we are calling `GetStatusCode()` which calls `RLock()` again.
This is a very common source of deadlocks in Go and is even called out in the [documentation](https://pkg.go.dev/sync#RWMutex):

> If a goroutine holds a RWMutex for reading and another goroutine might call Lock, no goroutine should expect to be able to acquire a read lock until the initial read lock is released. In particular, this prohibits recursive read locking. This is to ensure that the lock eventually becomes available; a blocked Lock call excludes new readers from acquiring the lock.

![deadlock](/img/deadlock.png)

This illustrates why recursive read locking is problematic, if a concurrent request calls lock between the two read locks, the second read lock and the write lock will wait forever for the first read lock to release.

This can be resolved by releasing the read lock immediately after assigning the function from `l.onLimitReached`, which is exactly what I did in my local fork of this package to resolve the issue and submitted [an upstream issue](https://github.com/didip/tollbooth/issues/106).

```diff
 func (l *Limiter) ExecOnLimitReached(w http.ResponseWriter, r *http.Request) {
        l.RLock()
-       defer l.RUnlock()
-
        fn := l.onLimitReached
+       l.RUnlock()

        if fn != nil {
                fn(w, r)
        }
```

After this there are no more deadlocks and we can send a large number of concurrent requests that are rate limited.
I hope you found this explanation clear and maybe learned something new about deadlocks in Go.
If you have any comments or questions please don't hesitate to [reach out](/contact/)!.
