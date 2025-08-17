+++
title = "Using Mise and 1Password for secrets"
date = "2025-08-11"
slug = "mise-and-1password"
tags = ["TIL"]
+++

**2025-08-17 UPDATE**: I've modified this post to use `hooks.enter` and `hooks.leave` after seeing how my previous solution was not working in all cases.

Since [my last post on using mise](/posts/mise) I've updated how I use [Mise](https://github.com/jdx/mise) with 1Password.

Before, I was only using `hooks.enter` to set env variables from 1password.
This had some disadvantages:

1. Variables would be left set when leaving the project directory
2. It made assumptions that you would cd into the root of the project directory first

This modification addresses those two issues by sourcing a script that unsets variables when leave the project directory.
This still has a major shortcoming which is that it doesn't restore variables that have the same name when leaving, so that is something to be mindful of.

Here is the approach using `hooks.{enter,leave}` in `mise.toml`:

```toml
[hooks.enter]
shell = "bash"
script = """
source "{{ config_root }}/.1pass.sh"
"""

[hooks.leave]
shell = "bash"
script = """
source "{{ config_root }}/.1pass.sh" unset
"""
```

Add secrets by adding to the `ENV_MAPPINGS` array.

`1pass.sh`:

```sh
ENV_MAPPINGS=(
 "GOOGLE_KEY:op://personal/direnv/GOOGLE_KEY"
 "GOOGLE_SECRET:op://personal/direnv/GOOGLE_SECRET"
    # etc.
)

unset_env_vars() {
 echo '⏳Unsetting environment variables ..' >&2
 for mapping in "${ENV_MAPPINGS[@]}"; do
  env_var="${mapping%%:*}"
  unset "$env_var"
 done
 echo '☑️ Environment variables unset!' >&2
}

set_env_vars() {
 if ! command -v op >/dev/null 2>&1; then
  echo "error: 1Password CLI (op) not found in PATH" >&2
  return 1
 fi

 echo '⏳Setting secrets in environment ..' >&2

 # Build the template for op inject
 template=""
 for mapping in "${ENV_MAPPINGS[@]}"; do
  env_var="${mapping%%:*}"
  op_path="${mapping#*:}"
  template="${template}export ${env_var}={{ ${op_path} }}
"
 done
 if eval "$(echo "$template" | op --account my.1password.com inject)"; then
  echo '☑️ Done!' >&2
 else
  echo "error: failed to inject/source secrets" >&2
  return 1
 fi
}

if [ "$1" = "unset" ]; then
 unset_env_vars
else
 set_env_vars
fi
```

See also [this GitHub discussion](https://github.com/jdx/mise/discussions/3542#discussioncomment-14071436) for others who are trying similar things with `mise` to use 1password to populate the env.
