---
title: "Projects"
showthedate: false
showfooter: false
---
<style>
.projects {
  padding: 20px;
  display: flex;
  flex-direction: column;
  text-align: justify;
}

.projects a {
    text-decoration: none;
    color: #3273dc;
    transition: text-decoration 0.3s ease;
}

.projects a:hover {
    text-decoration: underline; /* Add underline on hover */
}

.projects table {
  border-collapse: collapse;
  width: 100%;
}

.projects td {
  padding: 8px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid #000;
}

.projects td:first-child {
  text-align: right;
  padding: 0;
  padding-top: 8px;
}

.projects td:nth-child(2) {
  border-right: 2px solid #000;
}

.projects tr:last-child td {
  border-bottom: none;
}

.projects img {
  height: auto;
  width: 24px;
}

</style>

<section class="projects">
  I'm continually thinking of fun things to create in my spare time.
  More often than not, there is little time spare and no time to hack on things outside of work.
  Among a bunch of unfinished work, some of the smaller projects actually make it.

  Here is a list them I have put online over the years:

|
| --- | --- |  --- |
| 🍪 | [samesite](//samesite.diduthink.com) | Explore how the `SameSite` attribute on cookies affects browser behavior |
| <img src="/img/qr-32px.png"> | [diduthink](//diduthink.com) | Generate a feedback poll with QR code using emoji reactions |
| <img src="/img/cmd.png"> | [cmdchallenge](//cmdchallenge.com) | Challenges on the command line |
| 🌐 | [ip](//ip.jarv.org) | Responds with the IP address of the request. |
| 🤯 | [\*.resp](//500.resp.jarv.org) | Generates an http response based on the subdomain. E.g., [200](//200.resp.jarv.org), [404](//404.resp.jarv.org), [418](//418.resp.jarv.org), etc. |
| 🔓 | [nossl](//nossl.jarv.org) | Forces an http connection, sometimes useful for getting to the wifi login page, same as `neverssl.com` or `example.com`.|
| 💤 | [sleep](//sleep.jarv.org) | Sleeps for an arbitrary number of seconds or milliseconds. E.g., [1s](//sleep.jarv.org/1), [100ms](//sleep.jarv.org/100ms). |
</section>
