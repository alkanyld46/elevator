import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Button } from 'react-bootstrap'
import { FiHome, FiLock } from 'react-icons/fi'

export default function Unauthorized() {
  return (
    <Container className="py-5 text-center fade-in">
      <div 
        style={{
          width: 120,
          height: 120,
          background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
          borderRadius: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          boxShadow: '0 20px 60px rgba(235, 51, 73, 0.3)'
        }}
      >
        <FiLock size={48} color="white" />
      </div>
      
      <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Access Denied</h1>
      <p className="page-subtitle mb-4" style={{ maxWidth: 400, margin: '0 auto' }}>
        You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
      </p>
      
      <Button as={Link} to="/" className="btn-gradient-primary">
        <FiHome className="me-2" />
        Go to Home
      </Button>
    </Container>
  )
}
