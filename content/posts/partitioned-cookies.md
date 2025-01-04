+++
title = "Notes on Cookie partitioning"
date = "2025-01-05"
slug = "cookie-partitioning"
tags = ["TIL"]
+++

Browser Cookie partitioning has been gradually rolled out for major browsers, and these are some notes on changes I observed with cookie handling.
This post assumes you have a basic understanding of how HTTP cookies work.

### What is Cookie Partitioning?

This feature targets analytics providers, specifically those that drop the same cookie in your browser when visiting multiple domains.

Let's assume you are loading two webpages, one on `siteA.com` and another on `siteB.com`.  
Both sites make requests to an analytics provider on `analytics.com`.


Without partitioning, when you visit `siteA.com` and get a cookie from `analytics.com`, and then later visit `siteB.com`, which also makes a request to `analytics.com`, `analytics.com` will receive the same cookie that was received from `siteA.com`. This is one of the primary reasons why browsers often block third-party cookies.

With partitioning, the browser maintains partitioned cookie stores so that `analytics.com` can't access the same cookie for both domains.

### Why is the `partitioned` Attribute Necessary?

What I found a bit confusing is why we need a `partitioned` attribute on cookies if this is a browser feature? The purpose of the attribute is to signal to the browser that the cookie works with browser partitioning. Without it, the browser might reject the cookie outright by default.

This leads to a behavior change I noticed recently with Firefox, where cookies **without** the `partitioned` attribute coming from a different domain were being rejected.

<img src="/img/partitioned-false.png" style="width:350px">

Here none of the IFrame cookies are received due to them coming from another domain. This results in a message in the dev console:

> cookie has been rejected because it is foreign and does not have the “Partitioned“ attribute.

Before, I believe this was just a warning. 
I've updated the [samesite testing sandbox](https://samesite.surveymoji.com) with the option to enable and disable `partitioned` cookies to play around with this.
