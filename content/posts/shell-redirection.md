+++
title = "Understanding shell redirection "
date = "2020-07-25"
slug = "shell-redirection"
+++

When I was learning to use the shell for the first time I remember teaching myself to do things as I ran into problems, and the first problem I ran into was how to take the output of one command and write it to a file or pipe it a second command.

So like most people, I learned:

```bash
cmd1 | cmd2
```

to take the output of `cmd1` and send it to `cmd2`, and

```bash
cmd1 > path/to/file
```

to take the output of `cmd1` and write it to a file.


This got me pretty far for what I needed to do without fully understanding how it worked or why. Eventually, I learned as well that there were multiple types of output, STDOUT and STDERR, and you could redirect one to the other by adding `2>&1` to the end of commands. Early on, I wish I took the time to understand how redirection works and how it relates to file descriptors.

---

To understand this a bit better, first it's helpful to understand file descriptors. At a very high level, file descriptors are numbers assigned by the operating system that reference open files. The shell will assign the following:

* `0`: STDIN - program input
* `1`: STDOUT - program output
* `2`: STDERR - program error

When using a pipe `|` or redirection `<`/`>` it's helpful to think abut these 3 file descriptors and their corresponding number assignments.


Going back to the example where we are redirecting STDOUT of a program to a file:

```bash
ls > path/to/file
```

This is is the same as:

```bash
0> /path/to/file ls
```

Where `0` refers to STDOUT of `ls`

### Redirecting Output

Let's break down exactly what `>` is doing, from the bash man page:

```
       The general format for redirecting output is:

              [n]>word
```

Where `[n]` is a file descriptor, but in the example `> /path/to/file cmd` there isn't a file descriptor on left side! But there is actually, if you don't specify a specific file descriptor, for output redirection, STDOUT is the default. Which means all of these redirections are exactly the same:

```bash
$ ls > path/to/file
$ > /path/to/file ls
$ 1> /path/to/file ls
```

Note where it is more intuitive to put the `>` after the command, it's not necessary. This is because the position doesn't matter because the descriptor to the left of `>` is implicit. Pretty neat!

### Redirecting Input

Redirecting input is almost exactly the same, from the bash man page:

```
       The general format for redirecting input is:

              [n]<word
```

Note that again there is a file descriptor on the left, and a file on the right. The only difference is that when using a `<` the default file descriptor is `0` (STDIN) if one isn't specified. Therefore, all of these commands are equivalent:

```bash
$ cat < path/to/file
$ < path/to/file cat
$ 0< path/to/file cat
```

Again, I think the first one is a bit more intuitive but it doesn't matter whether the redirection is placed before or after the command.

### Redirecting stdout to stderr

So back to `2>&1`, why is the `&` necessary and what does it mean? Remember that for `>` there needs to be a file descriptor on the left and a file on the right? If we used `2>1` this would simply redirect STDOUT to a file named `1`. By adding the `&` it tells the shell that `1` is referring not to a file, but a file descriptor!

So the main things to remember when it comes to shell redirection:

* For redirecting input **and** redirecting output, there should always be a file descriptor on the left, and a file (for reading, or writing) on the right.
* If a file descriptor is not specified, the default for output `>` is `1` (STDOUT) and the default for input `<` is `0` (STDIN).
* For redirecting STDOUT to STDERR, the `&` is necessary on the right side, because you are redirecting to another file descriptor, instead of a file
* The best reference for all of this is the bash man page, which contains a lot more in-depth information on ways to redirect!
