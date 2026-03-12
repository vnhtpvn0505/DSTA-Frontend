import axios from 'axios'

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
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
