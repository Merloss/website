import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },

	app: {
		head: {
			htmlAttrs: {
				lang: "en",
			},
			meta: [
				{
					name: "description",
					content:
						"Kerim Kara is a developer and writer. He develops websites and writes about technology. Click to learn more!",
				},
				{
					name: "keywords",
					content:
						"kerim, kerim.im, kerim kara, turkiye, developer, writer, technology, web development, programming",
				},
				{ name: "author", content: "Kerim Kara" },
				{
					name: "application-name",
					content: "Personal Website of Kerim Kara",
				},
				{ property: "og:url", content: "https://kerim.im" },
				{ property: "og:type", content: "website" },
				{ property: "og:title", content: "Kerim Kara" },
				{
					property: "og:description",
					content:
						"Kerim Kara is a developer and writer. He develops websites and writes about technology. Click to learn more!",
				},
				{ name: "twitter:card", content: "summary_large_image" },
				{ property: "twitter:domain", content: "kerim.im" },
				{ property: "twitter:url", content: "https://kerim.im" },
				{ name: "twitter:title", content: "Kerim Kara" },
				{
					name: "twitter:description",
					content:
						"Kerim Kara is a developer and writer. He develops websites and writes about technology. Click to learn more!",
				},
			],
		},
	},
	modules: [
		"@nuxtjs/sitemap",
		"@nuxt/content",
		"@nuxt/fonts",
		"@nuxt/icon",
		"@nuxtjs/color-mode",
		"@unlazy/nuxt",
		"@vueuse/motion/nuxt",
		"nuxt-og-image",
	],

	css: ["~/assets/css/main.css"],
	fonts: {
		google: {},
		families: [{ name: "Rubik", provider: "google" }],
	},

	vite: {
		plugins: [tailwindcss()],
	},

	colorMode: {
		preference: "system",
		classSuffix: "",
	},

	content: {
		build: {
			markdown: {
				remarkPlugins: {
					"remark-reading-time": {},
				},
				highlight: {
					langs: ["go", "js", "ts", "bash"],
					theme: {
						default: "github-light",
						dark: "github-dark",
					},
				},
			},
		},
	},

	runtimeConfig: {
		// Private: Only accessible on server-side, NOT exposed to client
		LASTFM_USERNAME: process.env.LASTFM_USERNAME,
		LASTFM_WEB_API_KEY: process.env.LASTFM_WEB_API_KEY,
		GITHUB_USERNAME: process.env.GITHUB_USERNAME,
		GITHUB_REPOSITORY_NAME: process.env.GITHUB_REPOSITORY_NAME,
		// Cloudflare R2 Configuration (Server-side only, secure)
		R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
		R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
		R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
		R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
	},
});
