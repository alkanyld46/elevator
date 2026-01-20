import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Button } from 'react-bootstrap'
import { FiHome, FiAlertCircle } from 'react-icons/fi'

export default function NotFound() {
  return (
    <Container className="py-5 text-center fade-in">
      <div 
        style={{
          width: 120,
          height: 120,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
        }}
      >
        <span style={{ fontSize: '3rem', color: 'white' }}>404</span>
      </div>
      
      <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Page Not Found</h1>
      <p className="page-subtitle mb-4" style={{ maxWidth: 400, margin: '0 auto' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Button as={Link} to="/" className="btn-gradient-primary">
        <FiHome className="me-2" />
        Go to Home
      </Button>
    </Container>
  )
}
