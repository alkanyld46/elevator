import axios from 'axios'
import { getStoredToken, clearAuth } from './storage'

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://elevator-a8d0.onrender.com/api',
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
