# kerim.im

Source for [kerim.im](https://kerim.im), my personal site and blog. Built with [Astro](https://astro.build) and deployed on [Vercel](https://vercel.com).

The browser gets static HTML, one stylesheet and a few kilobytes of plain JavaScript for the effects. There is no client-side framework.

## Features

- Home page with career, stack, GitHub repos and a contribution graph, refreshed hourly with Vercel ISR
- Markdown blog with syntax highlighting ([Shiki](https://shiki.style)) and [Mermaid](https://mermaid.js.org) diagrams
- Open Graph images generated at build time with [Satori](https://github.com/vercel/satori)
- RSS feed, sitemap and robots.txt
- SQL mode toggle, scanline text effects and a particle wordmark, all on `<canvas>`
- Respects `prefers-reduced-motion`

## Getting started

```bash
git clone --recurse-submodules https://github.com/Merloss/website.git
cd website
npm install
npm run dev
```

The site runs at http://localhost:4321.

If you cloned without `--recurse-submodules`, fetch the posts with:

```bash
git submodule update --init
```

## Making it yours

All personal details live in one file, [`src/lib/site.js`](src/lib/site.js): name, role, bio, location, time zone, email, social handles, career, stack and the repo used for the commit link. Edit it, swap the logos in `public/logos/`, and the pages, meta tags, RSS feed and OG images follow.

Posts are Markdown files in `posts/`, which is a submodule pointing at [merloss/posts](https://github.com/merloss/posts). Point it at your own repo or replace it with a plain folder. Each post needs this front matter:

```yaml
---
title: "Post title"
short_description: "One line shown in lists and meta tags"
published_at: "2026-05-23T12:00:00Z"
tags: [go, postgres]
---
```

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | Recommended | Raises the GitHub API rate limit for the repo list. A fine-grained token with no permissions is enough. |

## Project structure

```text
posts/            Markdown posts (git submodule)
public/           Static files: icon, company logos
src/
  components/     Shell, contribution graph, repo cards
  layouts/        Base layout with meta tags
  lib/            Site config, posts, GitHub data, Markdown and OG rendering
  pages/          Routes, including og.png, feed.xml, sitemap.xml and robots.txt
  scripts/        Client-side effects
  styles/         Global CSS
```

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production into `.vercel/output` |

## License

[MIT](LICENSE)
