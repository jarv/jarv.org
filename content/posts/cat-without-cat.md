+++
title = "Cat without cat on the commandline"
date = "2020-07-30"
slug = "cat-without-cat"
+++

Say you want to display the contents of a file on the command line. The first tool we most of us reach for is `cat`, which does a fine job at just this. In fact, if you are like me you might catch yourself doing something like:

```bash
cat file.txt | grep some-string
```

Instead of:

```bash
grep some-string file.txt
```

This is OK, but let's say you are on a Linux machine and you can't cat, maybe when you try to cat a file:

```bash
$ cat file.txt
-bash: cat: command not found
```

or even:

```bash
$ cat file.txt
bash: fork: retry: No child processes
```

This post explores this idea and was a feature of this [challenge](https://oops.cmdchallenge.com/#/oops_print_file_contents) where you needed to display a file's contents without using any utility outside of the shell.

---

## Using shell built-ins, redirection and subshell

Using the shell builtin `read` you can display the contents of a file, without a forking a new process:

```bash
while read line; do
  echo $line;
done <file.txt
```

From the help page for `read`:

```
One line is read from the standard input, or from file descriptor FD if the
    -u option is supplied, and the first word is assigned to the first NAME,
```

In this example, the contents of file.txt are redirected to the STDIN of `read`, which processes the input line by line, until it reaches the end of the file. `read` also can take a file descriptor as its input instead of STDIN, so this will also work:

```bash
exec 3<file.txt # Assign file descriptor 3 for reading
while read -u 3 line; do
  echo $line
done
```

This ends up being a lot more typing than just `cat file.txt`, with the `bash` or `zsh` there is a another way to display a file's contents without using `cat`:

```bash
echo "$(<file.txt)"
```

this method uses redirection and command substitution, and is mentioned in the bash manpage:

```
The command substitution $(cat file) can be replaced by the equivalent but faster $(< file).
```

It's faster because you are not forking a cat, but does it matter? Probably not, and may not be clear to everyone what you are doing, but you can see a difference with a quick test on your shell:

```bash
 $ time for n in {1..1000}; do echo $(</etc/resolv.conf) >/dev/null; done

real	0m0.977s
user	0m0.380s
sys	0m0.604s
```

```bash
 $ time for n in {1..1000}; do cat /etc/resolv.conf >/dev/null; done

real	0m1.980s
user	0m0.626s
sys	0m1.224s
```

## Using other utilities

How about other options? Without using shell built-ins but instead using other standard utilities you can also cat without cat:

```bash
ul < /file
```

`ul` might inadvertently underline some words in your file but I think it might be the only way to cat a file with only two characters.

```bash
tac /file | tac

```

If you didn't already guess, `tac` is GNU core util that is the reverse of `cat` so if you want to be clever you can pipe the output of `tac` to `tac` which is just a `cat`.

Of course using tools like `sed`, `perl`, `python`, etc. will allow you to cat files as well, happy cat'ing!
