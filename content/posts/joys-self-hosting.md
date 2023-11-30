+++
title = "The joys of self-hosting and tiny side-projects"
date = "2024-12-01"
slug = "joys-self-hosting"
draft = true
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
Below are five examples of tiny side-projects, some no more than webserver configuration that either serves a small practical need or written for fun.


<div class="proj">

|
|:--- |:--- |
| 🌐 [ip.jarv.org](//ip.jarv.org) | Responds with the client IP |
| 🤯 [\*.resp.jarv.org](//500.resp.jarv.org) | Generates an http response based on the subdomain. E.g., [200](//200.resp.jarv.org), [404](//404.resp.jarv.org), [418](//418.resp.jarv.org), etc. |
| 🔓 [nossl.jarv.org](//nossl.jarv.org) | Forces an http connection, sometimes useful for getting to the wifi login page |
| 💤 [sleep.jarv.org](//sleep.jarv.org) | Sleeps for an arbitrary number of seconds or milliseconds. E.g., [3s](//sleep.jarv.org/1), [100ms](//sleep.jarv.org/100ms) |
| 👍 [like.jarv.org](//like.jarv.org) | Timer that resets when pressed that serves no purpose. |

</div>

The main reason for this is that it makes learning something new fun to complete something small and self-contained.
I think the main benefit is tiny side-projects can be a forcing-function to learn new things that I wouldn't learn otherwise.
For example when writing front-end code there is always a bit more I learn about css media queries since I don't spend much time in the front-end and the landscape is constantly changing.
Or another is that I just learned that there is no browser enforced CORS with websockets, and I also figured out how to properly respond to a pre-flight cors request.

_Read more about some of these on the post about [cool caddy config tricks](/posts/cool-caddy-config-tricks/)._

### Self-hosting

At one point I would have never considered hosting a simple static site like this blog on a VM but now that I have it there it makes a lot more sense than putting it on object storage or using a static site service like GitHub Pages.
Self-hosting a static site, in myc ase monitoring with Prometheus, Grafana, collecting logs with Loki, gives a nice consolidated view into a bunch of small services and

<!-- --- -->

<!-- ### Self hosted service -->

<!-- | -->
<!-- | --- | -->
<!-- | Grafana, Loki, Prometheus | -->
<!-- | GoatCounter | -->
