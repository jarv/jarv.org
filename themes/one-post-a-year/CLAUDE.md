# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "One Post a Year" - a lightweight Hugo theme designed for minimalist tech blogs. The theme emphasizes simplicity with features like no pagination, minimal date display, semantic HTML, and both light/dark themes using Atkinson Hyperlegible font.

## Architecture

The theme follows standard Hugo theme structure:

- `/layouts/` - Hugo templates (baseof.html, list.html, single.html, etc.)
- `/layouts/partials/` - Reusable template components (head.html, header.html, footer.html, style.css)
- `/static/` - Static assets (fonts)
- `/exampleSite/` - Demo site with example configuration and content

Key template files:
- `layouts/_default/baseof.html` - Base template with semantic HTML structure
- `layouts/partials/head.html` - HTML head section
- `layouts/partials/style.css` - Theme CSS with light/dark mode support

## Development Commands

### Local Development
```bash
# Serve the example site for development
cd exampleSite
make serve
# Or manually:
hugo server -D -F --theme ../..
```

### Theme Configuration
The theme uses `hugo.toml` configuration with these key settings:
- Code highlighting with goldmark markdown handler
- Support for 'github' and 'solarized-dark' highlight styles
- Unsafe HTML rendering enabled for flexibility

## Customization

### Extending Head/Footer
Create these files to extend the theme:
- `layouts/partials/extend-head.html` - Additional head content
- `layouts/partials/extend-footer.html` - Additional footer content

These partials are automatically included if they exist.

### Hugo Requirements
- Minimum Hugo version: 0.111.0
- Uses goldmark markdown processor
- Requires syntax highlighting with noClasses = false