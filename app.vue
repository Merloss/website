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
