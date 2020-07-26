+++
title = "Never use git submodules"
date = "2020-06-17"
slug = "submodules"
+++

I'm writing this as a reminder to my future self never to use git submodules. For most things I would say never say never but let's make an exception for this one.

I've used submodules for the following reasons:

* There is some logical separation or a clear defined interfaces between two things, and repos are cheap
* There is a 1 to many (usually 2 or 3) relationship between this thing (that has stable interface) and something else

The problem is that this 1-to-many thing usually starts as 1-to-2 and usually doesn't go much further than that. It's always _this could eventually increase in scale_ but usually those hunches are wrong.

So where does it fall down? It seems like it rarely works well:

* Cognitive overhead for multiple git commands to keep things updated
* Doing normal things with git (conflict resolution, reviews, etc) feels super clumsy
* With reviews, it often means reviewing multiple times and messes up approval workflows
* It's 2020 and this process still looks unnecessarily complex https://stackoverflow.com/questions/1260748/how-do-i-remove-a-submodule

My alternative for now for better gitops workflows is mono-repo everything, this seems to work better with CI anyway
