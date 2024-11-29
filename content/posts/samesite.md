+++
title = "TIL: Using Strict for the SameSite attribute"
date = "2024-05-27"
slug = "samesite"
tags = ["TIL"]
+++

I was building a site that uses QR codes that when scanned take the user back to the same site.
For example, if the site was `https://example.com` the QR code would bring them to `https://example.com/qr` like this:

<img src="/img/qr-code-samesite.png" style="width:350px">

The site uses a session cookie that is necessary to track user settings for anonymous users.
Initially, I set the `SameSite` attribute to `Strict` on the cookie.
What was not obvious to me then was how SameSite treats QR code navigation.
For the browser, this is no different than a clicking link from a different site, even though you are scanning a QR code.

Here is a high level description of the different values for `SameSite` on a browser cookie:
<style>

div.samesite table {
  border-collapse: collapse;
  width: 100%;
}
div.samesite td {
  padding: 10px;
  text-align: center;
  vertical-align: top;
  border-bottom: 1px solid #000;
}
div.samesite td:nth-child(odd) {
  border-right: 2px solid #000;
}
div.samesite td:first-child {
  white-space: nowrap;
}
div.samesite tr:last-child td {
  border-bottom: none;
}

</style>
<div class="samesite">

|
| :--- | :--- |
| Strict | Cookies are only sent in a first-party context or **navigating directly to a site**. |
| Lax | Cookies are sent in some cross-site contexts, but not with embedded content. |
| None | Cookies are sent in all contexts, including cross-origin requests |
| (not set) | If the SameSite attribute is not specified, the behavior is browser dependent. |

</div>

Scanning a QR code does not count "navigating directly to a site", instead it is a navigation event from a _different site_.
The problem with using `Strict` is that after page load following the QR code scan, the session cookie was not sent to the server.
This meant I was unable to load the user's default settings on the first page load.

The solution was to set the `SameSite` attribute to `Lax`.
This covers this QR code navigation scenario.
After fixing the issue, I was curious about what other things don't count as direct navigation in the context of `SameSite`.
This led me create a sandbox for testing SameSite behavior.
[Check it out here](https://samesite.surveymoji.com).
