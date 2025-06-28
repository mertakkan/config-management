import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export function useConfig() {
  const authStore = useAuthStore()
  const config = ref({})
  const loading = ref(false)
  const error = ref(null)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

  const fetchConfig = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_BASE_URL}/config/admin`, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`,
        },
      })
      config.value = response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch configuration'
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (configData) => {
    loading.value = true
    error.value = null

    try {
      const response = await axios.put(`${API_BASE_URL}/config/admin`, configData, {
        headers: {
          Authorization: `Bearer ${authStore.user?.token}`,
          'Content-Type': 'application/json',
        },
      })
      config.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update configuration'
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
