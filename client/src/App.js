// App.tsx
import React, { useMemo } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { AuthCtx } from './auth';
import { RequireAuth } from './RequireAuth';
import NavBar from './components/NavBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Scanner from './components/Scanner';
import Dashboard from './pages/Dashboard';
import TechHome from './pages/TechHome';
import Elevators from './pages/Elevators';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  const auth = useMemo(() => {
    const token = localStorage.getItem('token');
    const user = token ? JSON.parse(localStorage.getItem('user') || '{}') : null;
    return { token, user };
  }, []);

  return (
    <AuthCtx.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Layout with navbar for authed users */}
          <Route element={<RequireAuth />}>
            <Route element={<NavBarLayout />}>
              {/* Admin */}
              <Route element={<RequireAuth roles={['admin']} />}>
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/elevators" element={<Elevators />} />
                <Route path="/users" element={<Users />} />
              </Route>

              {/* Tech */}
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
    </AuthCtx.Provider>
  );
}

// Simple layout example
function NavBarLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

export default App;
