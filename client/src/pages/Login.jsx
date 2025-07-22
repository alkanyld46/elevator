import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate(data.user.role === 'admin' ? '/admin' : '/tech')
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed')
    }
  }

  return (
    <div className="container my-4" style={{ maxWidth: 320 }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={submit}>
      <div className="mb-3">
      <label className="form-label">Email</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
        <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Log In
        </button>
      </form>
    </div>
  )
}
