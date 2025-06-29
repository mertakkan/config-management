<template>
  <div class="text-center text-red-400">
    <div class="mb-4">
      <svg
        class="w-16 h-16 mx-auto mb-4 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      </svg>
      <p class="text-lg">{{ error }}</p>
    </div>
    <button
      @click="$emit('retry')"
      class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Retry
    </button>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    required: true,
  },
})

defineEmits(['retry'])
</script>
