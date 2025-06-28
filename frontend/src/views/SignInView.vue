<template>
  <div class="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4">
    <!-- Logo -->
    <div class="mb-8">
      <Logo size="xl" />
    </div>

    <!-- Sign In Form -->
    <div class="w-full max-w-sm">
      <h2 class="text-center text-xl text-gray-400 mb-8">Please sign in</h2>

      <form @submit.prevent="handleSignIn" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="E-mail address"
            required
            class="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            class="w-full px-4 py-3 bg-transparent border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div v-if="error" class="text-red-400 text-sm text-center">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </form>
    </div>

    <!-- Footer -->
    <div class="mt-16 text-center text-gray-500 text-sm">Codeway © 2021</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import Logo from '@/components/CompanyLogo.vue'

const { signIn, loading, error } = useAuth()

const email = ref('')
const password = ref('')

const handleSignIn = async () => {
  await signIn(email.value, password.value)
}
</script>
