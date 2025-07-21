import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Elevators() {
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')
  const [assignedMonth, setAssignedMonth] = useState('')
  const navigate = useNavigate()

  const fetchList = () => {
    api.get('/elevators').then(res => setList(res.data))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const submit = async e => {
    e.preventDefault()
    await api.post('/elevators', {
      name,
      location,
      qrCodeData,
      assignedMonth,
    })
    setName('')
    setLocation('')
    setQrCodeData('')
    setAssignedMonth('')
    fetchList()
  }

  const remove = async id => {
    if (!window.confirm('Delete elevator?')) return
    await api.delete(`/elevators/${id}`)
    fetchList()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Elevators</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => navigate('/admin')}>Back</button>
        <button style={{ marginLeft: 10 }} onClick={logout}>Logout</button>
      </div>
      <form onSubmit={submit} style={{ marginBottom: 20 }}>
        <div>
          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            placeholder="QR Code Data"
            value={qrCodeData}
            onChange={e => setQrCodeData(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="month"
            value={assignedMonth}
            onChange={e => setAssignedMonth(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: 10 }}>
          Add Elevator
        </button>
      </form>
      <ul>
        {list.map(el => (
          <li key={el._id} style={{ marginBottom: 6 }}>
            {el.name} @ {el.location} -{' '}
            {new Date(el.assignedMonth).toLocaleDateString()}
            <button
              style={{ marginLeft: 10 }}
              onClick={() => remove(el._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}