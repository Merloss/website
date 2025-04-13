<template>
    <NuxtLink external :aria-label="ariaLabel" :to="getUtmLink" :target="props.target" :rel="props.rel"
        :class="props.class">
        <slot />
    </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
    href: string;
    target?: string;
    rel?: string;
    class?: string;
    ariaLabel?: string;
}>();

const getUtmLink = computed(() => {
    const url = new URL(props.href);

    let utmSource = 'unknown';

    if (process.client && window?.location?.host) {
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