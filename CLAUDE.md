# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is jarv.org - a personal tech blog built with Hugo static site generator using a custom theme called "one-post-a-year". The site focuses on tech posts, side projects, and programming tutorials with a minimalist design philosophy.

## Development Commands

### Local Development
```bash
# Start Hugo development server
hugo server -D -F

# Start development server with drafts and future posts
hugo server -D -F --bind 0.0.0.0 --baseURL http://localhost:1313

# Build the site for production
hugo --gc --minify

# Build with specific environment
hugo --environment production
```

### Content Management
```bash
# Create a new post
hugo new posts/post-name.md

# View site structure
hugo list all
```

## Architecture

### Directory Structure
- `content/` - Markdown content files
  - `posts/` - Blog posts in markdown format
  - `projects.md` - Projects page
  - `contact.md` - Contact page
- `layouts/` - Custom layout overrides
  - `partials/extend-head.html` - Custom head content (analytics, favicon)
  - `partials/extend-footer.html` - Custom footer content
  - `shortcodes/` - Custom Hugo shortcodes
- `static/` - Static assets (images, JS)
- `themes/one-post-a-year/` - Custom Hugo theme
- `config/` - Hugo configuration files
- `public/` - Generated static site (build output)

### Configuration
- Main config: `config/_default/hugo.toml`
- Production config: `config/prd/hugo.toml`
- Theme uses goldmark markdown processor with syntax highlighting
- Custom shortcodes: `smdemo` and `cachebust`

### Theme Architecture
The site uses a custom Hugo theme located in `themes/one-post-a-year/` with:
- Semantic HTML structure
- Light/dark theme support
- Atkinson Hyperlegible font
- Minimal design with no pagination or social icons
- Custom CSS in theme partials

### Custom Features
- Analytics integration via GoatCounter
- Custom favicon (keyboard emoji)
- Cache-busting for assets via `cachebust` shortcode
- Survey/demo integration via `smdemo` shortcode
- Image resizing utility script in `bin/convert`