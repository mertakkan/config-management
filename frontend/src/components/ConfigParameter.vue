<template>
  <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
    <div class="flex flex-col space-y-4">
      <div>
        <span class="text-sm text-gray-400">Parameter Key:</span>
        <span class="text-white ml-2">{{ parameterKey }}</span>
      </div>

      <div>
        <span class="text-sm text-gray-400">Value:</span>
        <span class="text-white ml-2">{{ value }}</span>
      </div>

      <div>
        <span class="text-sm text-gray-400">Description:</span>
        <span class="text-gray-300 ml-2">{{ description }}</span>
      </div>

      <div>
        <span class="text-sm text-gray-400">Create Date:</span>
        <span class="text-gray-300 ml-2">{{ formatDate(createDate) }}</span>
      </div>

      <div class="flex space-x-3 pt-2">
        <button
          @click="$emit('edit')"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Edit
        </button>
        <button
          @click="$emit('delete')"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Del
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  parameterKey: String,
  value: [String, Number],
  description: String,
  createDate: [String, Number, Date],
})

defineEmits(['edit', 'delete'])

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
