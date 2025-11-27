import axios from 'axios'
import { removeStorageItem } from '@utils/storage'

type requestBodyType = Record<string, any>

axios.defaults.withCredentials = true

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 20000
})

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Response interceptor for handling 401 errors
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      const errorCode = error.response?.data?.code

      // Don't retry for specific error codes
      if (errorCode === 'NO_TOKEN' || errorCode === 'USER_NOT_FOUND' || originalRequest._retry) {
        // Clear session and redirect to login
        removeStorageItem('session', 'isLoggedIn')
        window.location.replace('/')
        return Promise.reject(error)
      }

      // Token might be expired, try to refresh
      if (errorCode === 'INVALID_TOKEN' && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => API(originalRequest))
            .catch(err => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // Attempt to refresh token
          await axios.post('/api/user/refresh-token', {}, { withCredentials: true })
          
          isRefreshing = false
          processQueue()
          
          // Retry original request
          return API(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout user
          isRefreshing = false
          processQueue(refreshError)
          removeStorageItem('session', 'isLoggedIn')
          window.location.replace('/')
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

type payload = Record<string, any>

const get = async (URL: string, config?: payload) => await API.get(URL, config).then(response => response)

const post = async (URL: string, payload: payload, config?: payload) => await API.post(URL, payload, config).then(response => response)

const put = async (URL: string, payload: payload, config?: payload) => await API.put(URL, payload, config).then(response => response)

const patch = async (URL: string, payload: payload, config?: payload) => await API.patch(URL, payload, config).then(response => response)

const remove = async (URL: string, config?: payload) => await API.delete(URL, config).then((response: any) => response)

const generateAPIMethods = (url: string) => {
  return {
    get: async (requestBody: requestBodyType) => await get(url, requestBody),
    getByCategory: async (requestBody: requestBodyType) => await get(`${url}/category/${requestBody.category}`, requestBody),
    getById: async (requestBody: requestBodyType) => await get(`${url}/${requestBody._id}`, requestBody),
    create: async (requestBody: requestBodyType) => await post(url, requestBody),
    updateById: async (requestBody: requestBodyType) => await patch(`${url}/${requestBody._id}`, requestBody),
    delete: async (requestBody: requestBodyType) => await remove(`${url}/${requestBody._id}`, requestBody),
    exportExcel: async (requestBody: requestBodyType) => await get(`${url}/export/excel`, { 
      ...requestBody, 
      responseType: 'blob' 
    }),
    exportCsv: async (requestBody: requestBodyType) => await get(`${url}/export/csv`, { 
      ...requestBody, 
      responseType: 'blob' 
    }),
    exportPdf: async (requestBody: requestBodyType) => await get(`${url}/export/pdf`, { 
      ...requestBody, 
      responseType: 'blob' 
    }),
  }
}

export {generateAPIMethods, get, post, put, patch, remove}