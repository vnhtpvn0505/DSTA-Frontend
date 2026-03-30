import axios from 'axios'
import { getDevAccessToken, clearDevAccessToken } from '@/lib/auth-token'
import { useAuthStore } from '@/stores/auth.store'

const resolveBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  // Fallback to known backend URL — do NOT use window.location.origin as that
  // points to the frontend host (breaks on Vercel where FE and BE are different domains)
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
  if (typeof window === 'undefined') {
    return config
  }

  // Attach stored access token as Bearer on ALL environments.
  // On localhost cookies also work; on cross-domain (Vercel → HTTP backend)
  // cookies are blocked by the browser so the Bearer header is the only option.
  const token = getDevAccessToken()
  if (token) {
    config.headers = config.headers || {}
    if (!('Authorization' in config.headers)) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
