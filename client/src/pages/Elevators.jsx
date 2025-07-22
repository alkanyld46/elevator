import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Elevators() {
  const [list, setList] = useState([])
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [qrCodeData, setQrCodeData] = useState('')
  const [schedules, setSchedules] = useState([{ date: '' }])
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
      maintenanceSchedules: schedules,
    })
    setName('')
    setLocation('')
    setQrCodeData('')
    setSchedules([{ date: '' }])
    fetchList()
  }

  const remove = async id => {
    if (!window.confirm('Delete elevator?')) return
    await api.delete(`/elevators/${id}`)
    fetchList()
  }



  return (
    <div className="container my-4">
      <h2>Manage Elevators</h2>
      <div className="mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>Back</button>
      </div>
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
          <div key={idx} className="mb-2 d-flex">
            <input
              className="form-control"
              type="month"
              value={s.date}
              onChange={e => {
                const arr = [...schedules]
                arr[idx].date = e.target.value
                setSchedules(arr)
              }}
              required
            />

          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-2" onClick={() => setSchedules([...schedules, { date: '' }])}>
          Add Schedule
        </button>
        <button type="submit" className="btn btn-primary  mb-2 ">
          Add Elevator
        </button>
      </form>
      <ul className="list-group">
        {list.map(el => (
          <li key={el._id} className="list-group-item">
            {el.name} @ {el.location}
            {el.maintenanceSchedules && el.maintenanceSchedules.length > 0 && (
              <ul className="mt-2">
                {el.maintenanceSchedules.map((s, i) => (
                  <li key={i}>
                    {new Date(s.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="btn btn-sm btn-danger ms-2"
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