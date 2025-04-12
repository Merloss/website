<template>
	<div class="py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-3xl mx-auto">
			<div class="text-center mb-12">
				<h1 v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
					class="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
					About Kerim Kara
				</h1>
				<p v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
					class="mt-3 text-xl text-gray-600 dark:text-gray-400">
					Software Developer
				</p>
				<MusicPresence v-motion :initial="{ opacity: 0, y: 50 }"
					:enter="{ opacity: 1, y: 0, transition: { delay: 300 } }" />
			</div>

			<div class="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 space-y-8">

				<section v-motion :initial="{ opacity: 0, y: 50 }"
					:enter="{ opacity: 1, y: 0, transition: { delay: 400 } }">
					<p>I am Kerim Kara
						(<span class="italic">a.k.a <span class="metallic font-semibold">merloss</span></span>), a
						passionate Software Developer based in Turkiye. I specialize in Backend systems and enjoy
						creating efficient, scalable, and user-friendly applications. I am always eager to learn new
						technologies and improve my skills.
					</p>
				</section>

				<section v-motion :initial="{ opacity: 0, y: 50 }"
					:enter="{ opacity: 1, y: 0, transition: { delay: 500 } }">
					<h2>Work Experience</h2>
					<div v-for="work in WORK" :key="work.company"
						class="m-2 sm:px-8 border-2 border-dashed dark:border-white/10 border-black/10 p-4 rounded-md transition-all duration-300">
						<div class="flex flex-col m-0">
							<NuxtLink :to="work.link" target="_blank" rel="noopener noreferrer"
								class="font-bold text-3xl">
								{{ work.company }}
							</NuxtLink>
							<div class=" flex flex-col ml-1.5 mt-1">
								<i class="text-sm text-gray-500"> {{ work.location }}</i>
								<span class="text-sm text-gray-500">{{ work.start_date }} - {{ work.end_date }}</span>
							</div>
						</div>
						<p class="text-md">{{ work.short_description }}</p>
					</div>
				</section>

				<section v-motion :initial="{ opacity: 0, y: 50 }"
					:enter="{ opacity: 1, y: 0, transition: { delay: 600 } }">
					<h2>Latest Blog Posts</h2>
					<NuxtLink v-for="post in posts" :key="post.path" :to="post.path" class="size-0.5">
						<div
							class="text-sm border border-dashed border-black/20 hover:border-black/30 dark:border-white/20 dark:hover:border-white/30 transition-all duration-300 p-3 rounded-md m-2 flex flex-col">
							<h3 class="!m-0 flex justify-between">
								{{ post.title }}
								<Icon name="material-symbols:arrow-forward" class="text-gray-500 self-end text-xl" />
							</h3>
							<p class="text-gray-500 !m-0">{{ post.short_description }}</p>

						</div>
					</NuxtLink>

				</section>

				<section v-motion :initial="{ opacity: 0, y: 50 }"
					:enter="{ opacity: 1, y: 0, transition: { delay: 700 } }">
					<h2>Connect</h2>
					<p>Feel free to connect with me through the following platforms:</p>
					<ul>
						<li v-for="social in SOCIALS" :key="social.name">
							<Link :href="social.url" target="_blank" rel="noopener noreferrer"
								class="text-primary-600 dark:text-primary-400 hover:underline">
							{{ social.name }}
							</Link>
						</li>
					</ul>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Link from '~/components/link.vue';

definePageMeta({
	name: 'Home',
	icon: 'material-symbols:house',
	shortcuts: ['G', 'H']
});

useSeoMeta({
	title: 'About Kerim Kara',
	description: 'Learn more about Kerim Kara, a software developer based in Turkiye.',
	ogTitle: 'About Kerim Kara',
	ogDescription: 'Learn more about Kerim Kara, a software developer based in Turkiye.',
});

const { data: posts } = await useAsyncData(() =>
	queryCollection("content").select("title", "short_description", "published_at", "path").order("published_at", "DESC").limit(3).all(),
);
</script>

<style scoped>
@reference "assets/css/main.css";

.prose a {
	@apply text-gray-900 dark:text-gray-100 no-underline;
}
</style>