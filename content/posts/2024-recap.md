+++
title = "2024 recap"
date = "2025-02-01"
slug = "2024-recap"
tags = ["recap"]
draft = true
+++

This is my first yearly recap as a blog entry and since there are a lot of thoughts going through my head about my own computing adventures in 2024 I thought it would be nice to write them down.

1. Rediscovery of frontend development that has made it fun.

In 2023 I would have told anyone that [vite](https://vite.dev/guide/) was the best thing ever to happen to fronted development, especially for those who don't like frontend development.
Vite was great even for writing vanilla project without a framework.
That included writing typescript instead of JS, which I took the time back then to convert some previous projects to typescript from js.

In 2024 I decided to stop reaching for typescript and instead I'm on the no-build JS train, writing plain es2017 js.
No more intermediate js files, no map files, it's a lot simpler and the reduced complexity has been refreshing especially in the complex world of frontend.

For all js I now only use [esbuild](https://esbuild.github.io/getting-started/) for minifying and bundling with `es2017` as a target.
This last year I also stumbled into using [htmx](https://htmx.org/) and [Alpine.js](https://alpinejs.dev/) for handling all state logic in the browser.
The latter has been great for projects like [samesite](https://samesite.surveymoji.com) and [surveymoji](https://surveymoji.com) where there is suprisigingly little js needed on the frontend for creating sites that are interactive.

2. Go backend development for websites

Some specific features in Go this year have been great for my own usage:

- `logger/slog` in Go 1.21 (released August, 2023) but it took some time for me to move over to it.
- `net/http` routing improvements in Go 1.22 was good enough so that I am only using the stlib for routing

The main change in my backend development has been using `embed.FS` to always release Go projects a single binary.
Following this change, I stopped altogether running Go applications in containers on the single VM that hosts all my personal projects, instead I copy a binary that runs on systemd for each project.

I learned that [URL fragments are not sent to the server over HTTP](https://stackoverflow.com/questions/25489843/http-server-get-url-fragment) early in 2024, then forgot and ran into the same issue at the end of the year. 🤦

I adopted using the [`tools.go` pattern](https://marcofranssen.nl/manage-go-tools-via-go-modules) since I have been using more project specific tooling like [sqlc](https://github.com/sqlc-dev/sqlc).

3. Single VM for all my personal projects

Still using a single Hetzner cloud ARM VM 8GB/4CPU for 7.32eu/month. This is way more than I need and I might downgrade, but it's not that expensive for hosting everything I have.

![](/img/uptime-krusty.png)
_Yes, that is an uptime of over 1 year._

My setup didn't change that much since last year, I still have

- Prometheus for metric collection
- Grafana / loki for dashboards and logs
- Self hosted Goatcounter for analytics
- Systemd unit files for services running under different usernames, or in containers using Docker
- Configuration management with a script written in Bash 😬

One thing I discovered about analytics is that adblockers will match common collection paths (even on the same domain!) so I needed to do a re-write to cloak the stats endpoint.

- embed.FS go
- html fragments
- typescript
- frontend development
- samesite cookies
- centering
- websockets and sse
- bin/ dir

4. Using [Mise](https://github.com/jdx/mise) for all the things

This [was already a separate blog post](https://jarv.org/posts/mise/) which covers the details but this has resulted in me changing my project structure for the better. I no longer have a `bin/` dir in projects with a collection of misc scripts, or a `Makefile` for running them. Of course the binary version management is great too.

5. Lessons in web development

I learned some new things this year that maybe I should have known, or maybe not? Some things always seem more obvious in hindsight.

A lot of painful moments were had over the `SameSite` attribute in browser cookies which led me to write a [playground](https://samesite.surveymoji.com). 
What led me there was the Cookie behavior when entering a site via a QR code, which is something I talk about in a bit more detail [in a blog post](https://jarv.org/posts/samesite/).

I never had written program that used websockets. My first attempt was a simple counter, and from that I learned about server sent events and realized I didn't need websockets.


6. Developing a browser game


