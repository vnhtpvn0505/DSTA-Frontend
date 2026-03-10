import axios from 'axios'

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || 'http://220.231.94.117:8081/api/v1',
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
