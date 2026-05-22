<template>
    <div v-if="!isMermaid">
        <div v-if="filename"
            class="flex items-center gap-2 mt-6 px-4 py-2 rounded-t-lg font-mono text-xs select-none border-b bg-[#dfe3e8] text-gray-600 border-black/10 dark:bg-[#181818] dark:text-gray-300 dark:border-white/10">
            <Icon :name="fileIcon" class="text-sm opacity-80 shrink-0" />
            <span class="truncate">{{ filename }}</span>
        </div>
        <CodeBlock v-bind="props" class="relative group transition-all duration-300 sm:overflow-visible"
            :class="filename ? '!mt-0 !rounded-t-none' : ''">
            <div :class="[
                'justify-end h-0 dark:text-white text-black cursor-pointer sticky flex top-24 right-4 z-10 transition-all duration-300',
                copiedState ? 'opacity-100' : 'opacity-0 dark:group-hover:opacity-30 group-hover:opacity-60'
            ]" @click.stop="copyCode">
                {{ copiedState ? 'copied 🥥' : 'copy' }}
            </div>
            <slot />
        </CodeBlock>
    </div>

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

// Brand/language icons (logos:*) per file extension, with material-symbols
// fallbacks for generic file types. All names verified to exist in the
// installed @iconify-json/logos and @iconify-json/material-symbols packages.
const ICON_BY_EXT: Record<string, string> = {
    // infra
    tf: 'logos:terraform-icon', hcl: 'logos:terraform-icon', tfvars: 'logos:terraform-icon',
    // shell
    sh: 'logos:bash', bash: 'logos:bash', zsh: 'logos:bash', fish: 'logos:bash',
    // languages / web
    js: 'logos:javascript', mjs: 'logos:javascript', cjs: 'logos:javascript',
    ts: 'logos:typescript-icon', tsx: 'logos:typescript-icon',
    jsx: 'logos:react', vue: 'logos:vue',
    go: 'logos:gopher', py: 'logos:python', php: 'logos:php',
    css: 'logos:css-3', scss: 'logos:sass', sass: 'logos:sass', less: 'logos:css-3',
    html: 'logos:html-5', htm: 'logos:html-5',
    // data / config
    json: 'logos:json', yaml: 'logos:yaml', yml: 'logos:yaml',
    toml: 'material-symbols:settings', ini: 'material-symbols:settings',
    conf: 'material-symbols:settings', env: 'material-symbols:settings',
    sql: 'material-symbols:database',
    // docs
    md: 'logos:markdown', mdx: 'logos:markdown', markdown: 'logos:markdown',
    // images
    png: 'material-symbols:image-outline', jpg: 'material-symbols:image-outline',
    jpeg: 'material-symbols:image-outline', gif: 'material-symbols:image-outline',
    svg: 'material-symbols:image-outline', webp: 'material-symbols:image-outline',
    avif: 'material-symbols:image-outline',
    // languages without a verified brand glyph → generic code icon
    rb: 'material-symbols:code', rs: 'material-symbols:code', java: 'material-symbols:code',
    c: 'material-symbols:code', cpp: 'material-symbols:code',
}

// Icons for special, extensionless filenames.
const ICON_BY_NAME: Record<string, string> = {
    dockerfile: 'logos:docker-icon',
    mongosh: 'logos:mongodb-icon',
    makefile: 'material-symbols:terminal',
    '.gitignore': 'material-symbols:settings',
    '.gitattributes': 'material-symbols:settings',
    '.dockerignore': 'material-symbols:settings',
    '.editorconfig': 'material-symbols:settings',
}

const DEFAULT_ICON = 'material-symbols:description-outline'

// Pick an icon for the filename header based on the filename (extension or name).
const fileIcon = computed(() => {
    const name = (props.filename || '').toLowerCase()
    if (!name) {
        return props.language === 'bash' ? 'logos:bash' : DEFAULT_ICON
    }

    const base = name.split('/').pop() || name
    if (ICON_BY_NAME[base]) return ICON_BY_NAME[base]

    const ext = base.includes('.') ? base.split('.').pop()! : ''
    return ICON_BY_EXT[ext] || DEFAULT_ICON
})

const copiedState = ref<boolean>(false)

const copyCode = () => {
    navigator.clipboard.writeText(props.code)
    copiedState.value = true
    setTimeout(() => {
        copiedState.value = false
    }, 1200)
}
</script>
