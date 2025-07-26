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
    <div className="container my-4">
      <h2>User's Info</h2>
      <div className="mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>Back</button>
      </div>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <button className="btn btn-link p-0 me-2" onClick={() => showInfo(u._id)}>Info</button>
                <button className="btn btn-link text-danger p-0" onClick={() => remove(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}