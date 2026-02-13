+++
title = "Neovim Configuration for 2026"
date = "2026-02-13"
slug = "neovim-config-2026"
+++

<style>
table {
  border-collapse: collapse;
  width: 100%;
}
td {
  padding: 10px;
  text-align: left;
  border: 1px solid gray;
}
</style>

A year after my [last Neovim configuration post](/posts/neovim-config/), I've made another significant change to how I manage my setup.
This time, I switched from [kickstart-modular.nvim](https://github.com/dam9000/kickstart-modular.nvim) to [MiniMax](https://github.com/echasnovski/MiniMax), a minimal configuration built on top of the [mini.nvim](https://github.com/echasnovski/mini.nvim) ecosystem.

## Why I Switched

While I was happy with `kickstart-modular.nvim`, the upstream project (`kickstart.nvim`) appears to be [no longer actively maintained](https://github.com/nvim-lua/kickstart.nvim/issues/1821).
There is [an effort to maintain a fork](https://github.com/oriori1703/kickstart-modular.nvim/tree/maintained-upstream-modular), but I decided to explore alternatives rather than rely on a community fork.

MiniMax embraces the `mini.nvim` philosophy of having small, focused, well-integrated plugins.
It's actively maintained by the author of `mini.nvim` itself, and provides a solid foundation that's both minimal and fully-featured.

## My Configuration and Workflow

1. I maintain my [own fork](https://github.com/jarv/MiniMax) of [MiniMax](https://github.com/echasnovski/MiniMax).
2. I apply my customizations in a [single commit](https://github.com/echasnovski/MiniMax/compare/main...jarv:MiniMax:main).
3. I periodically pull in upstream changes, staying up-to-date with improvements while keeping my modifications intact.

This workflow continues to work well for me, it's the same approach I used with `kickstart-modular.nvim`.

## What Changed in the Migration

The transition from `kickstart-modular.nvim` to MiniMax was surprisingly smooth because both configurations share similar philosophies.
Here are the key differences I encountered:

| Feature | Before (kickstart-modular) | After (MiniMax) |
|---------|----------------------------|-----------------|
| Plugin Management | `lazy.nvim` | `mini.deps` (simpler, more integrated) |
| File Explorer | `telescope.nvim` for file browsing | `mini.files` (lightweight, tree-style interface) |
| Auto-completion | `nvim-cmp` with multiple completion sources | `mini.completion` (simpler, built-in) |
| Configuration Structure | Multiple Lua files in `lua/custom/` directory | Single customization file at `configs/nvim-0.11/plugin/50_custom_plugins.lua` |

## Customizations

I continue to keep my customizations minimal. MiniMax already includes most of what I need through its carefully selected `mini.nvim` modules and a few additional plugins like LSP support, Tree-sitter, and formatters.

Here are the plugins and customizations I added on top of MiniMax:

| Plugin/Feature | Description |
|----------------|-------------|
| [mason.nvim](https://github.com/mason-org/mason.nvim) | LSP server package manager. Makes it easy to install and manage language servers. |
| [clipboard-image.nvim](https://github.com/dfendr/clipboard-image.nvim) | Paste images directly from clipboard into Markdown posts—essential for my blog workflow. |
| [opencode.nvim](https://github.com/NickvanDyke/opencode.nvim) | AI-powered code assistant integrated with my terminal. Mapped to `<Leader>c` prefix. |
| Spell checking | Custom commands (`:Spell`, `:NoSpell`, `:SpellToggle`) with auto-enable for Markdown files. |
| Custom formatters | Added formatters for Caddy, Markdown, JSON, and shell scripts to `conform.nvim`. |

### Additional Customizations

Beyond plugins, I made several configuration tweaks:

1. **Buffer Navigation:** Mapped `<Tab>` and `<Shift-Tab>` to cycle through buffers.
2. **Mouse Behavior:** Changed from `mouse='a'` to `mouse='nci'` to disable visual selection mode while keeping other mouse features.
3. **Diagnostic Display:** Enhanced inline diagnostics with custom icons (✘ for errors, ▲ for warnings) and a `<Leader>od` toggle.
4. **Relative Line Numbers:** Enabled with `vim.o.relativenumber = true` (commented out in base config).
5. **Shell Integration:** Set default shell to `/usr/bin/zsh` for `:term` commands.
6. **Hidden Characters:** Commented out `vim.o.list = true` to hide tab characters.

## Plugins I No Longer Need

Some plugins from my `kickstart-modular.nvim` setup became unnecessary with MiniMax:

- [**bufferline.nvim**](https://github.com/akinsho/bufferline.nvim): MiniMax's `mini.tabline` provides similar functionality
- [**karen-yank.nvim**](https://github.com/tenxsoydev/karen-yank.nvim): I have a love/hate relationship with this plugin. For now I'm going to go back to the default cut/paste behavior.
- [**rose-pine.nvim**](https://github.com/rose-pine/neovim): Using the default MiniMax colorscheme (though I may add this back)
- [**vim-fugitive**](https://github.com/tpope/vim-fugitive): `mini.git` covers most of my Git workflow needs

## Thoughts on the Switch

I'm impressed with how cohesive MiniMax feels. The `mini.nvim` ecosystem provides a surprisingly complete feature set with minimal overhead.
The configuration is easier to understand because most functionality comes from a single, well-documented plugin family.

The main trade-off is that some `mini.nvim` modules are less feature-rich than their standalone counterparts (e.g., `mini.completion` vs `nvim-cmp`).
However, I've found the simpler implementations to be sufficient for my needs, and the performance benefits are noticeable.

If you're looking for a minimal, maintainable Neovim configuration in 2026, I highly recommend giving [MiniMax](https://github.com/echasnovski/MiniMax) a try.
You can see my complete configuration with customizations [here](https://github.com/jarv/MiniMax).
