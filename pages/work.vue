<template>
    <div class="py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100">
        <h1 v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            class="text-4xl font-bold mb-8 text-center">
            Work Experience
        </h1>

        <div class="max-w-3xl mx-auto space-y-8">
            <div v-for="(work, index) in WORK" :key="index" v-motion :initial="{ opacity: 0, y: 50 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200 + index * 150 } }"
                class="bg-white/50 dark:bg-black/30 p-6 rounded-lg shadow-md backdrop-blur-sm border border-white/10">
                <h2 class="text-2xl font-semibold mb-2">{{ work.title }}</h2>
                <NuxtLink :to="work.link" target="_blank" rel="noopener noreferrer"
                    class="text-lg font-medium text-primary-600 dark:text-primary-400 mb-1 italic">
                    {{ work.company }}
                </NuxtLink>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ work.start_date }} - {{ work.end_date }}</p>

                <div v-if="work.description_items && work.description_items.length > 0">
                    <div class="overflow-hidden transition-[max-height] duration-500 ease-in-out relative"
                        :style="{ maxHeight: isExpanded(index) ? '500px' : '6rem' }">
                        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line py-1">
                            {{ work.description_items.join('\n\n') }}
                        </p>
                        <div v-if="!isExpanded(index)"
                            class="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-white/80 dark:from-black/80 to-transparent pointer-events-none">
                        </div>
                    </div>

                    <button @click="toggleExpand(index)"
                        class="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline focus:outline-none">
                        {{ isExpanded(index) ? 'Show Less' : 'Show More' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'Work',
    icon: 'material-symbols:card-travel',
    shortcuts: ['G', 'W']
});

useSeoMeta({
    title: 'Work Experience',
    description: 'My work experience',
    ogTitle: 'Work Experience',
    ogDescription: 'My work experience',
});

const expandedCards = ref(new Set<number>());

const toggleExpand = (index: number) => {
    if (expandedCards.value.has(index)) {
        expandedCards.value.delete(index);
    } else {
        expandedCards.value.add(index);
    }
};

const isExpanded = (index: number): boolean => {
    return expandedCards.value.has(index);
};
</script>