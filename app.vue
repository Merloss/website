<template>
  <main class="dark:bg-dark bg-light">
    <section class="container md:px-40 px-4 mx-auto flex flex-col min-h-screen">
      <Navbar @open-command-palette="openThePalette" />
      <NuxtPage class="py-10 px-2 flex-grow" />
      <CommandPalette ref="commandPaletteRef" />
      <Footer />
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const site = useSiteConfig();

// Query strings never make a new page (?shot= on /steam is a lightbox state),
// so the canonical is always the bare path.
const canonical = computed(() => {
  const origin = String(site.url).replace(/\/$/, '');
  return `${origin}${route.path === '/' ? '' : route.path.replace(/\/+$/, '')}`;
});

useHead({
  titleTemplate: (title) =>
    title && !title.includes('Kerim Kara') ? `${title} · Kerim Kara` : title || 'Kerim Kara',
  link: [{ rel: 'canonical', href: canonical }],
});

useSeoMeta({
  ogUrl: canonical,
  ogSiteName: 'Kerim Kara',
  ogLocale: 'en_US',
});

const commandPaletteRef = ref();

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      commandPaletteRef.value?.openPalette();
    }
  });
});

const openThePalette = () => {
  commandPaletteRef.value?.openPalette();
};
</script>
