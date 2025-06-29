/* eslint-disable no-unused-vars */
import { ref, onMounted } from 'vue'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const loading = ref(false)
  const error = ref(null)

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-email':
        return 'Incorrect email or password'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection'
      default:
        return 'Incorrect email or password'
    }
  }

  const signIn = async (email, password) => {
    loading.value = true
    error.value = null

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const token = await userCredential.user.getIdToken()

      authStore.setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        token,
      })

      router.push('/')
    } catch (err) {
      error.value = getFirebaseErrorMessage(err.code)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      authStore.logout()
      router.push('/signin')
    } catch (err) {
      error.value = getFirebaseErrorMessage(err.code)
    }
  }

  const initAuth = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken()
        authStore.setUser({
          uid: user.uid,
          email: user.email,
          token,
        })
      } else {
        authStore.logout()
      }
    })
  }

  return {
    signIn,
    logout,
    initAuth,
    loading,
    error,
  }
}
