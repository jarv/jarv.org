+++
title = "The joys of self-hosting and tiny side-projects"
date = "2023-12-01"
slug = "joys-self-hosting"
tags = ["go", "snowflake"]
+++

<style>

div.proj table {
  border-collapse: collapse;
  width: 100%;
}
div.proj td {
  padding: 10px;
  text-align: center;
  vertical-align: top;
  border-bottom: 1px solid #000;
}
div.proj td:nth-child(odd) {
  border-right: 2px solid #000;
}
div.proj td:first-child {
  white-space: nowrap;
}
div.proj tr:last-child td {
  border-bottom: none;
}

</style>
### Tiny side-projects

Lately there hasn't been much time in my life for recreational programming but I still find time to create tiny services and put them on the public internet.
I'm sure this stretches the definition of "side-projects", but one advantage of having a VM somewhere in the cloud and a registered domain is you can create your own little kingdom of subdomains.
Below are some examples of tiny side-projects, some no more than webserver configuration that either serves a small practical need or written for fun.


<div class="proj">

|
|:--- |:--- |
| 🌐 [ip.jarv.org](//ip.jarv.org) | Responds with the IP address of the request. |
| 🤯 [\*.resp.jarv.org](//500.resp.jarv.org) | Generates an http response based on the subdomain. E.g., [200](//200.resp.jarv.org), [404](//404.resp.jarv.org), [418](//418.resp.jarv.org), etc. |
| 🔓 [nossl.jarv.org](//nossl.jarv.org) | Forces an http connection, sometimes useful for getting to the wifi login page, same as `neverssl.com` or `example.com`.|
| 💤 [sleep.jarv.org](//sleep.jarv.org) | Sleeps for an arbitrary number of seconds or milliseconds. E.g., [1s](//sleep.jarv.org/1), [100ms](//sleep.jarv.org/100ms). |
| 👍 [like.jarv.org](//like.jarv.org) | Timer that resets when pressed that serves no purpose other than I wanted to play with implementing a websocket in Go. |

</div>

I was thinking recently about doing little projects like this, and I think that not only does it make learning something new fun, but it is also nice to simply build something that is very small and self-contained.
More than anything else it ends up being a forcing-function to learn new things that I wouldn't learn otherwise.
For example, when writing front-end code there is always a bit more I learn about css media queries since I don't spend much time in the front-end and the landscape is constantly changing.
Or another is that I just learned that there is no browser enforced CORS with websockets, and I also figured out how to properly respond to a pre-flight cors request.

_Read more about some of these on the post about [cool caddy config tricks](/posts/cool-caddy-config-tricks/)._

### Self-hosting

At one point I would have never considered hosting a simple static site like this blog on a VM but now that I host this static blog on a VM I would recommend it over hosting a static site on object storage or using service like GitHub Pages.
For one, you have more control over access, headers, responses, caching, etc.
Another reason to consider self-hosting is that it used to be a pain to deal with SSL certificates but this has gotten so much easier with webservers like [Caddy](https://caddyserver.com/) that come with out-of-the-box support for LetsEncrypt.

As far as spending money, self-hosting a static site, running a webserver, and running services in Docker containers can be done a small VM for around 5eu/month (or less!).
Once you have your own server you can self-host applications you write yourself or select from a large selection of open-source services.
I run all of the following on the same host:

- Prometheus and node exporter
- Loki for logs
- Grafana
- GoatCounter

Self-hosting analytics (e.g., [GoatCounter](https://www.goatcounter.com)) means you know you will be seeing an accurate view of traffic since browser ad-blockers won't block requests.
Collecting metrics with Prometheus, dashboarding with Grafana , and log management with Loki gives a nice consolidated view into all the services running on the host.
There is nothing is quite as as simple as running everything on a single VM with systemd managing monitoring, logging and application services with docker.
