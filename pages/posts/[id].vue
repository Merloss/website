<template>
    <article v-if="page" class="prose dark:prose-invert py-12 dark:text-white max-w-screen post-detail-content">

        <h1 v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            class="mb-4 text-4xl font-bold lg:text-5xl">
            {{ page.title }}
        </h1>

        <div v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300 mb-8">
            <time v-if="page.published_at" :datetime="new Date(page.published_at).toISOString()">{{
                formatDate(new Date(page.published_at).toISOString()) }}</time>
            <span v-if="page.published_at && page.tags && page.tags.length > 0">•</span>
            <div v-if="page.tags && page.tags.length > 0" class="flex flex-wrap gap-2">
                <span v-for="tag in page.tags" :key="tag"
                    class="bg-gray-300 dark:bg-white/10 px-2 py-0.5 rounded-sm text-xs font-medium text-gray-700 dark:text-gray-300">
                    {{ tag }}
                </span>
            </div>
        </div>

        <Image v-if="page.image" v-motion :initial="{ opacity: 0, y: 50 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }" :blurhash="page.blurhash" :src="page.image"
            :alt="page.title || 'Blog post image'" class="w-full h-64 sm:h-96 object-cover rounded-lg mb-8" />

        <ContentRenderer :value="page" v-motion :initial="{ opacity: 0, y: 50 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }" />

    </article>
    <div v-else class="text-center py-12">
        <p>Post not found.</p>
    </div>
</template>

<script setup lang="ts">
import Image from '~/components/image.vue';

const { id } = useRoute().params;

const { data: page } = await useAsyncData(() => queryCollection('content').path(`/posts/${id}`).first())


if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const site = useSiteConfig();
const origin = String(site.url).replace(/\/$/, '');
const postUrl = `${origin}/posts/${id}`;
const publishedAt = page.value.published_at
    ? new Date(page.value.published_at).toISOString()
    : undefined;

useSeoMeta({
    title: () => page.value?.title || 'Blog Post',
    description: () => page.value?.short_description || 'An interesting blog post.',
    ogTitle: () => page.value?.title || 'Blog Post',
    ogDescription: () => page.value?.short_description || 'An interesting blog post.',
    ogType: 'article',
    ogLocale: 'tr_TR',
    articlePublishedTime: publishedAt,
    articleAuthor: ['Kerim Kara'],
    articleTag: () => page.value?.tags,
    twitterCard: 'summary_large_image',
    twitterTitle: () => page.value?.title || 'Blog Post',
    twitterDescription: () => page.value?.short_description || 'An interesting blog post.',
});

// The posts are written in Turkish while the rest of the site is English.
useHead({
    htmlAttrs: { lang: 'tr' },
    script: [
        {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BlogPosting',
                headline: page.value.title,
                description: page.value.short_description,
                inLanguage: 'tr-TR',
                datePublished: publishedAt,
                dateModified: publishedAt,
                keywords: page.value.tags,
                image: page.value.image ? `${origin}${page.value.image}` : undefined,
                mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
                author: { '@type': 'Person', name: 'Kerim Kara', url: origin },
                publisher: { '@type': 'Person', name: 'Kerim Kara', url: origin },
            }),
        },
    ],
});

defineOgImageComponent('post', { post: page.value, readingTime: page.value.meta.readingTime as ReadingTime })

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

</script>

<style scoped>
.prose p,
.prose-invert p {
    margin-top: 1.5em;
    margin-bottom: 1.5em;
}

.post-detail-content :deep(h1),
.post-detail-content :deep(h2),
.post-detail-content :deep(h3) {
    position: relative;
    padding-left: 1.25em;
    margin-left: -1.25em;
    scroll-margin-top: 6.25rem;
}

.post-detail-content :deep(h2::before),
.post-detail-content :deep(h3::before) {
    content: '#';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    font-weight: 600;
    font-size: 0.9em;
    color: #9ca3af;
}

.dark .post-detail-content :deep(h2::before),
.dark .post-detail-content :deep(h3::before) {
    color: #6b7280;
}

.post-detail-content :deep(h2:hover::before),
.post-detail-content :deep(h3:hover::before) {
    opacity: 1;
}
</style>
