+++
title = "Centering an emoji character on a button"
date = "2024-08-15"
slug = "unable-to-center-an-emoji"
tags = ["flyemoji"]
+++

One of my emoji-based side-projects has button elements and centering emoji characters on them is a key part of the design.

My initial thought was that this would be simple for a single emoji character by setting font-family, font-size and line-height for consistent centering. 
I mean, how complicated can it be, right?

Once I had things looking decent on chrome/firefox/safari it seemed as though my work was done, but then I pulled up the page on Linux/Firefox and my
nice centering shown here:

![](/img/EmojiOSX.png)
_Firefox/Chrome/Safari on OSX_

looked something like this :(

![](/img/EmojiLinux.png)
_Firefox on Linux_

Around this time I read [Hardest Problem in Computer Science: Centering Things](https://tonsky.me/blog/centering/) and realized that maybe I shouldn't spend too much time on it.

As an alternative, I thought to bundle a font like [Noto Emoji](https://fonts.google.com/noto/specimen/Noto+Emoji) but seeing how many MB it would add to page I decided not to go that route.

In the end I only needed around 30 emojis, so the simplest workaround was to take my emojis used for the layout and convert them to images.
Following that all was well again and I was even able to let people select multiple emoji types (google, apple, facebook, openemoji).

If you want to see the new image based emoji layout in action [check it out here](https://flyemoji.com).
