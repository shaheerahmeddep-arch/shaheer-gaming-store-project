import axios from 'axios'

const isProduction = typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'

let defaultBaseURL
if (typeof window !== 'undefined' && isProduction) {
  defaultBaseURL = '/api'
} else {
  defaultBaseURL = 'http://127.0.0.1:8000/api'
}

const API_URL = import.meta.env.VITE_API_URL || defaultBaseURL

export function resolveMediaUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('//')) return window.location.protocol + url
  if (url.startsWith('/media/') || url.startsWith('/static/')) {
    if (isProduction) return url
    const backendOrigin = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/api\/?$/, '')
    return backendOrigin + url
  }
  return url
}

const api = axios.create({
  baseURL: API_URL,
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refresh token on 401
let isRefreshing = false
let queue = []

const processQueue = (error, token = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  queue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refresh_token') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh = localStorage.getItem('refresh_token')
        const res = await axios.post(`${API_URL}/auth/login/refresh/`, { refresh })
        const newAccess = res.data.access
        localStorage.setItem('access_token', newAccess)
        processQueue(null, newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

/* ---------------- PRODUCTS ---------------- */
export const getProducts = (params = {}) => api.get('/products/', { params })
export const getProduct = (id) => api.get(`/products/${id}/`)
// NOTE: don't set a manual Content-Type header for FormData requests.
// Axios/the browser needs to generate its own multipart boundary automatically;
// forcing the header here strips the boundary and Django can't parse the upload.
export const createProduct = (formData) => api.post('/products/', formData)
export const updateProduct = (id, formData) => api.put(`/products/${id}/`, formData)
export const patchProduct = (id, data) => api.patch(`/products/${id}/`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}/`)

/* ---------------- AUTH ---------------- */
export const loginUser = (credentials) => api.post('/auth/login/', credentials)
export const registerUser = (data) => api.post('/auth/register/', data)
export const logoutUser = (refresh) => api.post('/auth/logout/', { refresh })
export const getMe = () => api.get('/auth/me/')
export const updateMe = (data) => api.patch('/auth/me/', data)

/* ---------------- USERS (admin) ---------------- */
export const getUsers = () => api.get('/auth/users/')
export const getUser = (id) => api.get(`/auth/users/${id}/`)
export const updateUser = (id, data) => api.patch(`/auth/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/auth/users/${id}/`)

/* ---------------- ORDERS ---------------- */
export const getOrders = () => api.get('/orders/')
export const getOrder = (id) => api.get(`/orders/${id}/`)
export const createOrder = (data) => api.post('/orders/', data)
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/`, { status })
export const deleteOrder = (id) => api.delete(`/orders/${id}/`)

export default api
