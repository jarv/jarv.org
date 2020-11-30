+++
title = "Does Serverless make sense for a side project?"
tags = ["cmdchallenge"]
date = "2020-11-28"
slug = "does-serverless-make-sense"
+++

[Command Challenge](https://12days.cmdchallenge.com) has been running for over 3 years now and I would consider it one of those "serverless" architectures. The front-end services requests using API Gateway and Lambda functions and commands are forwarded to a Docker executor running on a VM.

Overall, the costs have been minimal thanks to mostly low-ish traffic and keeping it inside the AWS free-tier limits.
By "free-tier" I mean the "always-free" limits of an AWS account, since the 12 month trial period for new accounts expired quite some time ago.

Here is a 2020 update for the services that are used to run the site and a short explanation of what they do.

## Serverless Architecture

![cmd-architecture](/img/cmd-architecture.png)

Where we could probably move all of this to a single VM and reduce some of the configuration complexity, I don't think it would be any cheaper except on a shared hosting provider.

As you can see in the diagram, this project isn't completely "serverless" because a server is required for executing user-submitted commands in Docker.
For this, it's a matter of finding the cheapest VM available for this type of workload.

## Free Cloud Services

- **[GoatCounter](https://www.goatcounter.com)**: An analytics service [that respects your privacy](https://www.goatcounter.com/why#what-are-goatcounters-goals).
- **Slack**: Used to receive notifications for unique submissions and errors, useful to keep an eye on what is going on.
- **Grafana Cloud**: Grafana offers a [free starter plan](https://grafana.com/signup/starter/connect-account). This connects to Prometheus which is running on the GCP VM for monitoring Docker and node level metrics.
- **Sentry**: [Sentry.io](https://sentry.io) is very nice for side-projects, offering a free tier that I found indispensable for tracking down front-end JS errors in different browser configurations.
- **GitLab**: [GitLab.com](https://gitlab.com) drives the CI pipeline, every new commit on master updates [the testing environment](https://testing.cmdchallenge.com), with a manual promotion to prod.

## AWS - $2/month

- **CloudFront**: Used as the CDN for all requests to the site. HTTP GET requests to `/r/*` are for command submissions and are forwarded to the API Gateway. These requests are cached here, so if multiple submissions are sent for the same challenge CloudFront will return a cached response. Other requests that are not command, assets and the static page are forwarded to S3.
- **S3 bucket**:  Hosts all static content and serves as the origin for CloudFlare. Also receives periodic updates for user solutions, stored as JSON files.
- **API Gateway**: Previously REST API, this was [recently switched to the HTTP API Gateway](https://jarv.org/posts/http-api-gateway/). Accepts an HTTP request and forwards it to Lambda function for submissions.
- **Lambda**:
  - **Submission Handling**: Responsible for handling submission and rate-limiting logic. It takes a submission and forwards it to the Docker executor. If it receives the same input for a challenge that has already been evaluated, it will return a cached response
  - **Solutions Updater**: This is split into multiple Lambda functions that look up solutions and writes them to S3 as `json` files. It runs in multiple jobs because the queries to DynamoDB span many records and take awhile to run.
  - **Slack Notfications**: On every unique successful submission, or error a notification is sent to Slack. This is helpful to keep an eye on what is going on and aids troubleshooting when there are problems.
- **DynamoDB**: Every submission is stored in the database which is used for both rate limiting, and tracking correct/incorrect submissions.
- **CloudWatch Logs**: Collects logs from Lambda for debugging.
- **Event Bridge**: Previously called CloudWatch Rules, this triggers periodic events that are used to trigger a Lambda function that generates a list of user-submitted solutions.
- **Route53**: The one service that doesn't have a free tier, for .50 a month it manages the cmdchallenge.com DNS zone.
- **Amazon Certificate Manager**: Free HTTPs certificates for all of cmdchallenge.com

### Breakdown of a typical monthly bill

![aws-bill](/img/aws-bill.png)

## GCP - $6/month

![gcp-bill](/img/gcp-bill.png)

The production site uses an `e2-micro` instance costing around $6/month, this is a bit more than we need typically but it gives us some headroom when the site gets busy.
There is only a single VM which is a single-point-of-failure for the site. This can cause a bit of disruption if there is a spontaneous reboot or if an upgrade is required.
Thankfully, in GCP this is very fast, and thanks to the multiple-layers of caching (CloudFlare, DynamoDB) in the serverless stack, it only causes a problem for unique submissions that haven't been seen before.

![cpu-memory](/img/cpu-memory.png)

- Memory utilization hovers around 300MB when there isn't a lot of activity, this means that on smaller shared-core VMS like the `f1-micro` some swap is necessary.
- CPU Utilization is generally low, though it varies because traffic due to site usage tends to be bursty.

## VM Comparison for shared-core or burstable instances

This architecture spans cloud providers to keep costs low as I found GCP gives a better value for the money on VMs compared to AWS at this lower tier.
Here is a current-as-of-now overview of cheap VMs under $15 from the main cloud providers.

All of these are non-preemptable shared core instances or burst-rate limited in the case of AWS.
This means that you cannot count on using the full CPU all of the time.

| Instance           | vCPUs | Memory | Price $/month |
|--------------------|-------|--------|---------------|
| GCP f1-micro       | .2    | .6GB   | $5            |
| GCP e2-micro       | 2     | 1GB    | $6            |
| GCP e2-small       | 2     | 2GB    | $12           |
| GCP g1-small       | .5    | 1.7GB  | $12           |
| AWS t2-nano        | 1     | .5GB   | $4            |
| AWS t2-micro       | 1     | 1GB    | $8            |
| AWS LightSail      | 1     | 0.5GB  | $3.50         |
| AWS LightSail      | 1     | 1GB    | $5            |
| AWS LightSail      | 1     | 2GB    | $10           |
| Digital Ocean      | 1     | 1GB    | $5            |
| Digital Ocean      | 1     | 2GB    | $10           |
| Digital Ocean      | 2     | 2GB    | $15           |

### Notes

- For GCP, preemptable instances would be cheaper but with only one it doesn't really work since it would mean a service interruption.
- The `f1-micro` is a bit too small for the main site, I use it for the [testing environment](https://testing.cmdchallenge.com).
- AWS LightSail / Digital Ocean have basically the same offering and might also be a good fit.

For now, the main site is powered by an `e2-micro` instance for $6/month.
It offers 2 cores, which is more than the other options in the same price-range though it's not uncommon to see stalls due to CPU steal:

![cpu-steal](/img/cpu-steal.png)

It runs [Container Optimized OS](https://cloud.google.com/container-optimized-os/docs) and only runs Docker and a Prometheus exporter for node metrics.

## So, is it worth it?

From a cost perspective for now I still think so. Of course there is always a risk that something happens where my cloud spend will spiral out of control but if this were to happen I would just shut it down.
There is the meme "Wouldn't it be easier to run this on a $5 DO droplet"? I think it might apply here, though the type of workload it runs is ideal for serverless because it is a single-page app where API Gateway requests are only required for submissions.  This keeps the number of Lambda executions low.

Ignoring spend I think there are two big disadvantages to running servless. One is the complexity of gluing the cloud-native components together and keeping a configuration that is easy to manage and update.
This is solved by keeping everything in a single [terraform script](https://gitlab.com/jarv/cmdchallenge/-/blob/master/terraform/site.tf), and though updates are automatically applied in CI I think there is a rather big initial investment in getting it to work properly.

The other, bigger reason I found is that **it's difficult, if not impossible to test everything locally**,  without a lot more work which would be my number one complaint about this setup.
The way I have worked around this is to have an identical [testing environment](https://testing.cmdchallenge.com) running in parallel, this actually doesn't cost anything extra because it doesn't get any usage beyond a small amount of testing.

To sum up, while it's been fun for someone who enjoys doing infrastructure, I have been thinking about re-writing it all as a single server that run on a single VM, with sqlite as the db. I'm pretty sure it would perform better :)
