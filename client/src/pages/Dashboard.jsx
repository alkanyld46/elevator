import React, { useEffect, useState } from 'react'
import api from '../utils/api'
import { format } from 'date-fns'

export default function Dashboard() {
  const [elevators, setElevators] = useState([])
  const [records, setRecords] = useState([])

  useEffect(() => {
    api.get('/elevators').then(res => setElevators(res.data))
    api.get('/records').then(res => setRecords(res.data))
  }, [])

  const total = elevators.length
  const doneElevatorIds = new Set(records.map(r => r.elevator?._id || r.elevator))
  const done = doneElevatorIds.size
  const pending = total - done

  // group by tech name
  const byTech = {}
  records.forEach(r => {
    const name = r.user?.name || 'Unknown'
    if (!byTech[name]) byTech[name] = []
    byTech[name].push(r)
  })

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
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
