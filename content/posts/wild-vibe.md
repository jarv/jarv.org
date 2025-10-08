+++
title = "The wild vibe"
date = "2025-10-08"
slug = "wild-vibe"
tags = ["newsgoat", "go"]
+++

It's wild that these days you can vibe code an entire app in the same time it would previously take to contribute a single feature.
Take the RSS reader I use regularly, Newsboat.
It always had a few stability issues and was only about 80% there as far as the features I wanted in a terminal-based reader.
There were other alternatives that came along, but nothing matched what I was used to layout-wise.
While there were a few things I would have liked to improve, I never had the will or time to contribute any improvements myself.

That all changed recently with Claude, as it suddenly became very easy to bootstrap a new project and create a very polished-looking TUI application in Go with barely any effort.
In about a single day, I created a TUI RSS reader alternative [NewsGoat](https://github.com/jarv/newsgoat) and couldn't be happier with the results.
Not only was it extremely satisfying to have full control over every single feature that I wanted in the TUI, but it was actually less effort and hassle than contributing new features to the existing project.

Consider the two options:

1. Create a fork of an open source project, refactor and remove the features you don't want, add the new features you do.
2. Create a brand new project from scratch and add only the features you want.

Now what is wild is that with vibe coding, (2) is not only possible to do but is often more straightforward and easier than (1).
I can also choose the language I want to use, the build process, toolchain, distribution, and the boring parts of bootstrapping the project, creating build scripts, and workflows are all done by AI without even opening a text editor.

Here has been my experience with this and other projects to efficiently create new projects from scratch:

- Pick an implementation that I am already familiar with. For me, this is usually Go and/or JavaScript.
- Create a project README that outlines exactly the features you want and be as specific as possible on implementation constraints. For example, for Go projects that require state, I will be specific about the database driver and specify to use [sqlc](https://sqlc.dev/).
- Create the barebones scaffolding of the project in addition to the README. This includes bringing in all the common dependencies for lint checking and [mise](https://mise.jdx.dev/) for task management.

I've been doing this so often recently that I even created a [vibe-kickstart](https://github.com/jarv/vibe-kickstart/) template for bootstrapping new (web-based) projects that use Go and JavaScript.

That's it, and if you want to try out a kick-ass terminal-based RSS reader try [NewsGoat](https://github.com/jarv/newsgoat)!
