<template>
    <div class="max-w-4xl mx-auto">
        <h1 v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
            class="text-4xl font-bold mb-8 dark:text-white">Changelog</h1>

        <div v-if="error"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p class="text-red-700 dark:text-red-300">{{ error }}</p>
        </div>

        <div>
            <div v-for="(group, date, index) in groupedCommits" :key="date" v-motion :initial="{ opacity: 0, y: 50 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 200 + (index * 100) } }" class="relative pb-8">
                <div v-if="group.length"
                    class="absolute top-5 left-3 -ml-px mt-2 w-0.5 h-full bg-gray-200 dark:bg-white/10" />

                <div class="relative flex items-center space-x-4">
                    <div class="relative">
                        <span
                            class="h-6 w-6 rounded-full bg-gray-300 dark:bg-dark flex items-center justify-center ring-4 ring-light dark:ring-dark">
                            <Icon name="material-symbols:commit" class="text-xl text-white/10 dark:text-gray-200" />
                        </span>
                    </div>
                    <h2 class="text-xl font-semibold dark:text-white">
                        {{ formatDate(date as string) }}
                    </h2>
                </div>

                <div class="ml-3.5 mt-4 space-y-8 pl-10">
                    <div v-for="commit in group" :key="commit.sha" class="relative">
                        <div class="flex-grow">
                            <div class="flex items-center gap-1 mb-1">
                                <span v-if="getCommitType(commit.commit.message)"
                                    :class="getCommitTypeBadgeClass(getCommitType(commit.commit.message))"
                                    class="px-2 py-0.5 rounded-full text-xs font-semibold">
                                    {{ getCommitType(commit.commit.message) }}
                                </span>
                                <div class="flex justify-between items-center w-full">
                                    <p class="text-md font-medium dark:text-white">
                                        {{ getCommitMessage(commit.commit.message) }}
                                    </p>
                                    <div class="flex items-center gap-2">
                                        <span v-if="commit.commit.verification.verified"
                                            class="px-2 py-0.5 text-xs font-semibold text-green-800 bg-green-100 rounded-full dark:text-green-500 ring dark:ring-green-900 dark:bg-transparent opacity-70">
                                            Verified
                                        </span>
                                        <Link target="_blank" :href="commit.html_url"
                                            class="font-mono text-sm text-white/70 hover:underline hover:text-blue-500">
                                        {{ commit.sha.substring(0, 7) }}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div
                                class="flex flex-wrap items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <img v-if="commit.author?.avatar_url" :src="commit.author.avatar_url"
                                    :alt="commit.commit.author.name" class="size-4 rounded-full" />
                                <span>
                                    <Link target="_blank" :href="commit.author.html_url"
                                        class="hover:underline hover:text-blue-500">
                                    {{ commit.commit.author.name }}
                                    </Link>
                                    committed on {{ formatDate(date as string) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Link from '~/components/link.vue';
import type { GithubCommit } from '~/@types/github';

definePageMeta({
    name: 'Changelog',
    icon: 'material-symbols:history',
    shortcuts: ['C', 'H']
});


useSeoMeta({
    title: 'Changelog',
    description: 'View the latest changes and updates to the website.',
    ogTitle: 'Changelog',
    ogDescription: 'View the latest changes and updates to the website.',
    ogImage: () => {
        const baseUrl = useRequestURL().origin;
        return `${baseUrl}/api/og/simple`;
    },
    twitterCard: 'summary_large_image',
    twitterTitle: 'Changelog',
    twitterDescription: 'View the latest changes and updates to the website.',
    twitterImage: () => {
        const baseUrl = useRequestURL().origin;
        return `${baseUrl}/api/og/simple`;
    },
});

const commits = ref<GithubCommit[]>([]);
const error = ref<string | null>(null);

const COMMIT_TYPES = {
    feat: 'Feature',
    fix: 'Fix',
    docs: 'Docs',
    style: 'Style',
    refactor: 'Refactor',
    perf: 'Performance',
    test: 'Test',
    build: 'Build',
    ci: 'CI',
    chore: 'Chore',
    revert: 'Revert'
} as const;

type CommitType = keyof typeof COMMIT_TYPES;

const getCommitType = (message: string): CommitType | null => {
    const match = message.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(.*?\))?:/i);
    return match ? (match[1].toLowerCase() as CommitType) : null;
};

const getCommitMessage = (message: string): string => {
    const match = message.match(/^(?:(?:feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?:\(.*?\))?:)?(.*)/i);
    return match ? match[1].trim() : message;
};

const getCommitTypeBadgeClass = (type: CommitType | null): string => {
    if (!type) return '';

    const classes = {
        feat: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300/90',
        fix: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300/90',
        docs: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300/90',
        style: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300/90',
        refactor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300/90',
        perf: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300/90',
        test: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300/90',
        build: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300/90',
        ci: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300/90',
        chore: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300/90',
        revert: 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300/90'
    };

    return classes[type] || '';
};

const groupedCommits = computed(() => {
    const groups = commits.value.reduce((acc, commit) => {
        const date = new Date(commit.commit.author.date).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(commit);
        return acc;
    }, {} as Record<string, GithubCommit[]>);

    return Object.fromEntries(
        Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
    );
});

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) {
        return 'Today';
    } else if (dateStr === yesterdayStr) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

onMounted(async () => {
    try {
        const response = await $fetch('/api/github/commits');
        commits.value = response;
    } catch (e) {
        error.value = 'Failed to load commit history. Please try again later.';
        console.error('Error fetching commits:', e);
    }
});
</script>