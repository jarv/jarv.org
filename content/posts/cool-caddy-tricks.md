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
The ergonomics of the config language was particularly impressive so I wanted share how simple and flexible it can be!

## HTTPs made easy

First to state the obvious, Caddy is incredible easy to configure when it comes to HTTPs.
It supports [automatic HTTPs](https://caddyserver.com/docs/automatic-https) out of the box with Let's Encrypt or Zero SSL.
With only a few lines of config you can setup a large number of sites without having to go through the certificate issuer dance, or use a CDN like CloudFlare or CloudFront to handle certificates for you.

For example, here is how simple the configuration is for this site:


```caddy
jarv.org {
  @cache path /font/*
  header @cache Cache-Control max-age=604800

  handle {
          root * /var/opt/www/jarv.org
          file_server {
            precompressed gzip
          }
  }
}
```

This does the following:
- Sets a cache-control header for `/font/` requests with a long expiry
- Tells Caddy that files under `/var/opt/www/jarv.org` serve the site, and to also to expect `.gz` files in the same directory so we can serve assets pre-compressed

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
- `echoIP` is a template, which includes the content in each block. The template is used for both HTTP and HTTPs to respond with the requester's IP address.
- Again, using the same logging snippet from above, a dedicated request log is created on disk

## Creating a subdomain that echos a HTTP status code

Finally, I was thinking that it would be handy to have a way to echo back an HTTP status code, using `curl <http status code>.resp.jarv.org`.
This requires a wildcard certificate, which is a bit more involved since it requires a DNS provider module to be compiled into Caddy (only required here for wildcard certs).

I run Caddy on a Debian server in Hetzner Cloud, with Cloudflare provisioning DNS.
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
    dns cloudflare REDACTED
  }
}
http://*.resp.jarv.org {
  import echoResp
}
```

- `REDACTED` is a CloudFlare API token with `Zone Read` and `DNS Write` permissions.
- `http.request.host.labels.3` returns whatever is used as the wildcard for `*.resp.jarv.org`.
- In addition to returning the passed in status code, it will respond in plain text whatever status code was sent.

Now, if I have want to generate a `404` I can request [404.resp.jarv.org](https://404.resp.jarv.org), or for a `500` [500.resp.jarv.org](https://500.resp.jarv.org) or any other status code as a subdomain!

**Update**: Below is the more complicated configuration running jarv.org that responds with emojis, short description, and also catches strings that are not valid HTTP response codes. Here are some example responses:

```
$ curl 200.resp.jarv.org
200 😃 OK

$ curl 201.resp.jarv.org
201 🎉 Created

$ curl 499.resp.jarv.org
499 http status code

$ curl 418.resp.jarv.org
418 🍵 I'm a teapot

$ curl herpderp.resp.jarv.org
💥 herpderp doesn't look like a valid HTTP status code!
```

And this is the Caddy configuration, that utilizes the [`map` directive](https://caddyserver.com/docs/caddyfile/directives/map) to look up the short descriptions for status codes:

```caddy
(echoResp) {
  templates
  header Content-Type "text/html; charset=utf-8"

  @valid header_regexp host Host ^([1-5]\d{2}|599)\..*

  map {http.request.host.labels.3} {status_desc} {
    100 "Continue"
    101 "Switching Protocols"
    102 "Processing"
    103 "Early Hints"
    200 "😃 OK"
    201 "🎉 Created"
    202 "Accepted"
    203 "Non-Authoritative Information"
    204 "🙅 No Content"
    205 "Reset Content"
    206 "Partial Content"
    207 "Multi-Status"
    208 "Already Reported"
    226 "IM Used"
    300 "Multiple Choices"
    301 "Moved Permanently"
    302 "Found"
    303 "See Other"
    304 "Not Modified"
    305 "Use Proxy"
    306 "Switch Proxy"
    307 "Temporary Redirect"
    308 "Permanent Redirect"
    400 "❌ Bad Request"
    401 "🔒 Unauthorized"
    402 "Payment Required"
    403 "🚫 Forbidden"
    404 "🕳️ Not Found"
    405 "Method Not Allowed"
    406 "Not Acceptable"
    407 "Proxy Authentication Required"
    408 "Request Timeout"
    409 "Conflict"
    410 "Gone"
    411 "Length Required"
    412 "Precondition Failed"
    413 "Payload Too Large"
    414 "URI Too Long"
    415 "Unsupported Media Type"
    416 "Range Not Satisfiable"
    417 "Expectation Failed"
    418 "🍵 I'm a teapot"
    421 "Misdirected Request"
    422 "Unprocessable Entity"
    423 "Locked"
    424 "Failed Dependency"
    425 "Too Early"
    426 "Upgrade Required"
    428 "Precondition Required"
    429 "Too Many Requests"
    431 "Request Header Fields Too Large"
    451 "Unavailable For Legal Reasons"
    500 "🤯 Internal Server Error"
    501 "Not Implemented"
    502 "Bad Gateway"
    503 "🚧 Service Unavailable"
    504 "Gateway Timeout"
    505 "HTTP Version Not Supported"
    506 "Variant Also Negotiates"
    507 "Insufficient Storage"
    508 "Loop Detected"
    510 "Not Extended"
    511 "Network Authentication Required"
    default "http status code"
  }

  handle @valid {
    respond <<EOF
{http.request.host.labels.3} {status_desc}

EOF {http.request.host.labels.3}
  }


  handle {
    respond <<EOF
💥 {http.request.host.labels.3} doesn't look like a valid HTTP status code!

EOF 400
  }
  import logging resp.jarv.org
}

*.resp.jarv.org {
  import echoResp
  tls {
    dns cloudflare REDACTED
  }
}

http://*.resp.jarv.org {
  import echoResp
}
```

## Forcing plain HTTP

This is something similar to [neverssl.com](http://neverssl.com), or [example.com](http://example.com), I think both of these are still used frequently when connecting to wifi when you want to get to the wifi login which required a plain http connection.
This couldn't be simpler with Caddy, below is the configuration I use for [nossl.jarv.org](http://nossl.jarv.org).

```caddy
nossl.jarv.org {
  redir http://nossl.jarv.org permanent
}

http://nossl.jarv.org {
  header Content-Type "text/html; charset=utf-8"
  header Cache-Control "no-cache, no-store, must-revalidate"
  respond <<NOSSL
<!DOCTYPE html>
<html lang="en">
<head>
<title>nossl</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔓</text></svg>">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<style>
pre {
  font-family: "Courier New", Courier, monospace;
}

div {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
<body>
<div>
<pre>
⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⣤⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀
⠀⠀⠀⣰⣿⣿⣿⠟⠉⠀⠀⠀⠈⠙⠿⣿⣿⣷⡄⠀⠀⠀
⠀⠀⢰⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⡀⠀⠀
⠀⠀⣸⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⡇⠀⠀
⠀⠀⣿⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀
⠀⠀⢿⣿⣿⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⡇⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣿⡇⠀⠀
⢠⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⣤⠀
⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠉⠉⠛⣿⣿⣿⣿⣿⣿⣿⣿⣷
⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⠀⣸⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡶⠀⠀⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿
⢻⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⠏
⠀⠙⢿⣿⣿⣿⣿⣿⡏⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⡿⠃⠀
⠀⠀⠀⠈⠛⢿⣿⣿⣶⣶⣶⣶⣶⣾⣿⣿⠿⠛⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⠛⠛⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀
</pre>
</div>
</body>
</html>
NOSSL 200
}
```
