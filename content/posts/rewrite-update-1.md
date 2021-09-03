+++
title = "Update on the Golang rewrite"
tags = ["cmdchallenge"]
date = "2021-09-02"
slug = "rewrite-update-1"
+++

I've been stealing small chunks of time in the evening here and there and finally have a functioning Go rewrite of cmdchallenge which will replace all of the Python code that is running in AWS Lambda.

The first diff for this is massive, I am really looking forward to removing all of this vendored Python!

[![large-diff](/img/large-diff.png)](https://gitlab.com/jarv/cmdchallenge/-/merge_requests/165/)

And we will say goodbye to some AWS services:

- Cloudflare
- Route53
- <s>DynamoDB</s> Replaced with an sqlite DB
- <s>Lambda</s> Now written as a Go service running on a VM
- <s>CloudWatch</s> Not needed
- <s>API Gateway</s> Not needed

What I didn't expect during this rewrite was the joy of having everything running locally, including end-to-end tests in Go. It's quite nice to be able to validate requests and being able to test using a browser locally without having to go through Lambda in the cloud.

Since a VM for the runner was already a requirement, I will likely stick the new web service on the same VM and keep a local SQLite DB.
What I haven't figured out yet, is how to manage persistence so that I can rebuild the single VM without losing any (or too much) data.
Right now, I'm thinking something as simple as a shutdown script that syncs to object storage, and reads on provision.
