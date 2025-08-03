<script setup lang="ts">
defineProps<{
    title?: string
    description?: string
}>()
</script>

<template>
    <div class="h-full w-full flex items-start justify-start bg-white relative overflow-hidden">
        <!-- Dotted pattern with SVG as background -->
        <div class="absolute inset-0 w-full h-full pointer-events-none"
            style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMiIgZmlsbD0iIzAwMCIgb3BhY2l0eT0iMC4xIi8+PC9zdmc+'); background-size: 30px 30px;">
        </div>

        <div class="absolute inset-0 border border-gray-200"></div>

        <div class="relative z-10 p-20 w-full h-full flex flex-col justify-center items-center">
            <div class="text-center w-full flex flex-col items-center">
                <h1 class="text-7xl font-bold text-gray-900 leading-tight mb-8 text-center">
                    {{ title }}
                </h1>

                <p v-if="description" class="text-4xl text-gray-600 leading-relaxed max-w-4xl text-center">
                    {{ description }}
                </p>
            </div>
        </div>
    </div>
</template>
