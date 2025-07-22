import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function TechHome() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [current, setCurrent] = useState([])

  useEffect(() => {
    api.get('/elevators/current').then(res => setCurrent(res.data))
  }, [])

  return (
    <div className="container my-4">
      <h2>Welcome {user.name}</h2>
      <p>Current month elevators:</p>
      <ul>
        {current.map(el => (
          <li key={el._id}>{el.name} @ {el.location}</li>
        ))}
      </ul>
      <p>Press the button to scan an elevator QR code.</p>
      <button className="btn btn-primary" onClick={() => navigate('/scanner')}>
        Scan QR Code
      </button>
    </div>
  )
}
