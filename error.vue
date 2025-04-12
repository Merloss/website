<template>
    <div
        class="flex flex-col items-center justify-center min-h-screen text-center px-6 py-12 dark:bg-dark bg-light text-gray-900 dark:text-gray-100">
        <h1 class="text-8xl font-extrabold text-primary-600 dark:text-primary-400 mb-4">
            404
        </h1>
        <p class="text-2xl font-semibold mb-3">
            Oops! Page Not Found
        </p>
        <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <NuxtLink to="/"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
            <Icon name="material-symbols:arrow-back-rounded" class="mr-2" />
            Go Back Home
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
useSeoMeta({
    title: '404 - Page Not Found',
    description: 'The page you requested could not be found.',
});
</script>