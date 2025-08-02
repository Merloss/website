# My Personal Website & Blog

This repository contains the source code for my personal website and blog, built with [Nuxt 3](https://nuxt.com/) and styled with [Tailwind CSS](https://tailwindcss.com/).

## ✨ Features

- **Blog:** Markdown-based content management using Nuxt Content.
- **Command Palette:** Quick navigation and actions (Ctrl/Cmd + K).
- **Last.fm Integration:** Displaying current music presence (if configured).
- **Dark Mode:** Theme switching support.
- **SEO Friendly:** Meta tags automatically generated for pages and posts.
- **Dynamic OG Images:** Automatically generated Open Graph images for social media sharing.
- **Responsive Design:** Adapts to different screen sizes.
- **Page Transitions & Animations:** Smooth transitions and entry animations using VueUse Motion.
- **Mermaid Renderer:** Support for rendering Mermaid diagrams within Markdown content.

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
├── @types/             # Global TypeScript type definitions
│   └── index.d.ts
├── assets/             # Uncompiled assets (CSS, fonts)
│   └── css/
│       └── main.css
├── components/         # Reusable Vue components
│   ├── command-palette-button.vue
│   ├── command-palette.vue
│   ├── content/        # Components used by Nuxt Content
│   │   └── prose-pre.vue
│   ├── footer.vue
│   ├── image.vue
│   ├── link.vue
│   ├── mermaid.vue
│   ├── music-notes.vue
│   ├── music-presence.vue
│   ├── navbar.vue
│   └── theme-switch.vue
├── composables/        # Reusable Vue composables (logic)
│   ├── socials.ts
│   ├── themes.ts
│   └── work.ts
├── content/            # Markdown content files (managed as a submodule)
│   ├── posts/          # Blog posts (submodule content)
│   └── post.md.template # Template for new posts
├── pages/              # Application pages and routes
│   ├── index.vue       # Home page
│   ├── posts/
│   │   ├── [id].vue    # Dynamic page for single post
│   │   └── index.vue   # Blog posts list page
│   └── work.vue        # Work experience page
├── plugins/            # Nuxt plugins
│   ├── medium-zoom.client.ts
│   └── mermaid.client.ts
├── public/             # Static files directly served
│   ├── favicon.ico
│   └── robots.txt
├── server/             # Server-side logic
│   ├── api/            # API routes
│   │   ├── og/         # Open Graph image generation
│   │   │   ├── simple/ # SVG-based OG images (recommended)
│   │   │   │   ├── [id].ts    # Post-specific OG images
│   │   │   │   └── index.ts   # Default OG image
│   │   │   └── [id].ts        # Legacy PNG OG images
│   │   └── track.ts    # Last.fm tracking API
│   ├── utils/          # Server utilities
│   │   └── content.ts  # Content reading utilities
│   └── tsconfig.json   # Server-specific TS config
├── .env                # Environment variables (gitignored)
├── .gitignore          # Files/directories ignored by Git
├── .gitmodules         # Submodule configuration
├── app.vue             # Main application layout/entry point
├── content.config.ts   # Nuxt Content module configuration
├── error.vue           # Custom error page (e.g., 404)
├── LICENSE             # Project license file
├── nuxt.config.ts      # Nuxt main configuration file
├── package.json        # Project manifest (dependencies, scripts)
├── README.md           # This file
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # Main TypeScript configuration
└── yarn.lock           # Yarn dependency lock file
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- A package manager: [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/), or [bun](https://bun.sh/)

### Setup

Clone the repository and install dependencies:

```bash
# Clone the repo
git clone https://github.com/merloss/website.git # if you want to get existing posts, add '--recurse-submodules' flag
cd website

# If you already cloned without submodules, initialize them:
# git submodule update --init --recursive

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
