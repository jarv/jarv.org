+++
title = "One huge shell script 😱😱😱"
date = "2023-09-11"
slug = "one-huge-shell-script"
tags = ["snowflake"]
+++

There are a lot of DevOps tools for managing both configuration and infrastructure as code.
While some can be extremely helpful for managing configuring for a large distributed service, not all are as helpful for deploying something simple in the cloud, or a personal project that runs on a single virtual machine.

---

| IaC or a configuration thingy | $job | personal stuff |
|:--- | ---:| ---:|
| Kubernetes | ✅ | ❌ |
| Configuration management (Ansible, Chef, etc.) | ✅ | ❌ |
| CI pipelines for code | ✅ | ❌ |
| CI pipelines for infra | ✅ | ❌ |
| Code reviews | ✅ | ❌ |
| Changes without downtime | ✅ | ❌ |
| Docker registry | ✅ | ❌ |
| Prebuilt machine images | ✅ | ❌ |
| Cloud "appliances", load balancers, hosted DB, etc.| ✅ | ❌ |
| CDN (CloudFlare/CloudFront) | ✅ | ❌ |
| Hosted Git | ✅ | ✅ |
| Terraform  | ✅ | ✅ |
| One friggin huge shell script 😱😱😱 | ❌ | ✅ |

---

Over time, my approach to using tooling for my personal projects has changed.
From a high level, my own lessons have been:

- Avoid complexity for troubleshooting, monitoring and logging by leaning too much on "severless" components.
- For the same reason, putting everything on a single VM is "good enough" for most applications.
- CDN is probably not necessary unless you are very worried about downtime, self-hosting static files is just as easy as hosted options.
- Put all of the infrastructure configuration (scripts, IaC, etc) in a single repository.
- Avoid cloud dependencies in general, make it work locally and then replicate that on a virtual machine as close as possible.
- Use a minimal base image and avoid putting complexity or configuration in user-data scripts.

This resulted in what I have now, which is a single VM provisioned in Hetzner Cloud where everything is configured in a single shell script and most services run in Docker containers.

Before converting to a single VM, I would do something like this any time I had an experiment or idea to play around with:

1. Create a new AWS account.
1. Create a bucket for Terraform state
1. Terraform configuration for CloudFront, Lambda, EC2, Route53, etc.
1. In the user-data script configuration the image from scratch to support running docker and create systemd unit files.
1. In the CI pipeline copy a binary, or tag a new docker image for every push to master.
1. Deploy the container using a public or private registry, pull the new image on the instance with a systemd unit configuration to manage the service.

For this to work, A lot of complexity was baked into the user-data script associated with the instance.
It also meant keeping track of multiple AWS accounts (usually using the free-tier resources) and then possibly paying money if an EC2 instance was required after the free-tier ended.
Often, there would be a separate testing environment which was ephemeral, that spun up an identical instance and cloud configuration.

My current approach of a single VM eliminates the need for AWS and a lot of complexity that comes along with it. For the configuration management part of it, I was confronted with the following questions:

1. How do I deal with configuration drift if manual changes are made on the instance while it is running?
2. Will it be possible to rebuild a single VM from scratch easily, and without much downtime?
3. If there will be multiple containers running on the instance, does it make sense to any container orchestration?
4. How much should be automated in CI if I am the only person deploying changes?
5. Should I depend on a container registry?

## My approach to managing the single VM deployment

The questions above lead me to the following approach for configuration management when deploying to a single VM:

- [Caddy](https://caddyserver.com/) is the main webserver. It has a lot of great features including automatic HTTPs and some other great features that I talked about in a [recent post](/posts/cool-caddy-config-tricks/).
- For packages, add them to the VM and simply [update the packages in cloud-init](https://cloudinit.readthedocs.io/en/latest/reference/examples.html#install-arbitrary-packages) as I go, there is no extra boot logic other than installing packages.
- For other manual changes, maintain a single bash script that is idempotent, so all changes are made in a single script and the script can be re-run when it is updated.
- Run almost everything in Docker and use Systemd for service management including stopping and starting docker containers.
- Use (self-hosted) Prometheus, Grafana for monitoring.
- Don't lean too much (or at all) on CI pipelines, run deploys locally.
- To deploy and update individual services that are built using Docker, dump and copy the image directly to the VM instead of pushing it to a public registry.

## The big shell script

I keep one repository named `config-mgmt` that has the following content:
- Terraform for provisioning an instance, and configuring DNS in CloudFlare
- A directory named `files/`, this has all of my OS configuration files like Systemd unit files, Caddy config files, and a single big shell script called `bootstrap`.
- A shell script named `configure` that runs `rsync` to sync everything under `files/` to the single VM and then after the sync runs the script named `bootstrap`.

The `bootstrap` script along with all files in `files/` are rsync'd to the VM first.
Then `bootstrap` is run which does all the little shell maintenance stuff like ensuring services are enabled, installing and configuring things that run on the VM, reloads SystemD, etc.
The script ends up being around 500 lines of bash, a dozen or so simple functions that are called in sequence at the end of the script.

If I have a new project to deploy to my single VM I simply create a new `config_` function, add it to the script and in most cases create a small `bin/deploy` shell script in the project's repository that dumps and imports the docker container to the host.

## Using Docker and a single VM for side-projects

There is no Docker container orchestration in this setup, just a bunch of Systemd unit files for starting Docker containers with Caddy configurations to route traffic to them.
I do however not run everything in Docker, on the VM I run the following services:

- Prometheus for collecting node metrics and for scraping application metrics
- Grafana for dashboarding
- Self-hosted GoatCounter for web stats

## Rebuilding my single VM from scratch

This is something that is important as you don't want to create a "snowflake" that will be impossible to recreate.
To make this work in Terraform I maintain a list of servers and an "active server".

```terraform
locals {
  servers       = ["lisa", "bart"]
  active_server = "lisa"
}
```
I can add a new server to the list to create a new one, and then switch the active to the new one I created which points all of the service DNS entries to it.
