import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './NavBar.css'
import { useAuth } from '../auth';

export default function NavBar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const navigate = useNavigate()
  const { setAuth } = useAuth();

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth({ token: null, user: null });
    navigate('/login')
  }

  if (!user.role) return null

  return (
    <nav className="nav">
      <div className="nav-brand">Elevator</div>
      <div className="nav-links">
        {user.role === 'admin' ? (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/users">Users</Link>
            <Link to="/register">Create User</Link>
          </>
        ) : (
          <>
            <Link to="/tech">Home</Link>
            <Link to="/scanner">Scan</Link>
          </>
        )}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  )
}