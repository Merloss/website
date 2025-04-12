<template>
    <UnLazyImage :src="src" :alt="alt" :blurhash="blurhash" :blurhash-ratio="2" :width="width" :height="height"
        :class="disableZoom ? '' : 'image-zoomable'" v-bind="$attrs" draggable="false" />
</template>

<script setup lang="ts">
defineProps<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    blurhash?: string;
    disableZoom?: boolean;
}>();
</script>