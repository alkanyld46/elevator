import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function TechHome() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')


  return (
    <div className="container">
      <h2>Welcome {user.name}</h2>
      <p>Press the button to scan an elevator QR code.</p>
      <button className="primary-btn" onClick={() => navigate('/scanner')}>
        Scan QR Code
      </button>
    </div>
  )
}
