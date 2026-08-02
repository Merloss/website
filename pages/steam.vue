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
                <button v-for="(shot, index) in screenshots" :key="shot.id" type="button" v-motion
                    :initial="{ opacity: 0, scale: 0.96 }"
                    :enter="{ opacity: 1, scale: 1, transition: { delay: Math.min(index, 12) * 0.04, duration: 0.3 } }"
                    :style="{ aspectRatio: shot.aspect_ratio }"
                    class="group relative block w-full overflow-hidden rounded-lg border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/30 shadow-sm hover:shadow-xl transition-all duration-300 cursor-zoom-in"
                    @click="openLightbox(index)">
                    <!-- Low-res preview: paints immediately as a blurred placeholder -->
                    <img :src="shot.preview_url" alt="" aria-hidden="true" loading="lazy"
                        class="absolute inset-0 w-full h-full object-cover scale-110 blur-md" />
                    <!-- Crisp thumbnail, served from R2: fades in once loaded -->
                    <img :src="thumbSrc(shot)" :alt="`${shot.game_name} screenshot`" loading="lazy" decoding="async"
                        class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:scale-105"
                        @load="(e) => ((e.target as HTMLElement).style.opacity = '1')"
                        @error="(e) => onThumbError(e, shot)" />
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
                <div v-if="shotId !== null"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm select-none"
                    @click.self="closeLightbox">
                    <button aria-label="Close"
                        class="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                        @click="closeLightbox">
                        <Icon name="material-symbols:close" class="text-2xl" />
                    </button>

                    <button v-if="screenshots.length > 1 && currentIndex >= 0" aria-label="Previous"
                        class="absolute left-3 sm:left-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                        @click.stop="step(-1)">
                        <Icon name="material-symbols:chevron-left" class="text-3xl" />
                    </button>
                    <button v-if="screenshots.length > 1 && currentIndex >= 0" aria-label="Next"
                        class="absolute right-3 sm:right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                        @click.stop="step(1)">
                        <Icon name="material-symbols:chevron-right" class="text-3xl" />
                    </button>

                    <div class="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-10">
                        <div class="relative max-w-full max-h-[82vh] overflow-hidden rounded-lg shadow-2xl"
                            :style="{ aspectRatio: String(current!.aspect_ratio), width: `min(100%, calc(82vh * ${current!.aspect_ratio}))` }">
                            <!-- Blurred preview placeholder until the full image is painted -->
                            <img v-if="current!.preview_url" :src="current!.preview_url" alt="" aria-hidden="true"
                                class="absolute inset-0 w-full h-full object-cover blur-xl scale-105 transition-opacity duration-300"
                                :class="imgReady ? 'opacity-0' : 'opacity-100'" />
                            <img :key="current!.id" :src="fullSrc(current!)"
                                :alt="`${current!.game_name} screenshot`"
                                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                :class="imgReady ? 'opacity-100' : 'opacity-0'" @load="imgReady = true"
                                @error="onFullError" />
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
                                {{ currentIndex >= 0 ? currentIndex + 1 : '–' }} / {{ total || screenshots.length }}
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

const route = useRoute();

const shotId = computed(() => {
    const raw = route.query.shot;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === 'string' && /^\d+$/.test(value) ? value : null;
});

const site = useSiteConfig();
const absolute = (path: string) => `${String(site.url).replace(/\/$/, '')}${path}`;

const PAGE_TITLE = 'Forza Horizon Screenshots';
const PAGE_DESCRIPTION = 'Full-quality Forza Horizon screenshots from my Steam profile.';

const shotSeo = computed(() => {
    const id = shotId.value;
    if (!id) return null;
    const shot = screenshots.value.find((s) => s.id === id);
    const game = shot?.game_name ?? 'Forza Horizon';
    return {
        title: `${game} Screenshot`,
        description: `A full-quality ${game} screenshot from my Steam profile.`,
        image: absolute(`/api/steam/og/${id}.jpg`),
        aspect: shot?.aspect_ratio ?? 16 / 9,
    };
});

useSeoMeta({
    title: () => shotSeo.value?.title ?? PAGE_TITLE,
    description: () => shotSeo.value?.description ?? PAGE_DESCRIPTION,
    ogTitle: () => shotSeo.value?.title ?? PAGE_TITLE,
    ogDescription: () => shotSeo.value?.description ?? PAGE_DESCRIPTION,
    ogUrl: () => absolute(`${route.path}${shotId.value ? `?shot=${shotId.value}` : ''}`),
    twitterTitle: () => shotSeo.value?.title ?? PAGE_TITLE,
    twitterDescription: () => shotSeo.value?.description ?? PAGE_DESCRIPTION,
    twitterCard: 'summary_large_image',
});

const OG_WIDTH = 1200;
if (shotSeo.value) {
    defineOgImage({
        url: shotSeo.value.image,
        width: OG_WIDTH,
        height: Math.round(OG_WIDTH / shotSeo.value.aspect),
        alt: shotSeo.value.title,
    });
} else {
    defineOgImageComponent('base', {
        title: PAGE_TITLE,
        description: 'Full-quality screenshots from my Steam profile.',
    });
}

// Images are served from our R2-backed endpoint. The first request for a shot
// pulls it from Steam and stores it in R2 permanently; every later request (and
// every other visitor) is served straight from R2. Native lazy-loading means a
// thumbnail is only requested when its tile nears the viewport.
const thumbSrc = (shot: SteamScreenshot) => `/api/steam/image?id=${shot.id}&size=thumb`;
const fullSrc = (shot: SteamScreenshot) => `/api/steam/image?id=${shot.id}&size=full`;

// During the very first warm-up (before R2 is populated) Steam can briefly
// throttle a request and the image 502s. Retry a few times with a growing delay
// — the `&r=` param just busts the browser's negative cache (the server ignores
// it). Once the image lands in R2, this never fires again.
const MAX_IMG_RETRIES = 4;
const retryImg = (img: HTMLImageElement, url: string): boolean => {
    const n = Number(img.dataset.retry || 0);
    if (n >= MAX_IMG_RETRIES) return false;
    img.dataset.retry = String(n + 1);
    setTimeout(() => { img.src = `${url}&r=${n + 1}`; }, 1500 * (n + 1));
    return true;
};
const onThumbError = (e: Event, shot: SteamScreenshot) => {
    retryImg(e.target as HTMLImageElement, thumbSrc(shot));
};
const onFullError = (e: Event) => {
    if (!current.value || !retryImg(e.target as HTMLImageElement, fullSrc(current.value))) {
        imgReady.value = true; // give up → settle on the blurred preview
    }
};

// --- Lightbox (driven by ?shot, so an open shot is a shareable link) --------
// The URL is the single source of truth: opening writes it, opening such a link
// reopens the same image, and Back closes the lightbox — all for free.
const router = useRouter();

// True once the full-resolution image has actually painted. Until then we show
// the blurred preview + a spinner (so there's never a blank/half-loaded frame).
const imgReady = ref(false);

const currentIndex = computed(() =>
    shotId.value === null
        ? -1
        : screenshots.value.findIndex((s) => s.id === shotId.value)
);

// Usually the open shot is already in the grid. If a shared link points to a
// shot on a not-yet-loaded page (or one no longer in the feed), fall back to a
// minimal shot built from the id alone — the image still resolves from R2 by
// id, so the picture shows regardless.
const current = computed<SteamScreenshot | null>(() => {
    const id = shotId.value;
    if (id === null) return null;
    return (
        screenshots.value.find((s) => s.id === id) ?? {
            id,
            appid: '',
            game_name: 'Forza Horizon',
            aspect_ratio: 16 / 9,
            preview_url: '',
            url: `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`,
        }
    );
});

watch(shotId, (id) => {
    imgReady.value = false; // the full <img> @load flips this back to true
    if (import.meta.client) document.body.style.overflow = id ? 'hidden' : '';
}, { immediate: true });

// If a deep-linked shot isn't loaded yet, keep pulling pages until it appears
// (so its caption and prev/next become accurate). Bounded by the feed length.
watch([shotId, () => screenshots.value.length, isLoadingMore], () => {
    if (!import.meta.client) return;
    const id = shotId.value;
    if (!id || screenshots.value.some((s) => s.id === id)) return;
    if (hasMore.value && !isLoadingMore.value && !pending.value) loadMore();
});

const openLightbox = (index: number) => {
    router.push({ query: { ...route.query, shot: screenshots.value[index].id } });
};

const closeLightbox = () => {
    const query = { ...route.query };
    delete query.shot;
    router.replace({ query });
};

const step = (delta: number) => {
    const next = currentIndex.value + delta;
    if (currentIndex.value === -1 || next < 0 || next >= screenshots.value.length) return;
    router.replace({ query: { ...route.query, shot: screenshots.value[next].id } });
    if (next >= screenshots.value.length - 3) loadMore();
};

const onKeydown = (e: KeyboardEvent) => {
    if (shotId.value === null) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
};

let scrollObserver: IntersectionObserver | null = null;

onMounted(() => {
    window.addEventListener('keydown', onKeydown);

    // Infinite scroll: load the next page as the sentinel nears the viewport.
    scrollObserver = new IntersectionObserver(
        (entries) => { if (entries[0].isIntersecting) loadMore(); },
        { rootMargin: '500px' }
    );
    watch(sentinel, (el) => { if (el && scrollObserver) scrollObserver.observe(el); }, { immediate: true });
});

onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
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
