<template>
    <div class="py-12 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100 min-h-screen">
        <div class="max-w-7xl mx-auto">
            <h1 v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
                class="text-4xl md:text-5xl font-bold mb-3 text-center">
                Forza Horizon
            </h1>
            <p v-motion :initial="{ opacity: 0, y: 50 }" :enter="{ opacity: 1, y: 0, transition: { delay: 150 } }"
                class="text-center text-gray-600 dark:text-gray-400 mb-12">
                Full-quality screenshots, straight from my Steam profile
                <span v-if="total"> · {{ total }} shots</span>
            </p>

            <!-- Initial load -->
            <div v-if="pending && screenshots.length === 0" class="text-center py-20">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white" />
                <p class="mt-4 text-gray-600 dark:text-gray-400">Loading screenshots…</p>
            </div>

            <!-- Error -->
            <div v-else-if="error && screenshots.length === 0" class="text-center py-20">
                <p class="text-red-600 dark:text-red-400 mb-2">Couldn't load screenshots.</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ error.message }}</p>
            </div>

            <!-- Gallery -->
            <div v-else-if="screenshots.length > 0" class="gallery">
                <button v-for="(shot, index) in screenshots" :key="shot.id" :ref="(el) => observeItem(el, shot)"
                    type="button" v-motion :initial="{ opacity: 0, scale: 0.96 }"
                    :enter="{ opacity: 1, scale: 1, transition: { delay: Math.min(index, 12) * 0.04, duration: 0.3 } }"
                    :style="{ aspectRatio: shot.aspect_ratio }"
                    class="group relative block w-full overflow-hidden rounded-lg border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in"
                    @click="openLightbox(index)">
                    <!-- Low-res preview: paints immediately -->
                    <img :src="shot.preview_url" alt="" aria-hidden="true"
                        class="absolute inset-0 w-full h-full object-cover scale-110 blur-md" />
                    <!-- Crisp thumbnail: fades in once resolved -->
                    <img v-if="shot.thumbnail_url" :src="shot.thumbnail_url" :alt="`${shot.game_name} screenshot`"
                        class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105"
                        @load="(e) => ((e.target as HTMLElement).style.opacity = '1')" />
                    <div
                        class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Icon name="material-symbols:zoom-out-map"
                        class="absolute bottom-3 right-3 text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" />
                </button>
            </div>

            <div v-else class="text-center py-20 text-gray-600 dark:text-gray-400">
                No screenshots found.
            </div>

            <!-- Infinite scroll sentinel -->
            <div ref="sentinel" class="mt-10 flex justify-center items-center py-8">
                <div v-if="isLoadingMore" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 dark:border-gray-400" />
                    <span>Loading more…</span>
                </div>
                <p v-else-if="!hasMore && screenshots.length > 0" class="text-sm text-gray-500 dark:text-gray-400">
                    That's all {{ total }} of them.
                </p>
            </div>
        </div>

        <!-- Lightbox -->
        <Teleport to="body">
            <Transition name="lightbox">
                <div v-if="lightboxIndex !== null"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm select-none"
                    @click.self="closeLightbox">
                    <button aria-label="Close"
                        class="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                        @click="closeLightbox">
                        <Icon name="material-symbols:close" class="text-2xl" />
                    </button>

                    <button v-if="screenshots.length > 1" aria-label="Previous"
                        class="absolute left-3 sm:left-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                        @click.stop="step(-1)">
                        <Icon name="material-symbols:chevron-left" class="text-3xl" />
                    </button>
                    <button v-if="screenshots.length > 1" aria-label="Next"
                        class="absolute right-3 sm:right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                        @click.stop="step(1)">
                        <Icon name="material-symbols:chevron-right" class="text-3xl" />
                    </button>

                    <div class="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-10">
                        <div class="relative max-w-full max-h-[82vh] overflow-hidden rounded-lg shadow-2xl"
                            :style="{ aspectRatio: String(current!.aspect_ratio), width: `min(100%, calc(82vh * ${current!.aspect_ratio}))` }">
                            <!-- Blurred preview placeholder until the full image is painted -->
                            <img :src="current!.preview_url" alt="" aria-hidden="true"
                                class="absolute inset-0 w-full h-full object-cover blur-xl scale-105 transition-opacity duration-300"
                                :class="imgReady ? 'opacity-0' : 'opacity-100'" />
                            <img v-if="current!.full_image_url" :key="current!.id" :src="current!.full_image_url"
                                :alt="`${current!.game_name} screenshot`"
                                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                :class="imgReady ? 'opacity-100' : 'opacity-0'" @load="imgReady = true"
                                @error="imgReady = true" />
                            <div v-if="!imgReady"
                                class="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white" />
                            </div>
                        </div>
                        <div class="mt-4 text-center text-white">
                            <p class="text-sm text-gray-300 flex items-center justify-center gap-2">
                                <Icon name="material-symbols:videogame-asset" />
                                {{ current!.game_name }}
                                <span class="text-gray-500">·</span>
                                {{ lightboxIndex! + 1 }} / {{ total || screenshots.length }}
                            </p>
                            <a :href="current!.url" target="_blank" rel="noopener noreferrer"
                                class="mt-1 inline-block text-xs text-gray-400 hover:text-white transition">
                                View on Steam →
                            </a>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    name: 'Forza Horizon Shots',
    icon: 'material-symbols:photo-camera-outline',
    shortcuts: ['G', 'S'],
});

useSeoMeta({
    title: 'Forza Horizon Screenshots',
    description: 'Full-quality Forza Horizon screenshots from my Steam profile.',
    ogTitle: 'Forza Horizon Screenshots',
    ogDescription: 'Full-quality Forza Horizon screenshots from my Steam profile.',
    twitterCard: 'summary_large_image',
});

defineOgImageComponent('base', {
    title: 'Forza Horizon Screenshots',
    description: 'Full-quality screenshots from my Steam profile.',
});

interface ScreenshotResponse {
    screenshots: SteamScreenshot[];
    pagination: { page: number; pageSize: number; total: number; hasNext: boolean };
}

const page = ref(1);
const screenshots = ref<SteamScreenshot[]>([]);
const total = ref(0);
const hasMore = ref(true);
const isLoadingMore = ref(false);
const sentinel = ref<HTMLElement | null>(null);

const { data, pending, error } = await useFetch<ScreenshotResponse>(
    () => `/api/steam/screenshots?page=${page.value}`,
    { watch: [page], key: 'forza-screenshots' }
);

watch(data, (res) => {
    if (!res) return;
    const existing = new Set(screenshots.value.map((s) => s.id));
    screenshots.value.push(...res.screenshots.filter((s) => !existing.has(s.id)));
    total.value = res.pagination.total;
    hasMore.value = res.pagination.hasNext;
    isLoadingMore.value = false;
}, { immediate: true });

const loadMore = () => {
    if (isLoadingMore.value || pending.value || !hasMore.value) return;
    isLoadingMore.value = true;
    page.value += 1;
};

// --- Lazy full-resolution resolution -------------------------------------
// Each shot's crisp thumbnail + original image is fetched only when it scrolls
// into view (or is opened), one small request at a time, so we stay under
// Steam's rate limit. Results are cached server-side, so this is paid once.
const resolving = new Set<string>();
let activeResolves = 0;
const resolveQueue: (() => void)[] = [];

const pumpQueue = () => {
    while (activeResolves < 4 && resolveQueue.length) {
        resolveQueue.shift()!();
    }
};

const resolveShot = (shot: SteamScreenshot): Promise<void> =>
    new Promise((done) => {
        if (shot.full_image_url || resolving.has(shot.id)) return done();
        resolving.add(shot.id);
        const run = async () => {
            activeResolves++;
            try {
                const res = await $fetch<{ thumbnail_url: string; full_image_url: string }>(
                    `/api/steam/screenshot?id=${shot.id}`
                );
                shot.thumbnail_url = res.thumbnail_url;
                shot.full_image_url = res.full_image_url;
            } catch {
                resolving.delete(shot.id); // allow a later retry
            } finally {
                activeResolves--;
                pumpQueue();
                done();
            }
        };
        resolveQueue.push(run);
        pumpQueue();
    });

// --- Viewport observer for the grid ---------------------------------------
let itemObserver: IntersectionObserver | null = null;
const pendingEls = new Map<Element, SteamScreenshot>();

const observeItem = (el: Element | any, shot: SteamScreenshot) => {
    if (!el || !(el instanceof Element)) return;
    if (itemObserver) itemObserver.observe(el);
    else pendingEls.set(el, shot);
    (el as any).__shot = shot;
};

// --- Lightbox --------------------------------------------------------------
const lightboxIndex = ref<number | null>(null);
// True once the full-resolution image has actually painted. Until then we show
// the blurred preview + a spinner (so there's never a blank/half-loaded frame).
const imgReady = ref(false);
const current = computed(() =>
    lightboxIndex.value === null ? null : screenshots.value[lightboxIndex.value] ?? null
);

const showShot = async (index: number) => {
    lightboxIndex.value = index;
    imgReady.value = false;
    const shot = screenshots.value[index];
    if (!shot.full_image_url) {
        await resolveShot(shot);
        if (lightboxIndex.value !== index) return;
        // Resolve failed → settle on the blurred preview instead of spinning forever.
        if (!shot.full_image_url) imgReady.value = true;
    }
    // When the full image is available, its <img @load> flips imgReady.
};

const openLightbox = (index: number) => {
    document.body.style.overflow = 'hidden';
    showShot(index);
};

const closeLightbox = () => {
    lightboxIndex.value = null;
    document.body.style.overflow = '';
};

const step = (delta: number) => {
    if (lightboxIndex.value === null) return;
    const next = lightboxIndex.value + delta;
    if (next < 0 || next >= screenshots.value.length) return;
    showShot(next);
    if (next >= screenshots.value.length - 3) loadMore();
};

const onKeydown = (e: KeyboardEvent) => {
    if (lightboxIndex.value === null) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
};

let scrollObserver: IntersectionObserver | null = null;

onMounted(() => {
    window.addEventListener('keydown', onKeydown);

    // Resolve a shot when its tile nears the viewport, then stop watching it.
    itemObserver = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                const shot = (entry.target as any).__shot as SteamScreenshot | undefined;
                if (shot) resolveShot(shot);
                itemObserver!.unobserve(entry.target);
            }
        },
        { rootMargin: '300px' }
    );
    for (const [el] of pendingEls) itemObserver.observe(el);
    pendingEls.clear();

    // Infinite scroll.
    scrollObserver = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) loadMore(); },
        { rootMargin: '500px' }
    );
    watch(sentinel, (el) => { if (el && scrollObserver) scrollObserver.observe(el); }, { immediate: true });
});

onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
    itemObserver?.disconnect();
    scrollObserver?.disconnect();
});
</script>

<style scoped>
@reference "assets/css/main.css";

/* Row-major grid: items flow left-to-right, top-to-bottom (newest first),
   so newly loaded screenshots extend downward and existing ones never reflow. */
.gallery {
    display: grid;
    grid-template-columns: 1fr;
    align-items: start;
    gap: 1rem;
}

@media (min-width: 640px) {
    .gallery {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
    }
}

@media (min-width: 1024px) {
    .gallery {
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
    }
}

/* Lightbox transitions */
.lightbox-enter-active,
.lightbox-leave-active {
    transition: opacity 0.25s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
    opacity: 0;
}
</style>
