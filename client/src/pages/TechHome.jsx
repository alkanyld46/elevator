import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function TechHome() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user.name}</h2>
      <p>Press the button to scan an elevator QR code.</p>
      <button onClick={() => navigate('/scanner')}>Scan QR Code</button>
      <button style={{ marginLeft: 10 }} onClick={logout}>Logout</button>
    </div>
  )
}
