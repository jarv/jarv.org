+++
title = "Bootstrapping pet VMs for side-projects"
date = "2023-08-15"
draft = true
slug = "caddy-containers"
tags = ["cmdchallenge", "go"]
+++

_This is part 2 in a 3 part series on some recent configuration changes to my side-project stack_

There is poor-man's configuration management for VMs and there is the type of configuration management that is a destitute on the sidewalk lying in their own filth.
This post catalogs the latter and explains one way to use very simple bash scripts to manage servers.

When I started provisioning VMs for myself the temptation was to always pack a bunch of provisioning logic


```bash
#!/usr/bin/bash

set -eEfo pipefail

# save stdout and stderr
exec 3>&1
exec 4>&2

apt_opts=(
  -y -qq
  -o Dpkg::Options::="--force-confdef"
  -o Dpkg::Options::="--force-confold"
)

log_fname="/var/tmp/bootstrap-$(date +%Y%m%d-%H%M%S).log"

logOnly() {
  exec &>>"$log_fname"
}

outputOnly() {
  exec 1>&3
  exec 2>&4
}

p() {
  outputOnly
  printf "%-47s" "${1} ..."
  logOnly
}

pComplete() {
  outputOnly
  printf "%s\n" "[  updated  ]"
  logOnly
}

noChanges () {
  outputOnly
  printf "%s\n" "[ no change ]"
  logOnly
}

errorExit() {
  outputOnly
  printf "\n\nFailure when running script! Full log output:\n\n"
  cat "$log_fname"
}

trap errorExit SIGINT SIGTERM ERR

```

## Provisioning


## Configuration and Deploy
