+++
title = "Ensuring a consistent PID in docker"
date = "2020-08-02"
slug = "pid-docker"
tags = ["cmdchallenge"]
+++

Recently a [challenge was added](https://oops.cmdchallenge.com/#/oops_print_process) that asks you to identify a process and kill it. This was a new type of exercise that requires a running process in the docker container where all commands are run. This itself wasn't really an issue except that with caching, it requires that the state of the container to be identical from one run to the next. PIDs however, are not so predictable, even when you only have a very small wrapper.

```
PID 1: wrapper that run the command
PID 6 or 7: forked command passed to the wrapper
```

I'm not sure why sometimes the PID would be `6` and other times `7`, but this causes bit of a problem since if you executed a command like:

```bash
ls -d /proc/[0-9]*
```

You might get a cached result, which doesn't represent the PIDs that are running in the context of your next command.

So like most, I went to stackoverflow and found [this stackoverflow post](https://stackoverflow.com/questions/18122592/how-to-set-process-id-in-linux-for-a-specific-program) it can be done by setting `ns_last_pid`

> Open /proc/sys/kernel/ns_last_pid and get fd
> flock it with LOCK_EX
> write PID-1
> fork

But you can't set this in a docker container unless you run it privileged, which is not a great idea for running arbitrary commands passed in by the Internet.
Instead, this ended up getting solved with a very boring solution. For challenges where we need a running process, the wrapper cycles through all the PIDs up to PID number `41`, and then forks the process that needed to be killed. The logic is quite simple, and looks something like this:

```nim
proc start*(oopsProc: var OopsProc, prog: string = OOPS_PROG, targetPid: int = 42) =
  if not oopsProc.slug.startsWith("oops"):
    return

  while true:
    let p = startProcess(
      command=OOPS_PROG, args=["-t", "0"], options={poUsePath}
    )
    let _ = p.waitForExit()
    p.close

    if p.processId == targetPid - 1:
      break

  oopsProc.p = startProcess(
    command=OOPS_PROG, options={poUsePath}
  )
  oopsProc.pid = oopsProc.p.processId
```

This is how for [kill a process](https://oops.cmdchallenge.com/#/oops_kill_a_process), the answer is always `kill -9 42`!
