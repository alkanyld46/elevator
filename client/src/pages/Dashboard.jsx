import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap'
import { FiActivity, FiCheckCircle, FiClock, FiUsers, FiSettings, FiUserPlus, FiDownload, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import api from '../utils/api'
import { format } from 'date-fns'
import Pagination, { usePagination } from '../components/Pagination'

export default function Dashboard() {
  const [elevators, setElevators] = useState([])
  const [records, setRecords] = useState([])
  const [selectedTech, setSelectedTech] = useState('')
  const [selected, setSelected] = useState(null)
  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attachmentError, setAttachmentError] = useState('')
  const navigate = useNavigate()

  // Pagination for each section
  const maintainedPagination = usePagination(5)
  const pendingPagination = usePagination(5)
  const techRecordsPagination = usePagination(5)

  const fetchData = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const month = new Date().toISOString().slice(0, 7)
      const [elevRes, recRes] = await Promise.all([
        api.get('/elevators/current'),
        api.get(`/records?month=${month}`)
      ])
      setElevators(elevRes.data)
      setRecords(recRes.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err.response?.data?.msg || 'Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!selected) return
    setAttachmentError('')
    api.get(`/records?elevator=${selected._id}`)
      .then(res => {
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
      .catch(err => {
        console.error('Attachment fetch error:', err)
        setAttachmentError('Failed to load attachments')
      })
  }, [selected])

  // Memoized computed values for performance
  const { total, done, pending, maintainedList, pendingList, recordMap, byTech } = useMemo(() => {
    const doneElevatorIds = new Set(records.map(r => r.elevator?._id || r.elevator))
    const total = elevators.length
    const done = doneElevatorIds.size
    const pending = total - done
    const maintainedList = elevators.filter(el => doneElevatorIds.has(el._id))
    const pendingList = elevators.filter(el => !doneElevatorIds.has(el._id))

    // Build record map
    const recordMap = {}
    records.forEach(r => {
      const id = r.elevator?._id || r.elevator
      if (!id) return
      if (!recordMap[id] || new Date(r.timestamp) > new Date(recordMap[id].timestamp)) {
        recordMap[id] = r
      }
    })

    // Build by technician map
    const byTech = {}
    records.forEach(r => {
      const id = r.user?._id || 'unknown'
      const name = r.user?.name || 'Unknown'
      if (!byTech[id]) byTech[id] = { name, list: [] }
      byTech[id].list.push(r)
    })

    return { total, done, pending, maintainedList, pendingList, recordMap, byTech }
  }, [elevators, records])

  // Reset pagination when data changes
  useEffect(() => {
    maintainedPagination.resetPage()
  }, [maintainedList.length])

  useEffect(() => {
    pendingPagination.resetPage()
  }, [pendingList.length])

  useEffect(() => {
    techRecordsPagination.resetPage()
  }, [selectedTech])

  // Paginated lists
  const pagedMaintained = maintainedPagination.paginate(maintainedList)
  const pagedPending = pendingPagination.paginate(pendingList)
  const techRecords = selectedTech && byTech[selectedTech] ? byTech[selectedTech].list : []
  const pagedTechRecords = techRecordsPagination.paginate(techRecords)

  const handleCloseModal = useCallback(() => {
    setSelected(null)
    setAttachments([])
    setAttachmentError('')
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-modern" />
      </div>
    )
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="d-flex align-items-center justify-content-between">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={fetchData}>
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
      <div className="page-header d-flex flex-wrap justify-content-between align-items-center">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Monitor elevator maintenance progress</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Button variant="outline-secondary" onClick={() => navigate('/elevators')}>
            <FiSettings className="me-2" />
            Manage Elevators
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/users')}>
            <FiUsers className="me-2" />
            Users
          </Button>
          <Button className="btn-gradient-primary" onClick={() => navigate('/register')}>
            <FiUserPlus className="me-2" />
            Create User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-number">{total}</div>
                <div className="stat-label">Total Elevators</div>
              </div>
              <FiActivity size={24} className="text-primary opacity-50" />
            </div>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card success">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-number">{done}</div>
                <div className="stat-label">Maintained</div>
              </div>
              <FiCheckCircle size={24} className="text-success opacity-50" />
            </div>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card warning">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-number">{pending}</div>
                <div className="stat-label">Pending</div>
              </div>
              <FiClock size={24} className="text-warning opacity-50" />
            </div>
          </div>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <div className="stat-card primary">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="stat-number">{Object.keys(byTech).length}</div>
                <div className="stat-label">Active Technicians</div>
              </div>
              <FiUsers size={24} className="text-primary opacity-50" />
            </div>
          </div>
        </Col>
      </Row>

      {/* Maintained Elevators */}
      <Card className="card-modern mb-4">
        <Card.Header className="bg-white border-0 pt-4 px-4">
          <div className="d-flex align-items-center">
            <FiCheckCircle className="text-success me-2" size={20} />
            <h5 className="mb-0 fw-bold">Maintained Elevators</h5>
            <Badge bg="" className="badge-status badge-success ms-2">{maintainedList.length}</Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {maintainedList.length === 0 ? (
            <div className="empty-state">
              <FiCheckCircle className="empty-state-icon" />
              <div className="empty-state-title">No elevators maintained yet</div>
              <p className="text-muted">Completed maintenance will appear here</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table className="table-modern mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Assigned</th>
                      <th>Maintained At</th>
                      <th>Technician</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedMaintained.map(el => (
                      <tr key={el._id}>
                        <td className="fw-semibold">{el.name}</td>
                        <td className="text-muted">{el.location}</td>
                        <td>{new Date(el.assignedMonth).toLocaleDateString()}</td>
                        <td>{recordMap[el._id] ? format(new Date(recordMap[el._id].timestamp), 'PPp') : ''}</td>
                        <td>{recordMap[el._id]?.user?.name || 'Unknown'}</td>
                        <td>
                          {recordMap[el._id]?.needsRepair ? (
                            <Badge bg="" className="badge-status badge-danger">
                              <FiAlertTriangle className="me-1" />
                              Needs Repair
                            </Badge>
                          ) : (
                            <Badge bg="" className="badge-status badge-grey">
                              <FiCheckCircle className="me-1" />
                              OK
                            </Badge>
                          )}
                        </td>
                        <td>
                          <Button variant="link" size="sm" onClick={() => setSelected(el)}>
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Pagination
                currentPage={maintainedPagination.page}
                totalItems={maintainedList.length}
                itemsPerPage={maintainedPagination.itemsPerPage}
                onPageChange={maintainedPagination.setPage}
                onItemsPerPageChange={maintainedPagination.setItemsPerPage}
              />
            </>
          )}
        </Card.Body>
      </Card>

      {/* Pending Elevators */}
      <Card className="card-modern mb-4">
        <Card.Header className="bg-white border-0 pt-4 px-4">
          <div className="d-flex align-items-center">
            <FiClock className="text-warning me-2" size={20} />
            <h5 className="mb-0 fw-bold">Pending This Month</h5>
            <Badge bg="" className="badge-status badge-warning ms-2">{pendingList.length}</Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {pendingList.length === 0 ? (
            <div className="empty-state">
              <FiCheckCircle className="empty-state-icon text-success" />
              <div className="empty-state-title">All caught up!</div>
              <p className="text-muted">All scheduled elevators have been maintained</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table className="table-modern mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Assigned Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedPending.map(el => (
                      <tr key={el._id}>
                        <td className="fw-semibold">{el.name}</td>
                        <td className="text-muted">{el.location}</td>
                        <td>{new Date(el.assignedMonth).toLocaleDateString()}</td>
                        <td>
                          <Button variant="link" size="sm" onClick={() => setSelected(el)}>
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              <Pagination
                currentPage={pendingPagination.page}
                totalItems={pendingList.length}
                itemsPerPage={pendingPagination.itemsPerPage}
                onPageChange={pendingPagination.setPage}
                onItemsPerPageChange={pendingPagination.setItemsPerPage}
              />
            </>
          )}
        </Card.Body>
      </Card>

      {/* By Technician */}
      <Card className="card-modern mb-4">
        <Card.Header className="bg-white border-0 pt-4 px-4">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="d-flex align-items-center">
              <FiUsers className="text-primary me-2" size={20} />
              <h5 className="mb-0 fw-bold">By Technician</h5>
            </div>
            <Form.Select
              className="w-auto form-control-modern"
              value={selectedTech}
              onChange={e => setSelectedTech(e.target.value)}
              style={{ minWidth: 200 }}
            >
              <option value="">Select a technician...</option>
              {Object.entries(byTech).map(([id, info]) => (
                <option key={id} value={id}>{info.name} ({info.list.length})</option>
              ))}
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          {Object.keys(byTech).length === 0 ? (
            <div className="empty-state">
              <FiUsers className="empty-state-icon" />
              <div className="empty-state-title">No maintenance records yet</div>
            </div>
          ) : selectedTech === '' ? (
            <p className="text-muted text-center py-4">Please select a technician to view their work</p>
          ) : (
            <>
              <div className="list-group list-group-modern">
                {pagedTechRecords.map(rec => (
                  <div key={rec._id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{rec.elevator?.name}</strong>
                        <span className="text-muted ms-2">@ {rec.elevator?.location}</span>
                      </div>
                      <Badge bg="" className="badge-status badge-grey">
                        {format(new Date(rec.timestamp), 'PP p')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {techRecords.length > 0 && (
                <Pagination
                  currentPage={techRecordsPagination.page}
                  totalItems={techRecords.length}
                  itemsPerPage={techRecordsPagination.itemsPerPage}
                  onPageChange={techRecordsPagination.setPage}
                  onItemsPerPageChange={techRecordsPagination.setItemsPerPage}
                />
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal 
        show={!!selected} 
        onHide={handleCloseModal}
        centered
        className="modal-modern"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selected?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Location:</strong> <span className="text-muted">{selected?.location}</span>
          </div>
          <div className="mb-3">
            <strong>QR Code:</strong> <code className="bg-light px-2 py-1 rounded">{selected?.qrCodeData}</code>
          </div>
          <div className="mb-3">
            <strong>Assigned Month:</strong> <span className="text-muted">{selected?.assignedMonth && new Date(selected.assignedMonth).toLocaleDateString()}</span>
          </div>
          
          {attachmentError && (
            <Alert variant="warning" className="mb-3">{attachmentError}</Alert>
          )}

          {attachments.length > 0 && (
            <>
              <hr />
              <h6 className="fw-bold mb-3">Attachments ({attachments.length})</h6>
              <Table size="sm" className="table-modern">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((a, i) => (
                    <tr key={a.file || i}>
                      <td>{a.description || <span className="text-muted">No description</span>}</td>
                      <td>
                        {a.file ? (
                          <a
                            href={`${api.defaults.baseURL.replace('/api', '')}/uploads/${a.file}`}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <FiDownload className="me-1" />
                            Download
                          </a>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
