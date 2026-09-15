<script setup lang="ts">
defineProps<{
  message: string
  actionLabel: string
  tone?: 'muted' | 'error'
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="mt-10">
    <p :class="tone === 'error' ? 'text-ember' : 'text-sm text-muted'">{{ message }}</p>
    <button
      type="button"
      class="mt-3 cursor-pointer rounded-full bg-star px-3 py-1 text-sm text-galaxy"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
