import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { format } from 'date-fns'

export default function Dashboard() {
  const [elevators, setElevators] = useState([])
  const [records, setRecords] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/elevators').then(res => setElevators(res.data))
    api.get('/records').then(res => setRecords(res.data))
  }, [])

  const total = elevators.length
  const doneElevatorIds = new Set(records.map(r => r.elevator?._id || r.elevator))
  const done = doneElevatorIds.size
  const pending = total - done

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // group by tech name
  const byTech = {}
  records.forEach(r => {
    const name = r.user?.name || 'Unknown'
    if (!byTech[name]) byTech[name] = []
    byTech[name].push(r)
  })

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => navigate('/elevators')}>Manage Elevators</button>
        <button style={{ marginLeft: 10 }} onClick={() => navigate('/register')}>
          Create User
        </button>
        <button style={{ marginLeft: 10 }} onClick={logout}>
          Logout
        </button>
      </div>
      <p>Total elevators: {total}</p>
      <p>Maintained: {done}</p>
      <p>Pending: {pending}</p>

      <h3>By Technician</h3>
      {Object.keys(byTech).length === 0 && <p>No maintenance yet.</p>}
      {Object.entries(byTech).map(([name, list]) => (
        <div key={name}>
          <strong>{name}</strong>
          <ul>
            {list.map(rec => (
              <li key={rec._id}>
                {rec.elevator?.name} @ {rec.elevator?.location} — {format(new Date(rec.timestamp), 'PP p')}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
