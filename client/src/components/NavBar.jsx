import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Bootstrap navbar for responsive design
import { useAuth } from '../auth';

export default function NavBar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()
  const { setAuth } = useAuth();

  // Always dispatch a scanner stop event when navigating away
  // from pages or logging out. The scanner listens for this
  // event and will ignore it if it isn't running
  const stopScanIfNeeded = () => {
    window.dispatchEvent(new Event('forceStopScanner'))

  }

  const logout = () => {
    stopScanIfNeeded()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth({ token: null, user: null });
    navigate('/login', { replace: true })
  }

  if (!user.role) return null

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to={user.role === 'admin' ? '/admin' : '/tech'} onClick={stopScanIfNeeded}>
          Elevator
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user.role === 'admin' ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin" onClick={stopScanIfNeeded}>Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/users" onClick={stopScanIfNeeded}>Users</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={stopScanIfNeeded}>Create User</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/tech" onClick={stopScanIfNeeded}>Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/scanner" onClick={stopScanIfNeeded}>Scan</Link>
                </li>
              </>
            )}
          </ul>
          <button className="btn btn-outline-light" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  )
}