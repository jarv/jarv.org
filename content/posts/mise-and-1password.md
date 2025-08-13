+++
title = "Using Mise and 1Password for secrets"
date = "2025-08-11"
slug = "mise-and-1password"
tags = ["TIL"]
+++

Since [my last post on using mise](/mise) I've updated how I use [Mise](https://github.com/jdx/mise) with 1Password.

Before, I was using `hooks.enter` to set env variables which has a major disadvantage of not unsetting variables when you leave the project directory.
One option could be to undo what you set in `hooks.leave` but there is a better way, using `_.source` in the `[env]` block like this:

```toml
[env]
_.source = {path = ".1pass.sh"}
CLOUDFLARE_EMAIL = "john@jarv.org"

[hooks.leave]
script = """
rm -f ${MISE_PROJECT_ROOT}/.mise-env-vars-set.$(ps -o pgid= -p $$)
"""
```

This approach is a bit better

1. It Uses [env] so that environment variables are unset when you leave the project directory
2. In the script it still uses `op --account my.1password.com inject` to set multiple secrets in one shot
3. Secrets are only set once, when you enter the project directory.

Here is the `.1pass.sh` script that is sourced:

```sh
gid=$(ps -o pgid= -p $$)
if [ -f .mise-env-vars-set.$gid ]; then
        return
fi

if ! command -v op >/dev/null 2>&1; then
        echo "error: 1Password CLI (op) not found in PATH" >&2
        return 1
fi

echo -e '⏳Setting secrets in environment ..' >&2

# Inject and source in one go.
# The single-quoted heredoc (<<'ENV') prevents local expansion.
if source <(
        op --account my.1password.com inject <<'ENV'
export AWS_ACCESS_KEY={{ op://personal/direnv/CF_R2_ACCESS_KEY }}
export AWS_SECRET_ACCESS_KEY={{ op://personal/direnv/CF_R2_SECRET_KEY }}
# ..etc
ENV
); then
        echo -e '☑️  Done!' >&2
        : >".mise-env-vars-set.$gid"
else
        echo "error: failed to inject/source secrets" >&2
        return 1
fi
```

It uses a temp file, `.mise-env-vars-set.<groud id>` in the root of the project directory (git ignored) that when it exists, will prevent the secrets from being set again (so they are only set when you cd into the dir)

I've also posted this [on the GitHub discussion](https://github.com/jdx/mise/discussions/3542#discussioncomment-14071436).
