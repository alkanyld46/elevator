import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Scanner from './components/Scanner'
import Dashboard from './pages/Dashboard'
import TechHome from './pages/TechHome'
import Elevators from './pages/Elevators'
import NavBar from './components/NavBar'

function App() {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <BrowserRouter>
      {token && <NavBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        {token && user.role === 'admin' && (
          <Route path="/register" element={<Register />} />
        )}

        {token ? (
          <>
            <Route path="/tech" element={<TechHome />} />
            <Route path="/scanner" element={<Scanner />} />
            {user.role === 'admin' && (
              <>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/elevators" element={<Elevators />} />
              </>
            )}
            <Route
              path="*"
              element={
                <Navigate to={user.role === 'admin' ? '/admin' : '/tech'} />
              }
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
