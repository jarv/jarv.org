+++
title = "Monitor a single file on GitHub/GitLab with RSS"
date = "2025-10-20"
slug = "use-rss"
tags = ["newsgoat", "til"]
+++

I've been using RSS to monitor single files or directories on GitHub and GitLab for a long time, and it still surprises me when people don’t know this is possible.
Granted, not everyone uses RSS so that part isn't surprising, but it is quite a convenient way to keep track of files in repositories without having to manage email notifications for the entire project.

Why would you do this?

For one, I find it nice to track updates to `README.md` files in a repository, a `CHANGELOG`, or a file that tracks dependencies like `package.json` or `Gemfile`.*

Both GitHub and GitLab give you the ability to do this easily, and it works on both individual files and directories containing them.

- For `GitHub` adding `.atom` to the end of the file will give you the atom feed ([example](https://github.com/golang/go/commits/master/README.md.atom)).
- For `GitLab` you can create a feed by adding `?format=atom` to the end of the file ([example](https://gitlab.com/gitlab-org/gitaly/-/commits/master/README.md?format=atom)).

This works for both public and private repositories, for private repositories it requires a `?feed_token=xxxxx` query parameter.
However, you shouldn't expose your feed token to a third party website, so if it is necessary I would only use a local feed application.

---

_* It is possible to do this with a site like [github-file-watcher.com](https://app.github-file-watcher.com/) if you really want to do this with email notifications._
