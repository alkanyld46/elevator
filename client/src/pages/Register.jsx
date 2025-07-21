import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tech')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const submit = async e => {
    e.preventDefault()
    try {
      await api.post('/auth/register', { name, email, password, role })
      setMsg('User created.')
      setName(''); setEmail(''); setPassword('')
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Registration failed')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 400 }}>
      <h2>Create User</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => navigate('/admin')}>Back</button>
        <button style={{ marginLeft: 10 }} onClick={logout}>Logout</button>
      </div>
      {msg && <p>{msg}</p>}
      <form onSubmit={submit}>
        <div>
          <label>Name</label><br />
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label><br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label><br />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Role</label><br />
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="tech">Technician</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="primary-btn" style={{ marginTop: 10 }}>
        Create
        </button>  
        </form>
    </div>
  )
}
