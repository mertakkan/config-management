<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden md:block">
      <table class="w-full">
        <thead class="bg-gray-700">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Parameter Key</th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Value</th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Description</th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">
              Create Date
              <button @click="toggleSort" class="ml-2 text-gray-400 hover:text-white">↑↓</button>
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr v-for="(item, key) in sortedConfig" :key="key" class="hover:bg-gray-700">
            <td class="px-6 py-4 text-sm text-white">{{ key }}</td>
            <td class="px-6 py-4 text-sm text-white">{{ item.value }}</td>
            <td class="px-6 py-4 text-sm text-gray-300">{{ item.description }}</td>
            <td class="px-6 py-4 text-sm text-gray-300">{{ formatDate(item.createDate) }}</td>
            <td class="px-6 py-4 text-sm">
              <div class="flex space-x-2">
                <button
                  @click="editParameter(key, item)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  @click="deleteParameter(key)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-4 p-4">
      <ConfigParameter
        v-for="(item, key) in sortedConfig"
        :key="key"
        :parameter-key="key"
        :value="item.value"
        :description="item.description"
        :create-date="item.createDate"
        @edit="editParameter(key, item)"
        @delete="deleteParameter(key)"
      />
    </div>

    <!-- Add New Parameter Form -->
    <div class="bg-gray-700 p-4 border-t border-gray-600">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="newParameter.key"
          placeholder="New Parameter"
          class="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <input
          v-model="newParameter.value"
          placeholder="Value"
          class="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <input
          v-model="newParameter.description"
          placeholder="New Description"
          class="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
        />
        <button
          @click="addParameter"
          :disabled="!canAddParameter"
          class="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ADD
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ConfigParameter from './ConfigParameter.vue'

const props = defineProps({
  config: Object,
})

const emit = defineEmits(['update', 'edit', 'delete'])

const sortAscending = ref(true)
const newParameter = ref({
  key: '',
  value: '',
  description: '',
})

const configItems = computed(() => {
  const items = {}
  Object.entries(props.config).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      items[key] = value
    } else {
      // Convert simple values to object format
      items[key] = {
        value: value,
        description: getDefaultDescription(key),
        createDate: Date.now(),
      }
    }
  })
  return items
})

const sortedConfig = computed(() => {
  const entries = Object.entries(configItems.value)
  return Object.fromEntries(
    entries.sort(([, a], [, b]) => {
      const dateA = new Date(a.createDate || 0)
      const dateB = new Date(b.createDate || 0)
      return sortAscending.value ? dateA - dateB : dateB - dateA
    }),
  )
})

const canAddParameter = computed(() => {
  return newParameter.value.key && newParameter.value.value && newParameter.value.description
})

const toggleSort = () => {
  sortAscending.value = !sortAscending.value
}

const addParameter = () => {
  if (!canAddParameter.value) return

  const updatedConfig = {
    ...props.config,
    [newParameter.value.key]: {
      value: newParameter.value.value,
      description: newParameter.value.description,
      createDate: Date.now(),
    },
  }

  emit('update', updatedConfig)

  // Reset form
  newParameter.value = {
    key: '',
    value: '',
    description: '',
  }
}

const editParameter = (key, item) => {
  emit('edit', { key, ...item })
}

const deleteParameter = (key) => {
  if (confirm(`Are you sure you want to delete "${key}"?`)) {
    const updatedConfig = { ...props.config }
    delete updatedConfig[key]
    emit('delete', updatedConfig)
  }
}

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

const getDefaultDescription = (key) => {
  const descriptions = {
    freeUsageLimit: 'Maximum free usage allowed',
    supportEmail: 'Support contact email',
    privacyPage: 'Privacy policy page URL',
    minimumVersion: 'Minimum required version of the app',
    latestVersion: 'Latest version of the app',
    compressionQuality: 'Image compression quality',
    btnText: 'Button text for call to action',
  }
  return descriptions[key] || 'Configuration parameter'
}
</script>
