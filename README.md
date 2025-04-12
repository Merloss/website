# My Personal Website & Blog

This repository contains the source code for my personal website and blog, built with [Nuxt 3](https://nuxt.com/) and styled with [Tailwind CSS](https://tailwindcss.com/).

## ✨ Features

- **Blog:** Markdown-based content management using Nuxt Content.
- **Command Palette:** Quick navigation and actions (Ctrl/Cmd + K).
- **Last.fm Integration:** Displaying current music presence (if configured).
- **Dark Mode:** Theme switching support.
- **SEO Friendly:** Meta tags automatically generated for pages and posts.
- **Responsive Design:** Adapts to different screen sizes.
- **Page Transitions & Animations:** Smooth transitions and entry animations using VueUse Motion.

## 🛠️ Technologies Used

- **Framework:** [Nuxt 3](https://nuxt.com/) (with Vue 3)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (with `@tailwindcss/typography` plugin)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Content:** [Nuxt Content](https://content.nuxt.com/)
- **Icons:** [Iconify](https://iconify.design/) (via `nuxt-icon`)
- **Utilities & Animations:** [VueUse](https://vueuse.org/) (including `@vueuse/motion`)

## 📂 Project Structure

```plaintext
.
├── assets/
│   └── css/
│       └── main.css  # Global styles and Tailwind directives
├── components/
│   ├── command-palette.vue # Command palette component
│   ├── footer.vue      # Site footer
│   ├── image.vue       # Image component with blurhash
│   ├── link.vue        # Custom link component (e.g., with UTM)
│   ├── music-presence.vue # music presence component (Last.fm)
│   └── navbar.vue      # Site navigation bar
├── constants/
│   ├── socials.ts    # Social media links
│   └── work.ts       # Work experience data
├── content/            # Markdown files for blog posts
│   └── posts/
│       └── ...
├── layouts/            # Layout files (if any, Nuxt uses app.vue by default)
├── node_modules/     # Project dependencies
├── pages/
│   ├── index.vue       # Home/About page
│   ├── posts/
│   │   ├── [id].vue    # Individual blog post page
│   │   └── index.vue   # Blog posts list page
│   └── work.vue        # Work experience page
├── public/             # Static assets (e.g., favicon, robots.txt)
├── app.vue             # Main application layout/entry point
├── error.vue           # Custom error page (e.g., 404)
├── nuxt.config.ts      # Nuxt configuration file
├── package.json        # Project dependencies and scripts
├── README.md           # This file
└── tsconfig.json       # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- A package manager: [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/), or [bun](https://bun.sh/)

### Setup

Clone the repository and install dependencies:

```bash
# Clone the repo
git clone https://github.com/merloss/website.git
cd website

# Install dependencies (choose your package manager)

# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

The server will automatically reload when you make changes to the code.

---
