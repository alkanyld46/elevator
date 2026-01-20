import axios from 'axios'
import { getStoredToken, clearAuth } from './storage'

// DEBUG: Log the API URL being used
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
console.log('=== API DEBUG ===')
console.log('REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL)
console.log('API_URL being used:', API_URL)
console.log('=================')

const api = axios.create({
    baseURL: API_URL,
})

api.interceptors.request.use(cfg => {
    const token = getStoredToken()
    if (token) cfg.headers.Authorization = `Bearer ${token}`
    return cfg
})

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            clearAuth()
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default api
