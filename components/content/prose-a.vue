<template>
    <NuxtLink :href="getUtmLink" external :class="props.class">
        <slot />
    </NuxtLink>
</template>
<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        href?: string
        class?: string
    }>(),
    {
        href: '',
        class: ''
    }
)

const getUtmLink = computed(() => {
    if (!props.href) {
        return '';
    }

    const url = new URL(props.href);

    let utmSource = 'unknown';

    if (import.meta.client && window?.location?.host) {
        utmSource = window.location.host;
    } else {
        const event = useRequestEvent();
        if (event?.node?.req?.headers?.host) {
            utmSource = event.node.req.headers.host;
        }
    }

    url.searchParams.append('utm_source', utmSource);
    return url.href;
});
</script>