import React, { createContext, useContext, useMemo, useState } from 'react';

export const AuthContext = createContext({ token: null, user: null });
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const initialToken = localStorage.getItem('token');
    const initialUser = initialToken ? JSON.parse(localStorage.getItem('user') || '{}') : null;

    const [auth, setAuth] = useState({ token: initialToken, user: initialUser });

    const value = useMemo(() => ({ ...auth, setAuth }), [auth]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
