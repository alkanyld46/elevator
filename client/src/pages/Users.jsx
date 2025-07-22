import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Users() {
  const [list, setList] = useState([])
  const navigate = useNavigate()

  const fetchList = () => {
    api.get('/users').then(res => setList(res.data))
  }

  useEffect(() => {
    fetchList()
  }, [])

  const remove = async id => {
    if (!window.confirm('Delete user?')) return
    await api.delete(`/users/${id}`)
    fetchList()
  }

  const showInfo = async id => {
    const u = list.find(u => u._id === id)
    if (!u) return
    alert(`Name: ${u.name}\nEmail: ${u.email}\nRole: ${u.role}\nPhone: ${u.phone || ''}`)
  }


  return (
    <div className="container">
      <h2>Manage Users</h2>
      <div className="mb-3" style={{ marginBottom: 10 }}>
        <button className="form-control" onClick={() => navigate('/admin')}>Back</button>
      </div>
      <ul >
        {list.map(u => (
          <li className="d-flex align-items-center gap-2 mb-3" key={u._id} style={{ marginBottom: 6 }}>
            {u.name} ({u.email})
            <button style={{ marginLeft: 10 }} onClick={() => showInfo(u._id)}>
              Info
            </button>
            <button style={{ marginLeft: 10 }} onClick={() => remove(u._id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}