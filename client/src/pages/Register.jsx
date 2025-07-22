import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('tech')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()


  const submit = async e => {
    e.preventDefault()
    try {
      await api.post('/auth/register', { name, email, password, role, phone })
      setMsg('User created.')
      setName(''); setEmail(''); setPassword(''); setPhone('')
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Registration failed')
    }
  }

  return (
    <div className="container my-4" style={{ maxWidth: 400 }}>
      <h2>Create User</h2>

      {msg && <p>{msg}</p>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label><br />
          <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone</label><br />
          <input className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="form-label">Role</label><br />
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="tech">Technician</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <p></p>
        <div className="d-flex align-items-center gap-2 mb-3">
          <button type="submit" className="btn btn-primary">
            Create
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin')}
          >
            Back
          </button>
        </div>

      </form>
    </div>
  )
}
