import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './auth';

export default function RequireAuth({ roles }) {
    const { token, user } = useAuth();

    if (!token) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;

    return <Outlet />;
}
