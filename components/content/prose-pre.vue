<template>
    <CodeBlock v-if="!isMermaid" v-bind="props" class="relative group transition-all duration-300 overflow-visible">
        <div :class="[
            'justify-end h-0 dark:text-white text-black cursor-pointer sticky flex top-24 right-4 z-10 transition-all duration-300',
            copiedState ? 'opacity-100' : 'opacity-0 dark:group-hover:opacity-30 group-hover:opacity-60'
        ]" @click.stop="copyCode">
            {{ copiedState ? 'copied 🥥' : 'copy' }}
        </div>
        <slot />
    </CodeBlock>

    <Mermaid v-else>
        {{ code }}
    </Mermaid>
</template>

<script setup lang="ts">
const props = defineProps({
    code: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: null
    },
    filename: {
        type: String,
        default: null
    },
    highlights: {
        type: Array as () => number[],
        default: () => []
    },
    meta: {
        type: String,
        default: null
    },
    class: {
        type: String,
        default: null
    }
})

const isMermaid = ref<boolean>(props.language === 'mermaid')

const copiedState = ref<boolean>(false)

const copyCode = () => {
    navigator.clipboard.writeText(props.code)
    copiedState.value = true
    setTimeout(() => {
        copiedState.value = false
    }, 1200)
}
</script>
