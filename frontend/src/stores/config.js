import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  const config = ref({})
  const isLoading = ref(false)

  function setConfig(configData) {
    config.value = configData
  }

  function setLoading(status) {
    isLoading.value = status
  }

  return { config, isLoading, setConfig, setLoading }
})
