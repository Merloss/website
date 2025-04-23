<template>
    <div class="mermaid flex justify-center" v-if="show">
        <slot />
    </div>
</template>

<script setup>
const show = ref(false);

const { $mermaid } = useNuxtApp()

onMounted(async () => {
    show.value = true
    $mermaid().initialize({ startOnLoad: true })
    await nextTick()
    $mermaid().init();
})

</script>