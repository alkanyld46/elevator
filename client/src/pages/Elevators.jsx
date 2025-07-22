import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Elevators() {
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')
  const [schedules, setSchedules] = useState([{ date: '' }])
  const [selectedId, setSelectedId] = useState('')
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const perPage = 5

  const fetchList = () => {
    api.get('/elevators').then(res => setList(res.data))
  }

  useEffect(() => {
    fetchList()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, list])

  const submit = async e => {
    e.preventDefault()
    const payload = {
      name,
      location,
      qrCodeData,
      maintenanceSchedules: schedules,
    }
    if (editId) {
      await api.put(`/elevators/${editId}`, payload)
    } else {
      await api.post('/elevators', payload)
    }
    cancelEdit()
    fetchList()
  }

  const cancelEdit = () => {
    setEditId(null)
    setName('')
    setLocation('')
    setQrCodeData('')
    setSchedules([{ date: '' }])
    setSelectedId('')

  }

  const filtered = list.filter(el =>
    el.name.toLowerCase().includes(search.toLowerCase()) ||
    el.location.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const start = (page - 1) * perPage
  const paged = filtered.slice(start, start + perPage)

  return (
    <div className="container my-4">
      <h2>Manage Elevators</h2>
      <div className="mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>Back</button>
      </div>
      <div className="mb-3">
        <input
          className="form-control"
          placeholder="Search by name or location"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="mt-2">
        <button
          className="btn btn-primary me-2"
          disabled={!selectedId}
          onClick={() => {
            const el = list.find(e => e._id === selectedId)
            if (!el) return
            setEditId(el._id)
            setName(el.name)
            setLocation(el.location)
            setQrCodeData(el.qrCodeData)
            setSchedules(
              (el.maintenanceSchedules || []).map(s => ({ date: s.date.slice(0, 7) }))
            )
          }}
        >
          Edit Selected
        </button>
        <button
          className="btn btn-danger"
          disabled={!selectedId}
          onClick={async () => {
            if (!window.confirm('Delete elevator?')) return
            await api.delete(`/elevators/${selectedId}`)
            cancelEdit()
            fetchList()
          }}
        >
          Delete Selected
        </button>
      </div>
      <p></p>
      <form onSubmit={submit} className="mb-3">
        <div className="mb-2">
          <input
            className="form-control"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <input
            className="form-control"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <input
            className="form-control"
            placeholder="QR Code Data"
            value={qrCodeData}
            onChange={e => setQrCodeData(e.target.value)}
            required
          />
        </div>
        {schedules.map((s, idx) => (
          <div key={idx} className="mb-2 d-flex align-items-center">
            <input
              className="form-control me-2"
              type="month"
              value={s.date}
              onChange={e => {
                const arr = [...schedules]
                arr[idx].date = e.target.value
                setSchedules(arr)
              }}
              required
            />
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => setSchedules(schedules.filter((_, i) => i !== idx))}
            >
              X
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-2" onClick={() => setSchedules([...schedules, { date: '' }])}>
          Add Schedule
        </button>
        <button type="submit" className="btn btn-primary  mb-2 ">
          {editId ? 'Update Elevator' : 'Add Elevator'}
        </button>
        {editId && (
          <button type="button" className="btn btn-secondary mb-2 ms-2" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </form>
      <ul className="list-group">
        {paged.map(el => (
          <li key={el._id} className="list-group-item d-flex align-items-start">
            <input
              type="radio"
              name="selectedElevator"
              className="form-check-input me-2"
              value={el._id}
              checked={selectedId === el._id}
              onChange={() => setSelectedId(el._id)}
            />
            <div className="flex-grow-1">
              {el.name} @ {el.location}
              {el.maintenanceSchedules && el.maintenanceSchedules.length > 0 && (
                <ul className="mt-2">
                  {el.maintenanceSchedules.map((s, i) => (
                    <li key={i}>{new Date(s.date).toLocaleDateString()}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>
    </div >
  )
}