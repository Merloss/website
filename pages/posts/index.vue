<template>
    <div class="py-12 px-4 sm:px-6 lg:px-8">
        <h1 v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            class="text-4xl font-bold mb-10 text-center text-gray-900 dark:text-gray-100">
            All Posts
        </h1>

        <div v-if="posts && posts.length" class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <article v-for="(post, index) in posts" :key="post.path" v-motion :initial="{ opacity: 0, y: 50 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200 + index * 100 } }"
                class="flex flex-col bg-white/50 dark:bg-black/30 rounded-lg shadow-md overflow-hidden backdrop-blur-sm border border-white/10">
                <NuxtLink v-if="post.image" :to="post.path" :aria-label="`Go to ${post.title} post`">
                    <Image :src="post.image" :alt="post.title || 'Post image'" class="w-full h-24 object-cover"
                        :width="600" :height="100" :blurhash="post.blurhash" disableZoom />
                </NuxtLink>

                <div class="p-6 flex flex-col flex-grow">
                    <NuxtLink :to="post.path" :aria-label="`Go to ${post.title} post`">
                        <h2
                            class="text-2xl font-semibold mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-gray-900 dark:text-white line-clamp-2">
                            {{ post.title }}
                        </h2>
                    </NuxtLink>

                    <p v-if="post.short_description"
                        class="text-gray-600 dark:text-gray-400 mb-4 flex-grow line-clamp-3 text-sm">
                        {{ post.short_description }}
                    </p>

                    <div
                        class="text-sm text-gray-500 dark:text-gray-500 mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                        <time v-if="post.published_at" :datetime="post.published_at.toString()">
                            {{ formatDate(post.published_at.toString()) }} • {{ (post.meta.readingTime as
                                ReadingTime)?.text }}
                        </time>
                        <div v-if="post.tags && post.tags.length > 0" class="mt-2 flex flex-wrap gap-2">
                            <span v-for="tag in post.tags" :key="tag"
                                class="bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded-sm text-xs font-medium text-gray-700 dark:text-gray-300">
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                </div>
            </article>
        </div>

        <div v-else-if="posts && posts.length === 0" class="text-center text-gray-500 dark:text-gray-400">
            Loading posts...
        </div>

        <div v-else class="text-center text-gray-500 dark:text-gray-400">
            No posts found.
        </div>
    </div>
</template>

<script setup lang="ts">

definePageMeta({
    name: 'Posts',
    icon: 'material-symbols:newspaper',
    shortcuts: ['G', 'P']
});

useSeoMeta({
    title: "All Posts",
    description: "A list of all blog posts.",
    ogTitle: "All Posts",
    ogDescription: "A list of all blog posts.",
});

const { data: posts } = await useAsyncData(() =>
    queryCollection("content").select("title", "short_description", "published_at", "tags", "image", "blurhash", "path", "meta").order("published_at", "DESC").all(),
);

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch (e) {
        return "";
    }
};
</script>