+++
title = "Cool Caddy config tricks for your self-hosted domain"
date = "2023-08-23"
slug = "cool-caddy-config-tricks"
tags = ["snowflake", "caddy"]
+++

Very recently I switched from running a couple side-projects that were hosted on AWS EC2 to a single [Hetzner Cloud](https://www.hetzner.com/cloud) VM.
During that transition, this page (jarv.org) was moved to it from GitHub pages.
Static generation using [Hugo](https://gohugo.io) stayed the same, but in the process of switching VMs I checked out [Caddy](https://caddyserver.com/) as a new webserver.
After making the switch, this ended up being a great NGINX replacement for all the sites hosted on what is now a single VM.
The ergonomoics of the config language was particularly impressive so I wanted share how simple and flexible it can be!

## HTTPs made easy

First to state the obvious, Caddy is incredible easy to configure when it comes to HTTPs.
It supports [automatic HTTPs](https://caddyserver.com/docs/automatic-https) out of the box with Let's Encrypt or Zero SSL.
With only a few lines of config you can setup a large number of sites without having to go through the certificate issuer dance, or use a CDN like CloudFlare or CloudFront to handle certificates for you.

For example, here is how simple the configuration is for this site:


```caddy
(logging) {
  log {
    output file /var/log/caddy/{args.0}.access.log {
        roll_size 100mb
        roll_keep 20
        roll_keep_for 720h
    }
  }
}

jarv.org {
  @cache path /font/*
  header @cache Cache-Control max-age=604800

  handle {
          root * /var/opt/www/jarv.org
          file_server {
            precompressed gzip
          }
  }
  import logging jarv.org
}
```

This does the following:
- Sets a cache-control header for `/font/` requests with a long expiry
- Tells Caddy that files under `/var/opt/www/jarv.org` serve the site, and to also to expect `.gz` files in the same directory so we can serve assets pre-comressed
- Instead of using the journal for access logs (Caddy is run under systemd), write site specific logs to a directory on disk and rotate them.

This will automatically redirect HTTP requests to HTTPs, which is likely what you want most of the time.
If you want to have a plain HTTP version and HTTPs version that is possible too, for that see the next example.

## Creating a site that echos an IP address

There are some sites that I sometimes use to echo my public IP like `curl ifconfig.io`.
With Caddy, it's very simple to replicate this with a Caddy configuration, so I replicated it with `curl ip.jarv.org`.

Caddy has a simple [`respond` directive](https://caddyserver.com/docs/caddyfile/directives/respond), here is how [`ip.jarv.org`](https://ip.jarv.org) echos your IP address:

_Note: This uses the new heredoc syntax in version 2.7.0_

```caddy

(echoIP) {
  templates
  header Content-Type text/plain

  respond <<EOF
{{.RemoteIP}}

EOF 200

  encode zstd gzip
  import logging ip.jarv.org
}

ip.jarv.org {
  import echoIP
}
http://ip.jarv.org {
  import echoIP
}
```

- Instead of only `ip.jarv.org` there are two servers, `ip.jarv.org` and `http://ip.jarv.org` for HTTP and HTTPs requests. This is so we don't automatically redirect HTTP to HTTPs which is nice for using `curl` on the command line.
- `echoIP` is a template, which includes the content in each block. The template is used for both HTTP and HTTPs toadd adds a header and respond with the requester's IP address.
- Again, using the same logging snippet from above, a dedicated request log is created on disk

## Creating a subdomain that echos a HTTP status code

Finally, I was thinking that it would be handy to have a way to echo back an HTTP status code, using `curl <http status code>.resp.jarv.org`.
This requires a wildcard certificate, which is a bit more involved since it requires a DNS provider module to be compiled into Caddy (only required here for wildcard certs).

I run Caddy on a debian server in Hezner Cloud, with Cloudflare provising DNS.
Caddy is installed using the [Caddy debian package](https://caddyserver.com/docs/install#debian-ubuntu-raspbian), and `xcaddy` to install the [Cloudflare DNS provider module](https://github.com/caddy-dns/cloudflare).
The module is compiled using `xcaddy` and there is [great documentation](https://caddyserver.com/docs/build#package-support-files-for-custom-builds-for-debianubunturaspbian) for how to properly incorporate your custom build using the Debian package.

Here is the configuration for responding with any specified HTTP status code:

```caddy
(echoResp) {
  templates
  header Content-Type text/plain

  respond <<EOF
{http.request.host.labels.3}

EOF {http.request.host.labels.3}
  encode zstd gzip
  import logging resp.jarv.org
}

*.resp.jarv.org {
  import echoResp
  tls {
    dns cloudflare $CF_API_TOKEN_CADDY_DNS
  }
}
http://*.resp.jarv.org {
  import echoResp
}
```

- `$CF_API_TOKEN_CADDY_DNS` is a CloudFlare API token with `Zone Read` and `DNS Write` permissions.
- `http.request.host.labels.3` returns whatever is used as the wildcard for `*.resp.jarv.org`.
- In addition to returning the passed in status code, it will respond in plain text whatever status code was sent.

Now, if I have want to generate a `404` I can request [404.resp.jarv.org](https://404.resp.jarv.org), or for a `500` [500.resp.jarv.org](https://500.resp.jarv.org) or any other status code as a subdomain!
