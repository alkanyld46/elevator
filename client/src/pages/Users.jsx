import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Card, Table, Button, Modal, Badge, Spinner, Alert } from 'react-bootstrap'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiTrash2, FiInfo, FiShield, FiRefreshCw } from 'react-icons/fi'
import api from '../utils/api'

export default function Users() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

  const fetchList = useCallback(async () => {
    try {
      setError('')
      setLoading(true)
      const res = await api.get('/users')
      setList(res.data)
    } catch (err) {
      console.error('Fetch users error:', err)
      setError(err.response?.data?.msg || 'Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const remove = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    setDeleting(id)
    try {
      await api.delete(`/users/${id}`)
      setSelectedUser(null)
      fetchList()
    } catch (err) {
      console.error('Delete user error:', err)
      setError(err.response?.data?.msg || 'Failed to delete user.')
    } finally {
      setDeleting(null)
    }
  }, [fetchList])

  // Memoized user lists
  const { admins, techs } = useMemo(() => ({
    admins: list.filter(u => u.role === 'admin'),
    techs: list.filter(u => u.role === 'tech')
  }), [list])

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
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="link"
          className="p-0 me-3 text-muted"
          onClick={() => navigate('/admin')}
          aria-label="Back to dashboard"
        >
          <FiArrowLeft size={24} />
        </Button>
        <div>
          <h2 className="page-title mb-0">User Management</h2>
          <p className="page-subtitle mb-0">{list.length} users registered</p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="stat-card primary">
            <div className="stat-number">{list.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card warning">
            <div className="stat-number">{admins.length}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="stat-card success">
            <div className="stat-number">{techs.length}</div>
            <div className="stat-label">Technicians</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="card-modern">
        <div className="table-responsive">
          <Table className="table-modern mb-0">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    No users found
                  </td>
                </tr>
              ) : (
                list.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: 40,
                            height: 40,
                            background: u.role === 'admin' 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}
                        >
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="fw-semibold">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td className="text-muted">{u.phone || '-'}</td>
                    <td>
                      <Badge 
                        className="badge-status"
                        bg={u.role === 'admin' ? 'primary' : 'success'}
                      >
                        <FiShield size={10} className="me-1" />
                        {u.role === 'admin' ? 'Admin' : 'Technician'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-primary"
                        onClick={() => setSelectedUser(u)}
                        aria-label={`View details for ${u.name}`}
                      >
                        <FiInfo size={16} />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-1 text-danger"
                        onClick={() => remove(u._id)}
                        disabled={deleting === u._id}
                        aria-label={`Delete ${u.name}`}
                      >
                        {deleting === u._id ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* User Details Modal */}
      <Modal 
        show={!!selectedUser} 
        onHide={() => setSelectedUser(null)}
        centered
        className="modal-modern"
      >
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div className="text-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: 80,
                  height: 80,
                  background: selectedUser.role === 'admin' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '2rem'
                }}
              >
                {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              <h4 className="mb-1">{selectedUser.name}</h4>
              <Badge 
                bg={selectedUser.role === 'admin' ? 'primary' : 'success'}
                className="mb-4"
              >
                {selectedUser.role === 'admin' ? 'Administrator' : 'Technician'}
              </Badge>

              <div className="text-start bg-light rounded p-3">
                <div className="d-flex align-items-center mb-2">
                  <FiMail className="text-muted me-2" />
                  <span>{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="d-flex align-items-center mb-2">
                    <FiPhone className="text-muted me-2" />
                    <span>{selectedUser.phone}</span>
                  </div>
                )}
                <div className="d-flex align-items-center">
                  <FiUser className="text-muted me-2" />
                  <span>ID: {selectedUser._id}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedUser(null)}>
            Close
          </Button>
          <Button 
            variant="danger" 
            onClick={() => remove(selectedUser._id)}
            disabled={deleting === selectedUser?._id}
          >
            {deleting === selectedUser?._id ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FiTrash2 className="me-2" />
            )}
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
