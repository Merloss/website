<template>
  <div class="flex space-x-1 rounded-lg p-0.5 w-fit">
    <button v-for="theme in THEMES" :key="theme.key" type="button"
      class="p-1.5 rounded-md transition-colors duration-200 flex items-center cursor-pointer" :class="[
        colorMode.preference === theme.key
          ? 'bg-gray-200 dark:bg-white/20 text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-200',
      ]" :aria-label="`Switch to ${theme.label} mode`" @click="colorMode.preference = theme.key">
      <Icon :size="20" :name="theme.icon" />
    </button>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
</script>