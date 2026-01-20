import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Alert, Spinner } from 'react-bootstrap'
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi'
import api from '../utils/api'
import { useAuth } from '../auth'
import { safeSetJSON } from '../utils/storage'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const ROLE_HOME = { admin: '/admin', tech: '/tech' }

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      safeSetJSON('user', data.user)
      setAuth({ token: data.token, user: data.user })
      const target = ROLE_HOME[data.user.role] || '/login'
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div style={{
            width: 70,
            height: 70,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
          }}>
            <FiLogIn size={32} color="white" />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your elevator maintenance account</p>
        </div>

        {error && (
          <Alert variant="danger" className="alert-modern" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Email Address</Form.Label>
            <div className="position-relative">
              <Form.Control
                className="form-control-modern ps-5"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <FiMail
                size={18}
                className="position-absolute text-muted"
                style={{ left: 16, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Password</Form.Label>
            <div className="position-relative">
              <Form.Control
                className="form-control-modern ps-5"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <FiLock
                size={18}
                className="position-absolute text-muted"
                style={{ left: 16, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </Form.Group>

          <Button
            type="submit"
            className="btn-gradient-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn className="me-2" />
                Sign In
              </>
            )}
          </Button>
        </Form>

        <div className="text-center mt-4 text-muted" style={{ fontSize: '0.875rem' }}>
          Elevator Maintenance System v1.0
        </div>
      </div>
    </div>
  )
}
