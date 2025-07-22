import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './NavBar.css'
import { useAuth } from '../auth';

export default function NavBar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()
  const { setAuth } = useAuth();

  const stopScanIfNeeded = () => {
    if (sessionStorage.getItem('scanning') === 'true') {
      window.dispatchEvent(new Event('forceStopScanner'))

    }
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
    <nav className="nav">
      <div className="nav-brand">Elevator</div>
      <div className="nav-links">
        {user.role === 'admin' ? (
          <>
            <Link to="/admin" onClick={stopScanIfNeeded}>Dashboard</Link>
            <Link to="/users" onClick={stopScanIfNeeded}>Users</Link>
            <Link to="/register" onClick={stopScanIfNeeded}>Create User</Link>
          </>
        ) : (
          <>
            <Link to="/tech" onClick={stopScanIfNeeded}>Home</Link>
            <Link to="/scanner" onClick={stopScanIfNeeded}>Scan</Link>
          </>
        )}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  )
}