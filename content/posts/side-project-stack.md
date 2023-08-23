+++
title = "Caddy and containers are my new go-to stack for side projects"
date = "2023-08-10"
draft = true
slug = "caddy-containers"
tags = ["snowflake"]
+++

Recently I decided to move my side projects away from a combination of AWS and GitHub Pages to a single Hetzner Cloud VM.

This means that everything I have is on a single VM, running:
- Docker containers for services
- Systemd for service management
- [Caddy](https://caddyserver.com/) as the webserver tying it all together with automatic HTTPs.
- Prometheus and Grafana running locally for monitoring

There was some lessons learned from moving from AWS to Hetzner and I wanted to share them here for anyone considering using AWS for side-projects.

## There is no reason you need AWS services for a side-project

I like to play with the latest offerings in AWS but lately I find the single VM approach much simpler to maintain and for multiple experiments that I manage myself.
Simply having an AWS billing account adds a bit of stress since there is always the (remote) possibility of getting billed due to some unusual usage.

Closing down my personal account was a great feeling and now I am running everything on a [`cax11`](https://www.hetzner.com/cloud) ARM server with 2vcpu/4GB for €4.51/month.
This is more than enough to run multiple services as containers with monitoring/dashboarding as well.

## Caddy is awesome!

To show how simple Caddy is compared to other http servers, after pointing [ip.jarv.org](http://ip.jarv.org) to my server the following Caddy server configuration is enough to echo your IP address:

```caddy
(echoIP) {
  templates
  header Content-Type text/plain
  respond <<EOF
  {{.RemoteIP}}

  EOF 200
  import logging ip.jarv.org
}

ip.jarv.org {
  import echoIP
}
http://ip.jarv.org {
  import echoIP
}
```

Normally though, I'm running a site in a container. For example for [cmdchallenge.com](https://cmdchallenge.com) there is the following Caddy configuration:

```caddy

(handles) {
  handle /c/* {
          reverse_proxy localhost:{args.1}
  }
  handle {
          root * /var/opt/www/{args.0}
          file_server {
            precompressed gzip
          }
  }
}

cmdchallenge.com {
  import handles cmdchallenge 8181
  import logging cmdchallenge.com
}
```

Here, we:

- Put static assets into `/var/opt/www/cmdchallenge.com`
- Setup a reverse proxy to port 8181
- HTTPs is setup automatically by Caddy with LetsEncrypt

## Systemd is good enough!

```systemd

[Unit]
Description=cmdchallenge
After=network-online.target

[Service]
Environment=CMD_NAME=cmdchallenge
Environment=CMD_PORT=8181
Environment=CMD_TAG=arm64
ExecStartPre=docker run --rm -v /var/opt/www/${CMD_NAME}:/mnt/out runcmd:${CMD_TAG} /bin/cp -r /app/dist/. /mnt/out
ExecStartPre=+chown -R cmd /var/opt/www/${CMD_NAME}
User=cmd
Restart=on-failure

ExecStart=/usr/bin/docker run --user %u --rm --name ${CMD_NAME} -p ${CMD_PORT}:8181 \
  -e CMD_DB_FILE=/var/opt/cmdchallenge/db.sqlite3 \
  -e CMD_SET_RATE_LIMIT=true \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/opt/cmdchallenge:/var/opt/cmdchallenge \
  runcmd:${CMD_TAG}

[Install]
WantedBy=multi-user.target

```

## You probably don't need to publish images to a Docker Registry

I was doing this before but after realizing this was one more dependency that I don't actually need I am transferring images as tar files, copying them to the server and loading them.
It works out to having a `bin/deploy` shell script that does a `docker save ...`, transfer and then `docker load ...` on the remote.

## You probably don't need Cloudflare or CloudFront as a caching proxy or for HTTPs

Previously I was using Cloudflare to terminate TLS, before that I was using CloudFront and Caddy makes HTTPs so simple to setup I am happy to not be depending on it at all.
At first, I was worried about caching but since my busiest site gets between 10-20k visitors a day it's completely unnecessary.
For now, I'm still using Cloudflare but only for DNS and Caddy's [automatic HTTPs](https://caddyserver.com/docs/automatic-https) feature is so convenient.

## Using Cloudflare for Terraform state

The only thing I wasn't sure about was whether I col
## Shutting down AWS and moving to Hetzner





_This is part 1 in a 3 part series on some recent configuration changes to my side-project stack_
