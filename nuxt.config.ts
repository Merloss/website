import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },

	app: {
		head: {
			htmlAttrs: {
				lang: "en",
			},
		},
	},
	modules: [
		"@nuxt/content",
		"@nuxt/fonts",
		"@nuxt/icon",
		"@nuxtjs/color-mode",
		"@unlazy/nuxt",
		"@vueuse/motion/nuxt",
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
		LASTFM_USERNAME: process.env.LASTFM_USERNAME,
		LASTFM_WEB_API_KEY: process.env.LASTFM_WEB_API_KEY,
	},
});
