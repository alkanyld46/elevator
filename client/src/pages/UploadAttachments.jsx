import React, { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Container, Card, Form, Button, Alert, ProgressBar, ListGroup } from 'react-bootstrap'
import { FiUpload, FiImage, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi'
import api from '../utils/api'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_FILES = 10

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function UploadAttachments() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [uploading, setUploading] = useState(false)
  const [needsRepair, setNeedsRepair] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const fileRef = useRef(null)
  const navigate = useNavigate()

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setError('')

    // Validate file count
    if (items.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`)
      e.target.value = ''
      return
    }

    // Validate file sizes
    const validFiles = []
    const invalidFiles = []
    
    files.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(file.name)
      } else {
        validFiles.push({ file, description: '' })
      }
    })

    if (invalidFiles.length > 0) {
      setError(`Files too large (max ${formatFileSize(MAX_FILE_SIZE)}): ${invalidFiles.join(', ')}`)
    }

    if (validFiles.length > 0) {
      setItems(prev => [...prev, ...validFiles])
    }

    e.target.value = ''
  }

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const updateDescription = (idx, value) => {
    setItems(prev => prev.map((item, i) => 
      i === idx ? { ...item, description: value } : item
    ))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData()
    items.forEach(item => {
      formData.append('files', item.file)
      formData.append('descriptions', item.description)
    })
    formData.append('needsRepair', needsRepair)
    
    setUploading(true)
    setProgress(0)

    try {
      await api.post(`/records/${id}/attachments`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percentCompleted)
        }
      })
      alert('Upload successful!')
      navigate('/tech')
    } catch (err) {
      setError(err.response?.data?.msg || 'Upload failed. Please try again.')
      setUploading(false)
    }
  }

  return (
    <Container className="py-4 fade-in">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Card className="card-modern">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div style={{
                  width: 60,
                  height: 60,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                }}>
                  <FiImage size={28} color="white" />
                </div>
                <h2 className="page-title">Upload Photos</h2>
                <p className="page-subtitle">Add maintenance documentation photos</p>
              </div>

              {error && (
                <Alert variant="danger" className="alert-modern" onClose={() => setError('')} dismissible>
                  <FiAlertTriangle className="me-2" />
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* File Upload Area */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                
                <div 
                  className="text-center p-4 mb-4"
                  style={{
                    border: '2px dashed #dee2e6',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const files = Array.from(e.dataTransfer.files)
                    handleFileSelect({ target: { files }, preventDefault: () => {} })
                  }}
                >
                  <FiUpload size={32} className="text-muted mb-2" />
                  <p className="mb-1 fw-semibold">Click to upload or drag and drop</p>
                  <small className="text-muted">
                    Images up to {formatFileSize(MAX_FILE_SIZE)} each (max {MAX_FILES} files)
                  </small>
                </div>

                {/* File List */}
                {items.length > 0 && (
                  <ListGroup className="mb-4">
                    {items.map((item, idx) => (
                      <ListGroup.Item key={idx} className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex align-items-center">
                            <FiImage className="text-primary me-2" />
                            <div>
                              <div className="fw-semibold" style={{ fontSize: '0.875rem' }}>
                                {item.file.name}
                              </div>
                              <small className="text-muted">
                                {formatFileSize(item.file.size)}
                              </small>
                            </div>
                          </div>
                          <Button
                            variant="link"
                            className="text-danger p-0"
                            onClick={() => removeItem(idx)}
                          >
                            <FiX size={18} />
                          </Button>
                        </div>
                        <Form.Control
                          type="text"
                          placeholder="Add description (optional)"
                          value={item.description}
                          onChange={(e) => updateDescription(idx, e.target.value)}
                          size="sm"
                          className="form-control-modern"
                        />
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}

                {/* Needs Repair Toggle */}
                <Card className="mb-4 border">
                  <Card.Body className="p-3">
                    <Form.Label className="fw-semibold mb-2">Does this elevator need repair?</Form.Label>
                    <div className="d-flex gap-3">
                      <Form.Check
                        type="radio"
                        id="repairNo"
                        name="needsRepair"
                        label={
                          <span className="d-flex align-items-center">
                            <FiCheck className="text-success me-1" />
                            No, all good
                          </span>
                        }
                        checked={!needsRepair}
                        onChange={() => setNeedsRepair(false)}
                      />
                      <Form.Check
                        type="radio"
                        id="repairYes"
                        name="needsRepair"
                        label={
                          <span className="d-flex align-items-center">
                            <FiAlertTriangle className="text-warning me-1" />
                            Yes, needs repair
                          </span>
                        }
                        checked={needsRepair}
                        onChange={() => setNeedsRepair(true)}
                      />
                    </div>
                  </Card.Body>
                </Card>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mb-4">
                    <ProgressBar 
                      now={progress} 
                      label={`${progress}%`}
                      animated
                      variant="primary"
                      style={{ height: 10, borderRadius: 5 }}
                    />
                    <small className="text-muted">Uploading...</small>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  <Button
                    type="submit"
                    className="btn-gradient-primary"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : (
                      <>
                        <FiUpload className="me-2" />
                        {items.length > 0 ? `Upload ${items.length} Photo${items.length > 1 ? 's' : ''}` : 'Complete Without Photos'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => navigate('/tech')}
                    disabled={uploading}
                  >
                    Skip for Now
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  )
}
