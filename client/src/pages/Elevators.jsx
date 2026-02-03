import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Card, Form, Button, Table, Badge, InputGroup, Modal, Alert } from 'react-bootstrap'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiCalendar, FiX, FiRefreshCw } from 'react-icons/fi'
import { HiQrCode } from 'react-icons/hi2'
import api from '../utils/api'
import ElevatorQRModal from '../components/ElevatorQRModal'

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
  const [showForm, setShowForm] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrElevator, setQrElevator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()
  const perPage = 8

  const fetchList = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const res = await api.get('/elevators')
      setList(res.data)
    } catch (err) {
      console.error('Fetch elevators error:', err)
      setError(err.response?.data?.msg || 'Failed to load elevators. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  useEffect(() => {
    setPage(1)
  }, [search, list])

  const cancelEdit = useCallback(() => {
    setEditId(null)
    setName('')
    setLocation('')
    setQrCodeData('')
    setSchedules([{ date: '' }])
    setSelectedId('')
    setShowForm(false)
    setFormError('')
  }, [])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    const payload = {
      name,
      location,
      maintenanceSchedules: schedules.filter(s => s.date),
    }

    // Only include qrCodeData if provided (for editing or custom codes)
    if (qrCodeData) {
      payload.qrCodeData = qrCodeData
    }

    try {
      if (editId) {
        await api.put(`/elevators/${editId}`, payload)
      } else {
        await api.post('/elevators', payload)
      }
      cancelEdit()
      fetchList()
    } catch (err) {
      console.error('Submit elevator error:', err)
      setFormError(err.response?.data?.msg || 'Failed to save elevator. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [name, location, qrCodeData, schedules, editId, cancelEdit, fetchList])

  const startEdit = useCallback((el) => {
    setEditId(el._id)
    setName(el.name)
    setLocation(el.location)
    setQrCodeData(el.qrCodeData)
    setSchedules(
      (el.maintenanceSchedules || []).map(s => ({ date: s.date.slice(0, 7) }))
    )
    setFormError('')
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this elevator?')) return
    try {
      await api.delete(`/elevators/${id}`)
      cancelEdit()
      fetchList()
    } catch (err) {
      console.error('Delete elevator error:', err)
      setError(err.response?.data?.msg || 'Failed to delete elevator.')
    }
  }, [cancelEdit, fetchList])

  const handleAddSchedule = useCallback(() => {
    setSchedules(prev => [...prev, { date: '' }])
  }, [])

  const handleRemoveSchedule = useCallback((idx) => {
    setSchedules(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const handleScheduleChange = useCallback((idx, value) => {
    setSchedules(prev => {
      const arr = [...prev]
      arr[idx].date = value
      return arr
    })
  }, [])

  const handleShowQR = useCallback((elevator) => {
    setQrElevator(elevator)
    setShowQRModal(true)
  }, [])

  const handleQRModalClose = useCallback(() => {
    setShowQRModal(false)
    setQrElevator(null)
  }, [])

  // Memoized filtered and paginated data
  const { filtered, totalPages, paged } = useMemo(() => {
    const filtered = list.filter(el =>
      el.name.toLowerCase().includes(search.toLowerCase()) ||
      el.location.toLowerCase().includes(search.toLowerCase())
    )
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
    const start = (page - 1) * perPage
    const paged = filtered.slice(start, start + perPage)
    return { filtered, totalPages, paged }
  }, [list, search, page])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-modern" />
      </div>
    )
  }

  if (error && list.length === 0) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="d-flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchList}>
            <FiRefreshCw className="me-2" />
            Retry
          </Button>
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="py-4 fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button
            variant="link"
            className="p-0 me-3 text-muted"
            onClick={() => navigate('/admin')}
            aria-label="Back to dashboard"
          >
            <FiArrowLeft size={24} />
          </Button>
          <div>
            <h2 className="page-title mb-0">Manage Elevators</h2>
            <p className="page-subtitle mb-0">{list.length} elevators registered</p>
          </div>
        </div>
        <Button
          className="btn-gradient-primary mt-3 mt-md-0"
          onClick={() => { cancelEdit(); setShowForm(true) }}
        >
          <FiPlus className="me-2" />
          Add Elevator
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Search */}
      <Card className="card-modern mb-4">
        <Card.Body className="p-3">
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <FiSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              className="border-start-0 ps-0"
              placeholder="Search by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Elevator List */}
      <Card className="card-modern mb-4">
        <div className="table-responsive">
          <Table className="table-modern mb-0">
            <thead>
              <tr>
                <th style={{ width: 50 }}></th>
                <th>Name</th>
                <th>Location</th>
                <th>QR Code</th>
                <th>Schedules</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    {search ? 'No elevators found matching your search' : 'No elevators registered yet'}
                  </td>
                </tr>
              ) : (
                paged.map(el => (
                  <tr key={el._id} className={selectedId === el._id ? 'table-primary' : ''}>
                    <td>
                      <Form.Check
                        type="radio"
                        name="selectedElevator"
                        checked={selectedId === el._id}
                        onChange={() => setSelectedId(el._id)}
                        aria-label={`Select ${el.name}`}
                      />
                    </td>
                    <td className="fw-semibold">{el.name}</td>
                    <td className="text-muted">{el.location}</td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded" style={{ fontSize: '0.75rem' }}>
                        {el.qrCodeData.length > 20 ? el.qrCodeData.slice(0, 20) + '...' : el.qrCodeData}
                      </code>
                    </td>
                    <td>
                      {(el.maintenanceSchedules || []).slice(0, 3).map((s, i) => (
                        <Badge key={i} bg="light" text="dark" className="me-1 mb-1">
                          <FiCalendar size={10} className="me-1" />
                          {new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Badge>
                      ))}
                      {(el.maintenanceSchedules || []).length > 3 && (
                        <Badge bg="secondary">+{el.maintenanceSchedules.length - 3}</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-success"
                        onClick={() => handleShowQR(el)}
                        aria-label={`View QR code for ${el.name}`}
                        title="View QR Code"
                      >
                        <HiQrCode size={18} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-primary"
                        onClick={() => startEdit(el)}
                        aria-label={`Edit ${el.name}`}
                      >
                        <FiEdit2 size={16} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-danger"
                        onClick={() => handleDelete(el._id)}
                        aria-label={`Delete ${el.name}`}
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer className="bg-white d-flex justify-content-between align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <FiChevronLeft className="me-1" />
              Previous
            </Button>
            <span className="text-muted">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
              <FiChevronRight className="ms-1" />
            </Button>
          </Card.Footer>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showForm} onHide={cancelEdit} centered className="modal-modern">
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Elevator' : 'Add New Elevator'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={submit}>
          <Modal.Body>
            {formError && (
              <Alert variant="danger" dismissible onClose={() => setFormError('')} className="mb-3">
                {formError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Elevator Name</Form.Label>
              <Form.Control
                className="form-control-modern"
                placeholder="e.g., Building A - Elevator 1"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Location</Form.Label>
              <Form.Control
                className="form-control-modern"
                placeholder="e.g., 123 Main Street, Floor 1"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">QR Code Data</Form.Label>
              <Form.Control
                className="form-control-modern"
                placeholder="Auto-generated if left empty"
                value={qrCodeData}
                onChange={e => setQrCodeData(e.target.value)}
              />
              <Form.Text className="text-muted">
                Leave empty to auto-generate. The QR code can be downloaded after saving.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Maintenance Schedule</Form.Label>
              {schedules.map((s, idx) => (
                <InputGroup key={idx} className="mb-2">
                  <Form.Control
                    type="month"
                    className="form-control-modern"
                    value={s.date}
                    onChange={e => handleScheduleChange(idx, e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-danger"
                    onClick={() => handleRemoveSchedule(idx)}
                    disabled={schedules.length === 1}
                    aria-label="Remove schedule"
                  >
                    <FiX />
                  </Button>
                </InputGroup>
              ))}
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleAddSchedule}
              >
                <FiPlus className="me-1" />
                Add Schedule
              </Button>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelEdit} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gradient-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (editId ? 'Update Elevator' : 'Add Elevator')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <ElevatorQRModal
        show={showQRModal}
        onHide={handleQRModalClose}
        elevator={qrElevator}
      />
    </Container>
  )
}
