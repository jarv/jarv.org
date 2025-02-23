+++
title = "Neovim Configuration for 2025"
date = "2025-02-23"
slug = "neovim-config"
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

Here are some notes on how my Neovim configuration management evolved in the last year.
For longtime Vim → Neovim users like me who prefer a simple and sane way to manage their configuration, I highly recommend [kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim) as a starting point.
It provides a minimal yet functional configuration that is easy to understand, making it ideal for those who don't want to commit to a pre-built template without knowing what it does.

## My Configuration and Workflow

1. I maintain my [own fork](https://github.com/jarv/kickstart-modular.nvim) of [kickstart-modular.nvim](https://github.com/dam9000/kickstart-modular.nvim).
   This is essentially `kickstart.nvim`, but structured into directories rather than a single `init.lua`, making it easier to manage.
2. I apply my customizations in a [single commit](https://github.com/dam9000/kickstart-modular.nvim/compare/master...jarv:kickstart-modular.nvim:master).
3. I periodically pull in upstream changes, allowing me to stay up-to-date with core plugins while maintaining my modifications.

## Customizations

I try to keep my customizations on top of `kickstart.nvim` minimal and avoid having too many plugins in general.
Even though I customize it a bit, the base plugins might be all you need as it already includes the essentials like plugin management, LSP, and general quality-of-life improvements for writing code.

Here are seven plugins that I add on top of ones included in `kickstart.nvim`:

| Plugin | Description |
|--------|-------------|
| [bufferline.nvim](https://github.com/akinsho/bufferline.nvim) | Displays open buffers as tabs at the top of the session. I find this helpful for keeping track of my open buffers but there are a lot of different methods to do that. |
| [clipboard-image.nvim](https://github.com/ekickx/clipboard-image.nvim) | Useful for quickly inserting images into Markdown blog posts via copy/paste. |
| [cmp-spell](https://github.com/f3fora/cmp-spell) | Adds spell-checking suggestions to `nvim-cmp` auto-completion. |
| [karen-yank](https://github.com/tenxsoydev/karen-yank.nvim) | Prevents deletions (`D`, `dd`) from copying content into the paste register, making yanking more explicit. |
| [key-analyzer.nvim](https://github.com/meznaric/key-analyzer.nvim) | Provides a quick overview of key mappings. |
| [rose-pine.nvim](https://github.com/rose-pine/neovim) | My current colorscheme. |
| [vim-fugitive](https://github.com/tpope/vim-fugitive) | Git integration for Neovim. |

In addition to these plugins, I have several customizations to the base config that enhance my workflow:

1. **Backups:** I enable backups using `set backup`, which has saved me a few times.
1. **Buffer Navigation:** I map `<Tab>` and `<Shift-Tab>` to switch between buffers, which pairs well with `bufferline.nvim`.
1. **Auto-complete:** I add `hrsh7th/cmp-buffer` to `cmp.lua` to enable auto-completion of words from open buffers.
1. **Mini.nvim Enhancements:** While `kickstart.nvim` includes some [`mini.nvim`](https://github.com/echasnovski/mini.nvim) plugins, I also add `mini.indentscope`, `mini.icons`, and `mini.files`.
1. **Telescope Optimization:** I modify `telescope.lua` so that when inside a Git repository, searches start from the repository root.
1. **Relative Line Numbers:** I set `vim.opt.relativenumber = true` for relative line numbering.
1. **Mouse Behavior:** I disable visual selection with the mouse, as I find it more disruptive than helpful.

Not many changes to be honest, and I've been really happy with this setup so far.
If you would like to see the configuration in its entirety, it can be viewed [here](https://github.com/jarv/kickstart-modular.nvim).
