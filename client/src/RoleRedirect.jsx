import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth';

const ROLE_HOME = { admin: '/admin', tech: '/tech' };

export default function RoleRedirect() {
    const { token, user } = useAuth();
    const location = useLocation();

    if (!token) {
        // send them to login and remember where they came from
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
}
