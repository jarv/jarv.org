+++
title = "Go rewrite of cmdchallenge"
tags = ["cmdchallenge"]
date = "2021-07-05"
slug = "go-rewrite-cmdchallenge"
+++

I've decided to take what was written years ago for [cmdchallenge.com](https://cmdchallenge.com) and port it to a single Go app. This is a pretty big change because I will be removing most of the AWS serverless components including API Gateway, Dynamo and possibly CloudFront.
In the process, I would also like to simplify the architecture a bit. It seems like a single process with Docker running locally, and a db like sqlite should be sufficient. Here are some notes for the transition:

- This will be a small program and I'm pretty sure I won't need any frameworks for the REST server
- I'll need to do some lex parsing of the submission, https://pkg.go.dev/github.com/google/shlex should work.
- 1 years worth of data is about 300K unique entries in the submission table, in dyamoDB this is about 300MB of data.
- Currently I'm keeping track of every single request in a larger submissions table that is used for rate limits, I think this won't be necessary anymore since I can implement in-memory rate limiting without a tracking database.
- I recently moved the runner from Go to [Nim](https://nim-lang.org/), but I think I'll stick with Nim for now for the runner.
- I would like to look into exporting some metrics to prometheus as well via a `/metrics` endpoint

So first thing to do is create a schema for commands:

```
    CREATE TABLE `commands` (
      `fingerprint` TEXT,
      `challenge_slug` TEXT,
      `cmd` TEXT,
      `cmd_length` INT,
      `correct` BOOL,
      `create_time` INT,
      `output` TEXT,
      `source_ip` TEXT,
      `resp` TEXT
    );

```

- We will use the fingerprint of the command as the primary key for fast cache lookups
- Scans on the sqlite db will be much cheaper than against dynamodb (in both time and money) so I don't think we need a sort key like we did for DyamoDB

On removing Cloudflare caching, I think it will be interesting to remove it altogether, I assume that cache lookups in sqlite will be performant enought to bypass the extra caching layer.
