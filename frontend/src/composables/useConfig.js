import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/ApiService'

export function useConfig() {
  const authStore = useAuthStore()
  const config = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Set auth token when user changes
  const userToken = computed(() => authStore.user?.token)
  if (userToken.value) {
    ApiService.setAuthToken(userToken.value)
  }

  const fetchConfig = async () => {
    loading.value = true
    error.value = null

    try {
      // Ensure we have the latest token
      if (userToken.value) {
        ApiService.setAuthToken(userToken.value)
      }

      const data = await ApiService.get('/config/admin')
      config.value = data
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch configuration'
      error.value = errorMessage

      // If it's an auth error, trigger logout
      if (err.response?.status === 401) {
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (configData) => {
    loading.value = true
    error.value = null

    try {
      // Ensure we have the latest token
      if (userToken.value) {
        ApiService.setAuthToken(userToken.value)
      }

      const data = await ApiService.put('/config/admin', configData)
      config.value = data
      return data
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update configuration'
      error.value = errorMessage

      // If it's an auth error, trigger logout
      if (err.response?.status === 401) {
        authStore.logout()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
  }
}
