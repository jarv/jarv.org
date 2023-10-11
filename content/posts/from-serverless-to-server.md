+++
title = "From serverless to server"
tags = ["cmdchallenge"]
date = "2021-09-29"
slug = "from-serverless-to-server"
+++

I'm pleased to announce that the transition from a distributed serverless architecture in Python to a single VM with a service written in Go is done for [CMDChallenge](https://cmdchallenge.com).
The final patch was merged and there is nothing sweeter than removing close to 100K lines of vendored Python.

It was around [4 months ago](/posts/go-rewrite-cmdchallenge/) that I started on this adventure but honestly a lot of life got in the way and I probably spent a total of around 4 full days of work for the transition.
Overall, I'm quite satisfied with the result, as you can see here many of the "cloud native" services went *poof*

![single server arch](/img/cmd-single-server-arch.png)

What enabled this was moving all of the dispatching to the same server that was running containers for commands.
I realize now in hindsight that other than wanting to play around with API gateway when I first built this, there was really no good reason why I shouldn't have done this from the beginning.
Like many side-projects, I guess this turned into a yak-shave where you start thinking about how you can use one cloud service, which eventually turns into ten.

A quick summary of the "new" architecture for those who are curious:

- There is now a single Go service that is responsible for both request handling and launching Docker containers. Previously I was using AWS Lambda and issuing commands to a remote Docker server.
- I still front this with Cloudflare but I removed all command caching at the edge. Every single request goes down to the VM where a Go service is running and returns a cached result (using sqlite) if it was already sent.
- Using Cloudflare means I can use AWS certificates for HTTPs, the origin for Cloudflare is an EC2 instance
- Instead of DynamoDB, I keep the command cache locally on the instance in an SQLite db which is much better and faster for lookups. A backup is periodically kept and restored on instance creation.

Before, querying solutions from Lambda out of Dynamodb was too slow so I needed to cache solutions with a Lambda cronjob.
Now, with a local SQLite db, they are generated in the context of a request.
For example, [this request](https://cmdchallenge.com/c/s?slug=hello_world) is generated with:

```
SELECT
    cmd
    FROM challenges
        WHERE slug=$1 and correct=1
        ORDER BY LENGTH(cmd) LIMIT 50;
```

I can't overstate how nice this is compared to do doing very slow lookups over the network to Dynamo.

Previously I was using CloudWatch alerts and logs, now I have logs going to journald and using Prometheus for metrics.
I also got rid of GoatCounter for anlaytics, because most people have ad blockers anyway, not sure how useful it was. I quickly burned through Sentry's free useage cap so I went ahead and removed that as well.

With Prometheus running the VM for metrics, it's now more convenient to add metrics for everything imaginable for executing commands:

![processed-cmds](/img/processed-cmds.png)

![req-per-min](/img/req-per-min.png)

![cmd-errors](/img/cmd-errors.png)

Another benefit that came out of this is that now it is much easier to validate and run locally, if you want to run the entire site yourself check out https://gitlab.com/jarv/cmdchallenge.
