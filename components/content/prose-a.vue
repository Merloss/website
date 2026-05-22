<template>
    <NuxtLink :href="resolvedHref" :external="isExternal" :class="props.class"
        class="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
        <slot /><Icon name="material-symbols:link"
            class="link-icon inline align-baseline ml-0.5 text-[0.8em] opacity-70" />
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

// Internal app links ("/path") and in-page anchors ("#id") use SPA navigation.
const isInternal = computed(() => /^[/#]/.test(props.href));
// Anything that isn't an internal link is treated as external by NuxtLink.
const isExternal = computed(() => !isInternal.value);
// Only http(s) links get a utm_source query param appended.
const isHttp = computed(() => /^https?:\/\//i.test(props.href));

const resolvedHref = computed(() => {
    if (!props.href) {
        return '';
    }

    // Internal links (and non-http schemes like mailto:) are left untouched.
    if (!isHttp.value) {
        return props.href;
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
