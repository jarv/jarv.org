+++
title = "Running a command with a timeout in Go"
date = "2022-09-27"
slug = "command-with-timeout"
tags = ["cmdchallenge", "go"]
+++

I've been slowly re-writing most of [cmdchallenge](https://cmdchallenge.com) in Go.
It started with [porting all of the Python code running in AWS Lambda](/posts/from-serverless-to-server/), and now I am in the process of re-writing the command runner.
This is the component that executes user provided commands, originally written in [Nim](https://nim-lang.org/).

The command runner takes user submitted shell commands and executes them in a Docker container.
In the Go program, I initially used `exec.CommandContext()` and `.CombinedOutput()`.
This met the following requirements:

- A command to be executed but the execution needs to be time constrained
- Fetching the output of the command with combined STDOUT and STDERR
- Getting the command's exit code

Initially using `exec.CommandContext()` and `.CombinedOutput()` seemed like a good fit since I could use [context](https://pkg.go.dev/context) to send a kill signal to constrain how long the command would run.
However, I noticed some odd behavior as it related to setting timeouts.

Take the following two examples:

```go
log.Println("starting")
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

shArgs := []string{"-c", "sleep 10"}
_, err := exec.CommandContext(ctx, "sh", shArgs...).CombinedOutput(); err != nil {
    log.Fatalf(err.Error())
}
log.Println("finished")

// Output:
//
// 2022/09/27 19:08:04 starting
// 2022/09/27 19:08:14 signal: killed
```

```go
log.Println("starting")
ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
defer cancel()

shArgs := []string{"-c", "sleep 10"}
if err := exec.CommandContext(ctx, "sh", shArgs...).Run(); err != nil {
    log.Fatalf(err.Error())
}
log.Println("finished")

// Output:
//
// 2022/09/27 19:10:13 starting
// 2022/09/27 19:10:15 signal: killed
```

Note how the first example reports that the program is killed, but not until a full 10 seconds despite setting a 2 second timout on the context.
Passing the context doesn't seem to do anything at all!
In the second example, the program resumes after the 2 second timeout as we would expect.
The key difference is that in the first example we are using `CombinedOutput()`.

Let's take a closer look at the process tree and what happens to the `sleep 10`.
Assuming our program is called `timeouttest`, the process tree starts like this:

```
bash,1
  `-timeouttest,8019
      |-sh,8024 -c sleep 10
      |   `-sleep,7694 10
```

After 2 seconds, `sh` is sent a `SIGKILL` and we are left with:

```
bash,1
  |-sleep,7694 10
  `-timeouttest,8019
```

As seen above, `sleep 10` becomes an orphan that is adopted by PID 1.
`sleep 10` is not killed, because the kill was sent to `sh`, and the signal is not propagated to its child.
The main difference between calling `.Run()` and `.CombinedOutput()` is that the latter creates a buffer for `Stdout` for the process and its children.
The progrem will will wait for that descriptor to close. This causes Go to hang, while it waits to copy sleep's standard output to the buffer.

To ensure we can timeout properly, and that the `sleep 10` is also killed, we will need to send a `SIGKILL` to the process group.
This solves the problem because children created via fork will inherit the parent's process group ID, and a kill sent to the group ID will kill the process and all of its descendants.

Here is code to kill the group ID after a 2 second timeout. The implementation below uses a channel with select:

```go
log.Println("starting")
shArgs := []string{"-c", "sleep 10"}
cmd := exec.Command("sh", shArgs...)
cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

type cmdResult struct {
    outb []byte
    err  error
}
cmdDone := make(chan cmdResult, 1)
go func() {
    outb, err := cmd.CombinedOutput()
    cmdDone <- cmdResult{outb, err}
}()

select {
case <-time.After(2 * time.Second):
    syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL)
    log.Fatal("signal: killed")
case <-cmdDone:
    log.Println("finished")
}
```

This sends a `SIGKILL` to the process ID (negated) which is how you send a signal to the process group, which is documented on the [kill man page](https://man7.org/linux/man-pages/man2/kill.2.html).

```
If pid is less than -1, then sig is sent to every process in the
process group whose ID is -pid.
```

This ensures that we will both timeout after the given time, and that all processes including children are killed.
