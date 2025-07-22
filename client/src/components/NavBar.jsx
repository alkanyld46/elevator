import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './NavBar.css'
import { useAuth } from '../auth';

export default function NavBar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()
  const { setAuth } = useAuth();

  const checkScanning = e => {
    if (sessionStorage.getItem('scanning') === 'true') {
      e.preventDefault();
      alert('Please stop scanning before leaving this page.');
      return true;
    }
    return false;
  }

  const logout = () => {
    if (checkScanning({ preventDefault: () => { } })) return;
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
            <Link to="/admin" onClick={checkScanning}>Dashboard</Link>
            <Link to="/users" onClick={checkScanning}>Users</Link>
            <Link to="/register" onClick={checkScanning}>Create User</Link>
          </>
        ) : (
          <>
            <Link to="/tech" onClick={checkScanning}>Home</Link>
            <Link to="/scanner" onClick={checkScanning}>Scan</Link>
          </>
        )}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  )
}