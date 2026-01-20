import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, ListGroup, Button, Badge, Spinner } from 'react-bootstrap'
import { FiCamera, FiCheckCircle, FiClock, FiMapPin } from 'react-icons/fi'
import api from '../utils/api'
import { getStoredUser } from '../utils/storage'

export default function TechHome() {
  const navigate = useNavigate()
  const user = getStoredUser() || {}

  const [all, setAll] = useState([])
  const [due, setDue] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const month = new Date().toISOString().slice(0, 7)
        const [allRes, dueRes, recRes] = await Promise.all([
          api.get('/elevators'),
          api.get('/elevators/current'),
          api.get(`/records?month=${month}`)
        ])
        setAll(allRes.data || [])
        setDue(dueRes.data || [])
        setRecords(recRes.data || [])
      } catch (e) {
        setErr('Failed to load elevators')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const unmaintained = useMemo(() => {
    const maintainedIds = new Set(records.map(r => r.elevator?._id || r.elevator))
    return due.filter(el => !maintainedIds.has(el._id))
  }, [due, records])

  const maintained = useMemo(() => {
    const maintainedIds = new Set(records.map(r => r.elevator?._id || r.elevator))
    return due.filter(el => maintainedIds.has(el._id))
  }, [due, records])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-modern" />
      </div>
    )
  }

  return (
    <Container className="py-4 fade-in">
      {/* Welcome Header */}
      <div className="text-center mb-5">
        <div style={{
          width: 80,
          height: 80,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <span style={{ fontSize: '2rem' }}>👋</span>
        </div>
        <h1 className="page-title">Welcome, {user.name || 'Technician'}!</h1>
        <p className="page-subtitle">Here's your maintenance overview for this month</p>
      </div>

      {err && (
        <div className="alert alert-modern alert-danger text-center mb-4">
          {err}
        </div>
      )}

      {/* Stats Row */}
      <Row className="g-4 mb-4">
        <Col xs={6} md={4}>
          <div className="stat-card primary text-center">
            <div className="stat-number">{due.length}</div>
            <div className="stat-label">Scheduled</div>
          </div>
        </Col>
        <Col xs={6} md={4}>
          <div className="stat-card success text-center">
            <div className="stat-number">{maintained.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </Col>
        <Col xs={12} md={4}>
          <div className="stat-card warning text-center">
            <div className="stat-number">{unmaintained.length}</div>
            <div className="stat-label">Remaining</div>
          </div>
        </Col>
      </Row>

      {/* Scan Button */}
      <div className="text-center mb-5">
        <p className="text-muted mb-3">Ready to record maintenance? Scan an elevator's QR code.</p>
        <Button 
          className="btn-gradient-primary px-5 py-3"
          size="lg"
          onClick={() => navigate('/scanner')}
        >
          <FiCamera size={24} className="me-2" />
          Scan QR Code
        </Button>
      </div>

      {/* Unmaintained Elevators */}
      <Card className="card-modern mb-4">
        <Card.Header className="bg-white border-0 pt-4 px-4">
          <div className="d-flex align-items-center">
            <FiClock className="text-warning me-2" size={20} />
            <h5 className="mb-0 fw-bold">Pending Maintenance</h5>
            <Badge bg="warning" text="dark" className="ms-2">{unmaintained.length}</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {unmaintained.length === 0 ? (
            <div className="empty-state py-4">
              <FiCheckCircle className="empty-state-icon text-success" size={48} />
              <div className="empty-state-title">All caught up!</div>
              <p className="text-muted mb-0">No pending elevators for this month</p>
            </div>
          ) : (
            <ListGroup className="list-group-modern">
              {unmaintained.map(el => (
                <ListGroup.Item 
                  key={el._id} 
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{el.name}</strong>
                    <div className="text-muted small">
                      <FiMapPin size={12} className="me-1" />
                      {el.location}
                    </div>
                  </div>
                  <Badge bg="warning" text="dark" className="badge-status">
                    <FiClock className="me-1" />
                    Pending
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Completed This Month */}
      <Card className="card-modern">
        <Card.Header className="bg-white border-0 pt-4 px-4">
          <div className="d-flex align-items-center">
            <FiCheckCircle className="text-success me-2" size={20} />
            <h5 className="mb-0 fw-bold">Completed This Month</h5>
            <Badge bg="success" className="ms-2">{maintained.length}</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {maintained.length === 0 ? (
            <div className="empty-state py-4">
              <FiCamera className="empty-state-icon" size={48} />
              <div className="empty-state-title">No completions yet</div>
              <p className="text-muted mb-0">Start by scanning an elevator QR code</p>
            </div>
          ) : (
            <ListGroup className="list-group-modern">
              {maintained.map(el => (
                <ListGroup.Item 
                  key={el._id} 
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <strong>{el.name}</strong>
                    <div className="text-muted small">
                      <FiMapPin size={12} className="me-1" />
                      {el.location}
                    </div>
                  </div>
                  <Badge bg="success" className="badge-status">
                    <FiCheckCircle className="me-1" />
                    Done
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
