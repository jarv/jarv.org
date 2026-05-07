+++
title = "My RSS client has an MCP server"
date = "2026-05-05"
slug = "rss-mcp"
tags = ["newsgoat"]
+++

Although the days of RSS are far behind us, it remains one of the few ways left to curate your own garden of content on the internet.
There's no algorithm deciding what you see or optimized feed pushing rage bait to the top (like the terrible trend of short-form video content).

In [a previous post](/posts/use-rss), I mentioned how I am using RSS to monitor individual files or directories in GitHub and GitLab repositories, like tracking changes to a `CHANGELOG`, a `package.json`.
My RSS client is configured with tech blogs belonging to people I know, some interesting ones I find randomly, YouTube channel feeds, GitLab activity feeds, and some traditional news sources.

Because for me, all of this content sits in a local database, already fetched and cached it makes it a perfect candidate for an [MCP](https://modelcontextprotocol.io/) server.

## Why MCP + RSS

MCP (Model Context Protocol) lets AI assistants call tools to retrieve information.
An RSS reader that exposes its cached articles via MCP essentially gives an AI assistant access to your curated view of the world.

Some examples of what this enables and how I am using it:

- "Summarize all GitLab activity from the last week"
- "Were there any changes to the Go release notes this month?"
- "What's been happening in my news feeds today?"

The responses end up being grounded in content that I've already chosen to follow instead of a global web search.

## Implementation

I don't see terminal based readers implementing this yet, but I assume it is going to catch on given how useful it is.
If you know of ones that do have this already please let me know!
In the meantime, I added this to my customized news reader [newsgoat](https://github.com/jarv/newsgoat).
This reader of is highly tailored to myself, and might not be for everyone.
With that said, if you have used or are using newsbeuter/newsboat you should give it a test drive!

The MCP implementation exposes four tools:

- **`search_articles`** — full-text search across titles, descriptions, and content with a time window
- **`list_recent_articles`** — list recent articles, filterable by folder or feed name
- **`get_article`** — get the full content of a specific article
- **`list_feeds`** — list all feeds with their folders and unread counts

The configuration for an MCP client:

```json
{
  "newsgoat": {
    "command": ["newsgoat", "mcp-server"]
  }
}
```

The MCP server opens the same SQLite database as the TUI, runs read-only queries, and returns results as text.

So I think every RSS client should do this and hope it catches on.
If you are not using RSS or maybe if you used to use RSS but gave up on it, I would encourage you to give it another look!
