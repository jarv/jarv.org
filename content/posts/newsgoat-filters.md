+++
title = "Filtering YouTube Shorts from RSS Feeds"
date = "2026-04-27"
slug = "newsgoat-filters"
tags = ["newsgoat"]
+++

I subscribe to a lot of YouTube channels via RSS in [NewsGoat](https://github.com/jarv/newsgoat), and the one thing that I can't stand are Shorts.
Every channel seems to produce them now, and they clutter up the feed with content I never want to watch.

To help, I just added regex-based filters to NewsGoat to deal with this.

## Setting Up a Filter

In newsgoat, press <kbd>f</kbd> on a feed or folder to open a filter in `$EDITOR`.
The filter is a simple YAML file with regex patterns for URL, Title, and Description fields:

```yaml
# Filter for folder: YouTube
# Regexes are ANDed together. Prefix with ! to negate.
# Examples:
#   - "golang"        # items must match "golang"
#   - "!/shorts/"     # items must NOT match "/shorts/"
#
URL:
  - "!/shorts/"
Title:
Description:
```

The `!` prefix negates the pattern — items matching `!/shorts/` are excluded.
Setting this on a YouTube folder applies it to every feed inside that folder, so I only had to configure it once.

## How It Works

Filters can be scoped at three levels: **global** (<kbd>F</kbd>), **per-folder** (<kbd>f</kbd> on a folder), and **per-feed** (<kbd>f</kbd> on a feed).
They compose with AND logic, for example if you have a global filter and a folder filter, both must pass for an item to show.

The regex patterns within each field are also ANDed together, so you can stack multiple conditions:

```yaml
URL:
  - "!/shorts/"
  - "!/playlist"
Title:
  - "!LIVE"
```

This would exclude Shorts, playlists, and anything with "LIVE" in the title.

Feeds and folders with a configured filter show a `✦` indicator in the feed list, so it's easy to see where filters are active.
Items that don't match the filter are hidden from the item list — they're still in the database, just not displayed.
