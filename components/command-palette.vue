<template>
    <div v-show="isOpen" class="fixed inset-0 z-50 flex items-start justify-center px-4 sm:px-0 pt-16 sm:pt-24"
        aria-labelledby="command-palette-title" role="dialog" aria-modal="true" @keydown.esc="closePalette"
        @keydown.up.prevent="navigateUp" @keydown.down.prevent="navigateDown" @keydown.enter.prevent="selectCommand">
        <transition name="fade">
            <div v-show="isOpen" class="fixed inset-0 bg-black/10" aria-hidden="true" @click="closePalette"></div>
        </transition>

        <transition name="palette-content">
            <div v-show="isOpen"
                class="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white/80 dark:bg-black/80 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-lg">
                <div class="relative">
                    <input ref="inputRef" v-model="searchQuery" type="text"
                        class="w-full border-0 bg-transparent px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                        placeholder="Search commands..." role="combobox" aria-expanded="true"
                        aria-controls="command-palette-results" />
                </div>

                <div v-if="filteredGroups.length > 0" class="border-t border-gray-200 dark:border-gray-700/50"></div>

                <div v-if="filteredGroups.length > 0" id="command-palette-results"
                    class="max-h-[40vh] overflow-y-auto p-2">
                    <ul v-for="(group, groupIndex) in filteredGroups" :key="group.key" role="listbox">
                        <li v-if="group.commands.length > 0"
                            class="px-3 pt-3 pb-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">
                            {{ group.label }}
                        </li>
                        <li v-for="(command, commandIndex) in group.commands"
                            :id="`command-${getGlobalIndex(groupIndex, commandIndex)}`" :key="command.id" role="option"
                            :aria-selected="isSelected(groupIndex, commandIndex)"
                            class="flex cursor-pointer items-center space-x-3 rounded-md px-3 py-2.5 text-gray-700 dark:text-gray-200"
                            :class="{ 'bg-gray-100/80 dark:bg-white/10': isSelected(groupIndex, commandIndex) }"
                            @mouseenter="setSelectedIndexByIndices(groupIndex, commandIndex)"
                            @click="executeCommand(command)">
                            <Icon v-if="command.icon" :name="command.icon"
                                :class="[command.icon, 'h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400']"
                                aria-hidden="true" />
                            <span class="flex-auto truncate text-sm">{{ command.label }}</span>
                            <span v-if="command.shortcuts"
                                class="flex-none text-xs font-semibold text-gray-400 dark:text-gray-500">
                                <kbd v-for="key in command.shortcuts" :key="key"
                                    class="ml-1 rounded border border-gray-300/50 dark:border-gray-600/50 px-1 py-0.5">{{
                                        key }}</kbd>
                            </span>
                        </li>
                    </ul>
                </div>

                <div v-else-if="searchQuery" class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    No results found for "{{ searchQuery }}".
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
const isOpen = ref(false);
const searchQuery = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);
const fetchedPostCommands = ref<Command[]>([]);

const router = useRouter();
const colorMode = useColorMode();

function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
const routes = router.getRoutes();
const navigationMap = routes.filter(route => route.meta.name).map(route => ({
    id: route.meta.name as string,
    label: capitalizeFirstLetter(route.meta.name as string),
    icon: route.meta.icon as string,
    to: route.path,
    shortcuts: route.meta.shortcuts as string[]
}));

const baseGroups: CommandGroup[] = [
    {
        key: 'navigation',
        label: 'Navigation',
        commands: navigationMap
    },
    {
        key: 'theme',
        label: 'Theme',
        commands: [
            { id: 'theme-light', label: 'Switch to Light Theme', icon: 'material-symbols:sunny-rounded', action: () => { colorMode.preference = 'light'; }, shortcuts: ['T', 'L'] },
            { id: 'theme-dark', label: 'Switch to Dark Theme', icon: 'material-symbols:dark-mode', action: () => { colorMode.preference = 'dark'; }, shortcuts: ['T', 'D'] },
            { id: 'theme-system', label: 'Switch to System Theme', icon: 'material-symbols:computer-outline', action: () => { colorMode.preference = 'system'; }, shortcuts: ['T', 'S'] },
        ],
    },
];

onMounted(async () => {
    try {
        const fetched = await queryCollection('content')
            .order('published_at', 'DESC')
            .select('title', 'path')
            .all();

        fetchedPostCommands.value = (fetched || []).map((post: FetchedPost) => ({
            id: post.path || `post-${post.title}`,
            label: post.title || 'Untitled Post',
            icon: 'material-symbols:clarify-outline',
            to: post.path,
        }));
    } catch (error) {
        console.error("Failed to fetch posts for command palette:", error);
        fetchedPostCommands.value = [];
    }
});

const allGroups = computed<CommandGroup[]>(() => {
    const dynamicGroups: CommandGroup[] = [];
    if (fetchedPostCommands.value.length > 0) {
        dynamicGroups.push({
            key: 'posts',
            label: 'Posts',
            commands: fetchedPostCommands.value
        });
    }
    return [...baseGroups, ...dynamicGroups];
});

const filteredGroups = computed(() => {
    if (!searchQuery.value) {
        return allGroups.value;
    }
    const query = searchQuery.value.toLowerCase();
    const result: CommandGroup[] = [];
    for (const group of allGroups.value) {
        const filteredCommands = group.commands.filter(command =>
            command.label.toLowerCase().includes(query)
        );
        if (filteredCommands.length > 0) {
            result.push({ ...group, commands: filteredCommands });
        }
    }
    return result;
});

const flatCommands = computed(() => filteredGroups.value.flatMap(group => group.commands));
const totalCommands = computed(() => flatCommands.value.length);

watch(searchQuery, () => { selectedIndex.value = 0; });
watch(isOpen, (newValue) => { if (newValue) { nextTick(() => { inputRef.value?.focus(); selectedIndex.value = 0; }); } });

const openPalette = () => { isOpen.value = true; };
const closePalette = () => { isOpen.value = false; searchQuery.value = ''; };

const getGlobalIndex = (groupIndex: number, commandIndex: number): number => {
    let index = 0;
    for (let i = 0; i < groupIndex; i++) { index += filteredGroups.value[i]?.commands.length || 0; }
    return index + commandIndex;
};

const isSelected = (groupIndex: number, commandIndex: number): boolean => { return selectedIndex.value === getGlobalIndex(groupIndex, commandIndex); };
const setSelectedIndexByIndices = (groupIndex: number, commandIndex: number) => { selectedIndex.value = getGlobalIndex(groupIndex, commandIndex); };

const navigateUp = () => { if (totalCommands.value === 0) return; selectedIndex.value = (selectedIndex.value - 1 + totalCommands.value) % totalCommands.value; scrollToSelected(); };
const navigateDown = () => { if (totalCommands.value === 0) return; selectedIndex.value = (selectedIndex.value + 1) % totalCommands.value; scrollToSelected(); };

const selectCommand = () => { if (totalCommands.value === 0) return; const command = flatCommands.value[selectedIndex.value]; if (command) { executeCommand(command); } };

const executeCommand = (command: Command) => {
    if (command.to) { router.push(command.to); }
    else if (command.action) { command.action(); }
    closePalette();
};

const scrollToSelected = () => {
    nextTick(() => {
        const selectedElement = document.getElementById(`command-${selectedIndex.value}`);
        if (selectedElement) {
            const container = document.getElementById('command-palette-results');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const elementRect = selectedElement.getBoundingClientRect();
                const isVisible = elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom;
                if (!isVisible) {
                    selectedElement.scrollIntoView({ block: 'nearest' });
                }
            } else {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    });
};

defineExpose({ openPalette, closePalette });

</script>

<style scoped>
#command-palette-results::-webkit-scrollbar {
    width: 6px;
}

#command-palette-results::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.4);
    border-radius: 3px;
}

#command-palette-results::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.6);
}

#command-palette-results::-webkit-scrollbar-track {
    background: transparent;
}

#command-palette-results {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.palette-content-enter-active {
    transition: all 0.2s ease-out;
}

.palette-content-leave-active {
    transition: all 0.15s ease-in;
}

.palette-content-enter-from,
.palette-content-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.palette-content-enter-to,
.palette-content-leave-from {
    opacity: 1;
    transform: scale(1);
}
</style>