import { defineContentConfig, defineCollection, z } from "@nuxt/content";
import { asSitemapCollection } from "@nuxtjs/sitemap/content";

export default defineContentConfig({
	collections: {
		content: defineCollection(
			asSitemapCollection({
				type: "page",
				source: "**/*.md",
				schema: z.object({
					title: z.string(),
					description: z.string(),
					short_description: z.string(),
					content: z.string(),
					tags: z.array(z.string()),
					image: z.string().optional(),
					blurhash: z.string().optional(),
					published_at: z.date().optional(),
				}),
			}),
		),
	},
});
