+++
title = "Using Mise for all the things"
date = "2024-12-27"
slug = "mise"
tags = ["TIL"]
+++

I've been using [Mise](https://github.com/jdx/mise) for some time now both for personal projects and work to manage versions of the tools used for my project.
Recently, Mise has added some functionality tasks and environment leading me to consolidate some other tools like [`direnv`](https://direnv.net/), [`Make`](https://www.gnu.org/software/make/) and [`entr`](https://eradman.com/entrproject/).

When I create a new project I will often setup the following:

1. `Mise` for versioning binaries like `node`, `go`, etc.
2. `bin/` with some scripts for executing tasks using `entr` and sometimes a `Makefile` for calling scripts
3. `direnv` for setting up the environment


With the recent addition of Mise [hooks](https://mise.jdx.dev/hooks.html) and [tasks](https://mise.jdx.dev/tasks/) all three of these can be done pretty well with `mise` itself.

## Environment and Secrets

In this example I have an environment variable named `CLOUDFLARE_EMAIL` and a secret `CLOUDFLARE_API_KEY`.
Both are now set in my `Mise` configuration and when I enter the project directory.

The `.mise.toml`:

```
[env]
CLOUDFLARE_EMAIL = "john@jarv.org"

[hooks.enter]
shell = "bash"
script = """
echo -e '⏳Setting secrets in environment ..'
source <(cat .1pass | op --account my.1password.com inject)
echo -e '☑️ Done!'
"""
```

And every project has a file `.1pass` that is uses [1pass template syntax](https://developer.1password.com/docs/cli/secrets-template-syntax/) to inject environment variable based secrets.:


```
export CLOUDFLARE_API_KEY={{ op://personal/direnv/CF_GLOBAL_API_KEY }}

```

## Tasks and watching files on changes

Now that the environment is sorted out, we can replace utility scripts and a `Makefile` for running them with [`Mise` tasks](https://mise.jdx.dev/tasks/).
These are also configured in the project's `.mise.toml` file.
For example, for this blog I have:

```
[tasks.serve]
run = "hugo server -D -F"
```

With this, I can  run `mise run serve` to start the `hugo` server.

Watching file and restarting a process on changes can be configured in `.mise.toml` using [watchexec](https://github.com/watchexec/watchexec) 

Here is a `.mise.toml` config for a task named `run` that will build assets and recompile my go app on changes:

```
[tasks.run]
depends = ['build-assets']
sources =[
  '**/*.{tmpl,go}' ,
  'src/**/*' ,
  'package.json',
]
run = """
#!/usr/bin/env bash
shopt -s globstar extglob
go_app=(!(*_test).go)
go run ${go_app[*]} -dbFile /tmp/db.sqlite3
"""
```

`mise watch -t run -- -r` will start watching files and rebuild everything whenever one of the files in `sources` are modified.
The `-r` is passed to `watchexec` to force a process restart.

If `mise watch -t run -- -r` is too hard to remember, you can add it as a task!

```
[tasks.watch]
run = "mise watch -t run -- -r"
```
so then all you need to do is type `mise run watch`
