import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './auth';
import RequireAuth from './RequireAuth';
import NavBarLayout from './components/NavBarLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Scanner from './components/Scanner';
import Dashboard from './pages/Dashboard';
import TechHome from './pages/TechHome';
import Elevators from './pages/Elevators';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import RoleRedirect from './RoleRedirect';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* Everything below here requires being logged in */}
          <Route element={<RequireAuth />}>
            <Route element={<NavBarLayout />}>
              {/* Admin-only */}
              <Route element={<RequireAuth roles={['admin']} />}>
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/elevators" element={<Elevators />} />
                <Route path="/users" element={<Users />} />
              </Route>

              {/* Tech-only */}
              <Route element={<RequireAuth roles={['tech']} />}>
                <Route path="/tech" element={<TechHome />} />
                <Route path="/scanner" element={<Scanner />} />
              </Route>
            </Route>
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
