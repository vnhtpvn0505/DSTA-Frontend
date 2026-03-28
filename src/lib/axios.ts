import axios from 'axios'
import { getDevAccessToken, isLocalDebugHost, clearDevAccessToken } from '@/lib/auth-token'
import { useAuthStore } from '@/stores/auth.store'

const resolveBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/v1`
  }

  return 'http://220.231.94.117:8081/api/v1'
}

const axiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Request config: set to true to avoid redirect to login on 401 (caller handles error). */
export const SKIP_AUTH_REDIRECT = 'skipAuthRedirect'

axiosInstance.interceptors.request.use((config) => {
  if (typeof window === 'undefined' || !isLocalDebugHost()) {
    return config
  }

  const token = getDevAccessToken()
  if (!token) {
    return config
  }

  config.headers = config.headers || {}
  if (!('Authorization' in config.headers)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      if ((error.config as { [SKIP_AUTH_REDIRECT]?: boolean })?.[SKIP_AUTH_REDIRECT]) {
        // Caller will handle 401 (e.g. show message on exam page)
      } else {
        const path = window.location.pathname
        if (path !== '/' && !path.startsWith('/login') && !path.startsWith('/register')) {
          // Clear store AND dev token before redirecting
          useAuthStore.getState().clearUser()
          clearDevAccessToken()
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
