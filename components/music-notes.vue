<template>
    <div ref="notesContainer" class="inline-block" />
</template>

<script setup>
const notesContainer = ref(null)

const spawnNote = () => {
    const noteContainer = document.createElement('div')
    noteContainer.textContent = ['♪', '♫', '♬'][Math.floor(Math.random() * 3)]

    const animationClass = [
        'animate-note-left',
        'animate-note-right',
        'animate-note-top-left',
        'animate-note-top-right',
        'animate-note-straight-left',
        'animate-note-straight-right',
    ][Math.floor(Math.random() * 6)]

    noteContainer.className = `dark:text-white text-md absolute opacity-20 select-none ${animationClass}`
    noteContainer.style.animationDelay = '0s'

    if (notesContainer.value) {
        notesContainer.value.appendChild(noteContainer)

        setTimeout(() => {
            notesContainer.value?.removeChild(noteContainer)
        }, 3000)
    }
}

let interval
onMounted(() => {
    interval = setInterval(spawnNote, 300)
})

onUnmounted(() => {
    clearInterval(interval)
})
</script>

<style scoped>
/* Add your animation classes here if needed */
</style>