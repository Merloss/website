<template>
    <Transition name="fade" mode="out-in">
        <div :key="componentState" class="inline-flex items-center space-x-1.5 min-h-[28px] p-1">
            <template v-if="componentState !== 'not-playing' && isPlaying && track?.trackUrl">
                <Link :href="track.trackUrl" target="_blank" rel="noopener noreferrer"
                    aria-label="Open track in new tab"
                    class="inline-flex items-center space-x-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200">
                <img v-if="track.albumImageUrl && track.albumImageUrl !== ''" :src="track.albumImageUrl" alt="Album Art"
                    class="size-5 flex-shrink-0 rounded-full" />
                <span class="truncate max-w-[150px] sm:max-w-[200px] text-xs">
                    {{ track.trackName }} - {{ track.artistName }}
                </span>
                <MusicNotes />
                </Link>
            </template>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import Link from '~/components/link.vue';

const track = ref<TrackInfo | null>(null);
const isLoading = ref(true);
const isPlaying = ref(false);
let intervalId: NodeJS.Timeout | null = null;

const componentState = computed(() => {
    if (isLoading.value) {
        return 'loading';
    }
    if (isPlaying.value && track.value?.trackUrl) {
        return track.value.trackUrl;
    }
    return 'not-playing';
});

const fetchPresence = async () => {
    try {
        const data = await $fetch<TrackInfo>('/api/track');
        track.value = data;
        isPlaying.value = data.isPlaying;
    } catch (error) {
        track.value = null;
        isPlaying.value = false;
    } finally {
        if (isLoading.value) {
            isLoading.value = false;
        }
    }

    return track.value;
};

onMounted(() => {
    fetchPresence();
    intervalId = setInterval(fetchPresence, 5000);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});

defineExpose({
    track,
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
