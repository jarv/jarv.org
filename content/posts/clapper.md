+++
title = "Creating a Clapper"
date = "2024-05-01"
slug = "sending claps as a service"
tags = ["go"]
draft = true
+++

Some sites have little "clap" icons that allow you to show appreciation.
I have the same little clap icon on some of my personal sites but it uses a self-hosted
service named "clapper".

Here are the features:
- Claps are tracked globally, not by page or even domain.
- We keep track of when the last clap was made and update it in real-time
- We keep track of how many claps there are and update it in real-time
- Basic rate limiting to one clap per IP every 30 seconds
