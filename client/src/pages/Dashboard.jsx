import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { format } from 'date-fns'

export default function Dashboard() {
  const [elevators, setElevators] = useState([])
  const [records, setRecords] = useState([])
  const [selectedTech, setSelectedTech] = useState('')
  const [selected, setSelected] = useState(null) // modal elevator
  const [attachments, setAttachments] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7)
    api.get('/elevators/current').then(res => setElevators(res.data))
    api.get(`/records?month=${month}`).then(res => setRecords(res.data))
  }, [])

  useEffect(() => {
    if (!selected) return
    api.get(`/records?elevator=${selected._id}`).then(res => {
      const arr = []
      res.data.forEach(r => {
        (r.attachments || []).forEach(a => {
          if (!a) return

          if (typeof a === 'string') {
            arr.push({ file: a, description: '' })
          } else if (a.file || a.filename) {
            arr.push({
              file: a.file || a.filename,
              description: a.description || ''
            })
          }
        })
      })
      setAttachments(arr)
    })
  }, [selected])

  const total = elevators.length
  const doneElevatorIds = new Set(records.map(r => r.elevator?._id || r.elevator))
  const done = doneElevatorIds.size
  const pending = total - done
  const maintainedList = elevators.filter(el => doneElevatorIds.has(el._id))
  const pendingList = elevators.filter(el => !doneElevatorIds.has(el._id))

  const recordMap = {}
  records.forEach(r => {
    const id = r.elevator?._id || r.elevator
    if (!id) return
    if (!recordMap[id] || new Date(r.timestamp) > new Date(recordMap[id].timestamp)) {
      recordMap[id] = r
    }
  })

  // group records by technician (id + name)
  const byTech = {}
  records.forEach(r => {
    const id = r.user?._id || 'unknown'
    const name = r.user?.name || 'Unknown'
    if (!byTech[id]) byTech[id] = { name, list: [] }
    byTech[id].list.push(r)
  })


  return (
    <div className="container my-4">
      <h2>Admin Dashboard</h2>
      <div className="mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/elevators')}>Manage Elevators</button>
        <button className="btn btn-secondary ms-2" onClick={() => navigate('/users')}>
          Manage Users
        </button>
        <button className="btn btn-secondary ms-2" onClick={() => navigate('/register')}>
          Create User
        </button>
      </div>

      <p>Total elevators: {total}</p>
      <p>Maintained: {done}</p>
      <p>Pending: {pending}</p>

      {/* Version 2 maintained/pending tables */}
      <h3>Maintained Elevators</h3>
      {maintainedList.length === 0 ? (
        <p>No elevators maintained yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th style={{ textAlign: 'left' }}>Location</th>
              <th style={{ textAlign: 'left' }}>Assigned</th>
              <th style={{ textAlign: 'left' }}>Maintained At</th>

              <th />
            </tr>
          </thead>
          <tbody>
            {maintainedList.map(el => (
              <tr key={el._id}>
                <td>{el.name}</td>
                <td>{el.location}</td>
                <td>{new Date(el.assignedMonth).toLocaleDateString()}</td>
                <td>{recordMap[el._id] ? new Date(recordMap[el._id].timestamp).toLocaleString() : ''}</td>
                <td>
                  <button onClick={() => setSelected(el)}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 20 }}>Pending Elevators For This Month</h3>
      {pendingList.length === 0 ? (
        <p>All elevators maintained.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Name</th>
              <th style={{ textAlign: 'left' }}>Location</th>
              <th style={{ textAlign: 'left' }}>Assigned</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pendingList.map(el => (
              <tr key={el._id}>
                <td>{el.name}</td>
                <td>{el.location}</td>
                <td>{new Date(el.assignedMonth).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => setSelected(el)}>Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Version 1 technician filter/list */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: 30 }}>
        <h3 style={{ margin: 0 }}>By Technician</h3>
        <select
          value={selectedTech}
          onChange={e => setSelectedTech(e.target.value)}
          style={{ marginLeft: 10 }}
        >
          <option value="">None Selected</option>
          {Object.entries(byTech).map(([id, info]) => (
            <option key={id} value={id}>
              {info.name}
            </option>
          ))}
        </select>
      </div>
      {Object.keys(byTech).length === 0 && <p>No maintenance yet.</p>}
      {selectedTech === '' ? (
        Object.keys(byTech).length > 0 && <p>Please select a technician.</p>
      ) : (
        <div>
          <strong>{byTech[selectedTech]?.name}</strong>
          <ul className="list-group mt-1">
            {byTech[selectedTech]?.list.map(rec => (
              <li key={rec._id} className="list-group-item">
                {rec.elevator?.name} @ {rec.elevator?.location} —{' '}
                {format(new Date(rec.timestamp), 'PP p')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Details modal */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ background: '#fff', padding: 20, borderRadius: 4, width: '90%', maxWidth: 400 }}>
            <h3>{selected.name}</h3>
            <p><strong>Location:</strong> {selected.location}</p>
            <p><strong>QR Code:</strong> {selected.qrCodeData}</p>
            <p><strong>Assigned Month:</strong> {new Date(selected.assignedMonth).toLocaleDateString()}</p>
            {attachments.length > 0 && (
              <div className="mt-3">
                <h4>Attachments</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.map((a, i) => (
                      <tr key={i}>
                        <td>{a.description || ''}</td>
                        <td>
                          {a.file ? (
                            <a
                              href={`${api.defaults.baseURL.replace('/api', '')}/uploads/${a.file}`}
                              download
                              target="_blank" rel="noopener noreferrer"
                            >
                              Download
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button onClick={() => { setSelected(null); setAttachments([]); }}>OK</button>          </div>
        </div>
      )}
    </div>
  )
}
