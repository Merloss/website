<template>
    <div class="h-full w-full flex items-start justify-start bg-white relative overflow-hidden">
        <div class="absolute inset-0 w-full h-full pointer-events-none"
            style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMiIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+'); background-size: 30px 30px;">
        </div>

        <div class="absolute inset-0 border border-gray-200"></div>
        <div class="relative z-10 p-20 w-full h-full flex flex-col justify-between">
            <div class="flex-1 flex flex-col">
                <h1 class="text-6xl font-bold text-gray-900 leading-tight mb-4">
                    {{ post.title }}
                </h1>

                <p v-if="post.short_description" class="text-3xl text-gray-600 leading-relaxed mb-4">
                    {{ post.short_description }}
                </p>

                <p v-if="readingTime" class="text-lg text-gray-600 mt-auto">
                    📖 {{ readingTime.text }}
                </p>
            </div>

            <div v-if="post.tags && post.tags.length > 0" class="mt-8">
                <div class="flex flex-wrap gap-4">
                    <span v-for="(tag, index) in post.tags.slice(0, 4)" :key="index"
                        class="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm font-medium text-gray-700">
                        {{ tag }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ContentCollectionItem } from '@nuxt/content';

const { post, readingTime } = defineProps<{ post: ContentCollectionItem, readingTime: ReadingTime }>()
</script>