import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Navbar, Nav, Container, Button } from 'react-bootstrap'
import { FiHome, FiUsers, FiUserPlus, FiGrid, FiCamera, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../auth'
import { getStoredUser, clearAuth } from '../utils/storage'

export default function NavBar() {
  const user = getStoredUser() || {}
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuth()

  // Always dispatch a scanner stop event when navigating away
  const stopScanIfNeeded = () => {
    window.dispatchEvent(new Event('forceStopScanner'))
  }

  const logout = () => {
    stopScanIfNeeded()
    clearAuth()
    setAuth({ token: null, user: null })
    navigate('/login', { replace: true })
  }

  const isActive = (path) => location.pathname === path

  if (!user.role) return null

  return (
    <Navbar expand="lg" className="navbar-modern" variant="dark" sticky="top">
      <Container>
        <Navbar.Brand 
          as={Link} 
          to={user.role === 'admin' ? '/admin' : '/tech'} 
          onClick={stopScanIfNeeded}
          className="d-flex align-items-center"
        >
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10
          }}>
            <FiGrid size={18} color="white" />
          </div>
          <span style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}>
            ElevatorPro
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {user.role === 'admin' ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/admin"
                  onClick={stopScanIfNeeded}
                  className={isActive('/admin') ? 'active' : ''}
                >
                  <FiHome className="me-2" />
                  Dashboard
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/users"
                  onClick={stopScanIfNeeded}
                  className={isActive('/users') ? 'active' : ''}
                >
                  <FiUsers className="me-2" />
                  Users
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  onClick={stopScanIfNeeded}
                  className={isActive('/register') ? 'active' : ''}
                >
                  <FiUserPlus className="me-2" />
                  Create User
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/tech"
                  onClick={stopScanIfNeeded}
                  className={isActive('/tech') ? 'active' : ''}
                >
                  <FiHome className="me-2" />
                  Home
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/scanner"
                  onClick={stopScanIfNeeded}
                  className={isActive('/scanner') ? 'active' : ''}
                >
                  <FiCamera className="me-2" />
                  Scan QR
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <div className="d-flex align-items-center">
            <span className="text-light me-3 d-none d-md-block" style={{ opacity: 0.7, fontSize: '0.875rem' }}>
              {user.name}
            </span>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={logout}
              className="d-flex align-items-center"
            >
              <FiLogOut className="me-2" />
              Logout
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
