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
  padding-left: 8px;
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

  In a sea of unfinished work, here is list of small projects that I have put online over the years:

  <table>
    <tr>
      <td>🐐</td>
      <td><a href="//github.com/jarv/newsgoat">NewsGoat</a></td>
      <td>Terminal-based RSS reader written in Go</td>
    </tr>
    <tr>
      <td>🍪</td>
      <td><a href="//samesite.flyemoji.com">samesite</a></td>
      <td>Explore how the `SameSite` attribute on cookies affects browser behavior</td>
    </tr>
    <tr>
      <td>💡</td>
      <td><a href="//flyemoji.com">flyemoji</a></td>
      <td>Generate a feedback poll with QR code using emoji reactions</td>
    </tr>
    <tr>
      <td><img src="/img/cmd.png" alt="Command line terminal icon"></td>
      <td><a href="//cmdchallenge.com">cmdchallenge</a></td>
      <td>Challenges on the command line</td>
    </tr>
    <tr>
      <td>🌐</td>
      <td><a href="//ip.jarv.org">ip</a></td>
      <td>Responds with the IP address of the request.</td>
    </tr>
    <tr>
      <td>🤯</td>
      <td><a href="//500.resp.jarv.org">*.resp</a></td>
      <td>Generates an http response based on the subdomain. E.g., <a href="//200.resp.jarv.org">200</a>, <a href="//404.resp.jarv.org">404</a>, <a href="//418.resp.jarv.org">418</a>, etc.</td>
    </tr>
    <tr>
      <td>🔓</td>
      <td><a href="//nossl.jarv.org">nossl</a></td>
      <td>Forces an http connection, sometimes useful for getting to the wifi login page, same as `neverssl.com` or `example.com`.</td>
    </tr>
    <tr>
      <td>💤</td>
      <td><a href="//sleep.jarv.org">sleep</a></td>
      <td>Sleeps for an arbitrary number of seconds or milliseconds. E.g., <a href="//sleep.jarv.org/1">1s</a>, <a href="//sleep.jarv.org/100ms">100ms</a>.</td>
    </tr>
  </table>
</section>
