/**
 * Safely parse JSON from localStorage with error handling
 * @param {string} key - localStorage key
 * @param {*} fallback - fallback value if parsing fails
 * @returns {*} parsed value or fallback
 */
export function safeGetJSON(key, fallback = null) {
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback
    return JSON.parse(item)
  } catch (err) {
    // If JSON is malformed, clear it and return fallback
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Failed to parse localStorage key "${key}":`, err)
    }
    localStorage.removeItem(key)
    return fallback
  }
}

/**
 * Safely set JSON to localStorage
 * @param {string} key - localStorage key
 * @param {*} value - value to store
 */
export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Failed to set localStorage key "${key}":`, err)
    }
  }
}

/**
 * Get the current user from localStorage
 * @returns {object|null} user object or null
 */
export function getStoredUser() {
  return safeGetJSON('user', null)
}

/**
 * Get the auth token from localStorage
 * @returns {string|null} token or null
 */
export function getStoredToken() {
  return localStorage.getItem('token')
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
