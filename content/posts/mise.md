+++
title = "Using Mise for all the things"
date = "2024-12-27"
slug = "mise"
draft = true
tags = ["TIL"]
+++

I've been using [Mise](https://github.com/jdx/mise) for some time now both for personal projects and work to manager versions of the tools used for my project.
Recently, Mise has added some functionality tasks and environment leading me to consolidate some other tools like [`direnv`](https://direnv.net/), [`Make`](https://www.gnu.org/software/make/) and [`entr`](https://eradman.com/entrproject/).

When I create a new project I will often setup the following:

1. `Mise` for versioning binaries like `node`, `go`, etc.
2. `bin/` with some scripts for executing tasks using `entr`
3. `direnv` for setting up the environment

With the addition of Mise [hooks](https://mise.jdx.dev/hooks.html) all three of these can be done pretty well with `mise` itself.

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

And every project has a file `.1pass` that is uses [1pass template syntax](https://developer.1password.com/docs/cli/secrets-template-syntax/):


```
export CLOUDFLARE_API_KEY={{ op://personal/direnv/CF_GLOBAL_API_KEY }}

```

## Tasks and watching files on changes
