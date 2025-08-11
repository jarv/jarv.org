+++
title = "Using Mise for All the Things"
date = "2024-12-30"
slug = "mise"
tags = ["TIL"]
+++

I've been using [Mise](https://github.com/jdx/mise) for some time now for both personal projects and work to manage versions of the tools used in my projects. Recently, Mise has added functionality for tasks and environment handling, leading me to consolidate tools like [`direnv`](https://direnv.net/), [`Make`](https://www.gnu.org/software/make/), and [`entr`](https://eradman.com/entrproject/).  

When I create a new project, I often set up the following:  

1. `Mise` for versioning binaries like `node`, `go`, etc.  
2. A `bin/` directory with scripts for executing tasks using `entr`, and sometimes a `Makefile` for calling scripts.  
3. `direnv` for setting up the environment.  

With the recent addition of Mise [hooks](https://mise.jdx.dev/hooks.html) and [tasks](https://mise.jdx.dev/tasks/), all three of these can now be handled effectively with `Mise` itself.  

## Environment and Secrets  

**Note**: See my updated post on [using mise and 1Password](/mise-and-1password).

In this example, I have an environment variable named `CLOUDFLARE_EMAIL` and a secret `CLOUDFLARE_API_KEY`.  
Both are now set in my `Mise` configuration and loaded when I enter the project directory.  

The `.mise.toml`:  

```toml
[env]
CLOUDFLARE_EMAIL = "john@jarv.org"

[hooks.enter]
shell = "bash"
script = """
echo -e '⏳ Setting secrets in environment...'
source <(cat .1pass | op --account my.1password.com inject)
echo -e '☑️ Done!'
"""
```  

Every project has a file `.1pass` that uses [1Password template syntax](https://developer.1password.com/docs/cli/secrets-template-syntax/) to inject secrets as environment variables:  

```bash
export CLOUDFLARE_API_KEY={{ op://personal/direnv/CF_GLOBAL_API_KEY }}
```  

## Tasks and Watching Files on Changes  

Now that the environment is sorted out, we can replace utility scripts and a `Makefile` for running them with [`Mise` tasks](https://mise.jdx.dev/tasks/).  
These are also configured in the project's `.mise.toml` file.  
For example, for this blog I have:  

```toml
[tasks.serve]
run = "hugo server -D -F"
```  

With this, I can run `mise run serve` to start the `hugo` server.  

Watching files and restarting a process on changes can be configured in `.mise.toml` using [watchexec](https://github.com/watchexec/watchexec).  

Here is a `.mise.toml` config for a task named `run` that builds assets and recompiles my Go app on changes:  

```toml
[tasks.run]
depends = ["build-assets"]
sources = [
  "**/*.{tmpl,go}",
  "src/**/*",
  "package.json",
]
run = "go run . -dbFile /tmp/db.sqlite3"
```  

`mise watch -r run` will start watching files and rebuild everything whenever one of the files in `sources` is modified.  
The `-r` is passed to `watchexec` to force a process restart.  

Or if that is too hard to remember, you can add it as a task:  

```toml
[tasks.watch]
run = "mise watch -r run"
```  

Then, all you need to do is type `mise run watch`.  
