<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-semibold text-red-400 mb-4">Configuration Conflict</h3>
      <p class="text-gray-300 mb-4">
        The configuration has been modified by another user. Please refresh to see the latest
        changes.
      </p>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          @click="$emit('refresh')"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
})

defineEmits(['close', 'refresh'])
</script>
