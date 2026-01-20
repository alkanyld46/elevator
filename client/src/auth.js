import React, { createContext, useContext, useMemo, useState } from 'react';
import { getStoredToken, getStoredUser } from './utils/storage';

export const AuthContext = createContext({ token: null, user: null });
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const initialToken = getStoredToken();
    const initialUser = initialToken ? getStoredUser() : null;

    const [auth, setAuth] = useState({ token: initialToken, user: initialUser });

    const value = useMemo(() => ({ ...auth, setAuth }), [auth]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
