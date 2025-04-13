<template>
    <nav
        class="sticky top-4 z-50 rounded-xl border border-white/10 bg-white/60 dark:bg-black/50 backdrop-blur-lg shadow-lga px-6 py-3 mx-auto w-full">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-6">
                <NuxtLink to="/" aria-label="Go to home page" class="text-xl font-bold text-gray-900 dark:text-white">
                    Kerim Kara
                </NuxtLink>
                <div class="text-sm text-gray-600 dark:text-gray-400 hidden sm:flex items-center space-x-2">
                    <template v-if="breadcrumbs.length > 0" v-for="(item, index) in breadcrumbs" :key="item.text">
                        <NuxtLink v-if="item.to" :to="item.to" :aria-label="`Go to ${item.text} page`"
                            class="hover:text-gray-900 dark:hover:text-white transition-colors">
                            {{ item.text }}
                        </NuxtLink>
                        <span v-else class="font-medium text-gray-800 dark:text-gray-200">
                            {{ item.text }}
                        </span>
                        <span v-if="index < breadcrumbs.length - 1" class="text-gray-400 dark:text-gray-600">/</span>
                    </template>
                </div>
            </div>
            <CommandPaletteButton @open-command-palette="reEmitOpenEvent" />
        </div>
    </nav>
</template>

<script setup lang="ts">
const emit = defineEmits(['open-command-palette']);

const reEmitOpenEvent = () => {
    emit('open-command-palette');
};

const route = useRoute();

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const emptyCrumb: BreadcrumbItem = { text: '', to: '/' };

const breadcrumbs = computed((): BreadcrumbItem[] => {
    const pathSegments = route.path.split('/').filter(segment => segment !== '');
    if (pathSegments.length === 0) {
        return [{ text: 'Home', to: '/' }, emptyCrumb];
    }

    const crumbs: BreadcrumbItem[] = [{ text: 'Home', to: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === pathSegments.length - 1;
        crumbs.push({
            text: segment,
            to: isLast ? undefined : currentPath,
        });
    });

    return crumbs;
});
</script>