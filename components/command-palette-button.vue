<template>
    <button @click="emitOpenEvent"
        class=" rounded-sm flex items-center space-x-1 hover:dark:bg-white/10 transition-colors duration-300 p-1">
        <span class="rounded p-px keycap-overflow-border-container">
            <div
                class="dark:bg-black bg-white text:black dark:text-gray-200 rounded-sm px-1.5 py-0.5 text-xs shadow-sm w-full h-full">
                {{ isMacOs ? '⌘' : 'Ctrl' }}
            </div>
            <div class="keycap-spinning-gradient-bg"></div>
        </span>

        <span class="rounded p-px keycap-overflow-border-container">
            <div
                class="dark:bg-black bg-white text-black dark:text-gray-200 rounded-sm px-1.5 py-0.5 text-xs shadow-sm w-full h-full">
                K
            </div>
            <div class="keycap-spinning-gradient-bg"></div>
        </span>
    </button>
</template>

<script setup lang="ts">
const emit = defineEmits(['open-command-palette']);

const isMacOs = ref(false);

const emitOpenEvent = () => {
    emit('open-command-palette');
};

onMounted(() => {
    if (typeof navigator !== 'undefined') {
        isMacOs.value = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    }
});
</script>