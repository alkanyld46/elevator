import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap'
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus, FiArrowLeft } from 'react-icons/fi'
import api from '../utils/api'

// Password strength checker
function getPasswordStrength(password) {
  if (!password) return { level: 'none', text: '' }
  
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { level: 'weak', text: 'Weak password' }
  if (score <= 3) return { level: 'medium', text: 'Medium strength' }
  return { level: 'strong', text: 'Strong password' }
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('tech')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

  const submit = async e => {
    e.preventDefault()
    
    // Client-side validation
    if (password.length < 8) {
      setMsg({ type: 'danger', text: 'Password must be at least 8 characters long' })
      return
    }

    setMsg({ type: '', text: '' })
    setLoading(true)

    try {
      await api.post('/auth/register', { name, email, password, role, phone })
      setMsg({ type: 'success', text: 'User created successfully!' })
      setName('')
      setEmail('')
      setPassword('')
      setPhone('')
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.msg || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4 fade-in">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card-modern p-4 p-md-5">
            <div className="d-flex align-items-center mb-4">
              <Button
                variant="link"
                className="p-0 me-3 text-muted"
                onClick={() => navigate('/admin')}
              >
                <FiArrowLeft size={24} />
              </Button>
              <div>
                <h2 className="page-title mb-0">Create New User</h2>
                <p className="page-subtitle mb-0">Add a technician or admin account</p>
              </div>
            </div>

            {msg.text && (
              <Alert 
                variant={msg.type} 
                className="alert-modern" 
                onClose={() => setMsg({ type: '', text: '' })} 
                dismissible
              >
                {msg.text}
              </Alert>
            )}

            <Form onSubmit={submit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Full Name</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    className="form-control-modern ps-5"
                    placeholder="Enter full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <FiUser 
                    size={18} 
                    className="position-absolute text-muted" 
                    style={{ left: 16, top: '50%', transform: 'translateY(-50%)' }} 
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email Address</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    className="form-control-modern ps-5"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <FiMail 
                    size={18} 
                    className="position-absolute text-muted" 
                    style={{ left: 16, top: '50%', transform: 'translateY(-50%)' }} 
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    className="form-control-modern ps-5"
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <FiLock 
                    size={18} 
                    className="position-absolute text-muted" 
                    style={{ left: 16, top: '50%', transform: 'translateY(-50%)' }} 
                  />
                </div>
                {password && (
                  <>
                    <div className="password-strength">
                      <div className={`password-strength-bar ${passwordStrength.level}`} />
                    </div>
                    <small className={`text-${passwordStrength.level === 'weak' ? 'danger' : passwordStrength.level === 'medium' ? 'warning' : 'success'}`}>
                      {passwordStrength.text}
                    </small>
                  </>
                )}
                <Form.Text className="text-muted d-block mt-1">
                  Minimum 8 characters. Include uppercase, numbers, and symbols for better security.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Phone Number</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    className="form-control-modern ps-5"
                    type="tel"
                    placeholder="Enter phone number (optional)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <FiPhone 
                    size={18} 
                    className="position-absolute text-muted" 
                    style={{ left: 16, top: '50%', transform: 'translateY(-50%)' }} 
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Role</Form.Label>
                <Form.Select
                  className="form-control-modern"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="tech">Technician</option>
                  <option value="admin">Administrator</option>
                </Form.Select>
              </Form.Group>

              <Row>
                <Col>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => navigate('/admin')}
                  >
                    <FiArrowLeft className="me-2" />
                    Back
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="submit"
                    className="btn-gradient-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="me-2" />
                        Create User
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
