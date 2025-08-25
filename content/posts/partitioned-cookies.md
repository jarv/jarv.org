+++
title = "Notes on Cookie partitioning"
date = "2025-01-05"
slug = "cookie-partitioning"
tags = ["TIL"]
+++

The `Partitioned` attribute on browser Cookies is supported on Firefox and Chrome and these are some notes on changes I observed recently with it, and how these browsers handle Cookies. This post assumes you have a basic understanding of how HTTP cookies work.

### What is Cookie Partitioning?

This feature targets analytics providers, specifically those that drop the same cookie in your browser when visiting multiple domains.

Let's assume you are loading two webpages, one on `siteA.com` and another on `siteB.com`.  
Both sites make requests to an analytics provider on `analytics.com`.


Without partitioning, when you visit `siteA.com` and get a cookie from `analytics.com`, and then later visit `siteB.com`, which also makes a request to `analytics.com`, `analytics.com` will receive the same cookie that was received from `siteA.com`. This is one of the primary reasons why browsers often block third-party cookies.

With partitioning, the browser maintains partitioned cookie stores so that `analytics.com` can't access the same cookie for both domains.

### How are Browsers Using the `Partitioned` Attribute?

Here, we can see that how the browser treats `Secure` and `Paritioned` is quite different depending on the browser.

<style>
table {
  border-collapse: collapse;
  width: 100%;
}
td {
  padding: 10px;
  text-align: center;
  border: 1px solid gray;
}
tr:last-child td {
}
.grayscale {
    filter: grayscale(1);
    display: inline-block; /* Ensures the filter applies properly to inline content */
}
</style>

This table shows what cookies are stored with different values for `SameSite` in the browser after a web request.

(These screenshots are taken from one of the [SameSite scenarios on this cookie playground](https://samesite.flyemoji.com/#explain1))
| (S) | (P) | Chrome (131.0.6778.205) | Firefox (133.0.3)* |
| --- | --- | --- | --- |
| **t**  | **t** | <img src="/img/S=trueP=true-Chrome.png" style="width:200px"> | <img src="/img/S=trueP=true-Firefox.png" style="width:200px"> |
| **t**  | **f** | <img src="/img/S=trueP=false-Chrome.png" style="width:200px"> | <img src="/img/S=trueP=false-Firefox.png" style="width:200px"> |
| **f** | **t** | <img src="/img/S=falseP=true-Chrome.png" style="width:200px"> | <img src="/img/S=falseP=true-Firefox.png" style="width:200px"> |
| **f** | **f** | <img src="/img/S=falseP=false-Chrome.png" style="width:200px"> | <img src="/img/S=falseP=false-Firefox.png" style="width:200px"> |

- `Browser Cookies`: request sent to the same Domain
- `IFrame Cookies`: request sent to a different Domain
- 🍪: Cookie received in the browser
- <span class="grayscale">🍪</span>: Cookie not received in the browser
- **(S)**: `Secure` attribute
- **(P)**: `Partitioned` attribute

_*Firefox is running in Strict mode_

Some surprising differences seen here:

1. With `Secure=true` and `Partitioned=true`, if the `SameSite` attribute is not set, third party cookies will not be stored. This is due to Chrome treating the default `Samesite` value as `Lax`.
1. We see the descrepency for `Secure=true` and `Partitioned=false` for the same reason.
1. With `Secure=false` and `Partitioned=true`, Chrome does not store cookies, regardless of the `SameSite` value.
1. With `Secure=false` and `Partitioned=false`, Chrome does store cookies, but none from a different Domain.

### Why is the `partitioned` Attribute Necessary?

What I found a bit confusing is why we need a `partitioned` attribute on cookies if this is a browser feature? The purpose of the attribute is to signal to the browser that the cookie works with browser partitioning. Without it, the browser might reject the cookie outright by default.

> cookie has been rejected because it is foreign and does not have the “Partitioned“ attribute.

Before, I believe this was just a warning. 
I've updated the [samesite testing sandbox](https://samesite.flyemoji.com) with the option to enable and disable `partitioned` cookies to play around with this.
