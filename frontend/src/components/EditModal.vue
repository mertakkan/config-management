<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-semibold text-white mb-4">Edit Parameter</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Parameter Key</label>
          <input
            v-model="editData.key"
            :disabled="!isNewParameter"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Value</label>
          <input
            v-model="editData.value"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea
            v-model="editData.description"
            rows="3"
            class="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          @click="save"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  parameter: Object,
  isNewParameter: Boolean,
})

const emit = defineEmits(['close', 'save'])

const editData = ref({
  key: '',
  value: '',
  description: '',
})

watch(
  () => props.parameter,
  (newParam) => {
    if (newParam) {
      editData.value = { ...newParam }
    }
  },
  { immediate: true },
)

const save = () => {
  emit('save', editData.value)
}
</script>
