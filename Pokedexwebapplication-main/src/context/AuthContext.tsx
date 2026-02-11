import React, { createContext, ReactNode, useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode';

export interface User {
    id: string;
    username: string;
    email: string;
    roles?: string[];
    displayName?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<User | null>(null);

    // Check token on mount & clear if expired
    useEffect(() => {
        if (token) {
            try {
                const decoded: any = jwtDecode(token);

                // Check expiration
                const now = Date.now().valueOf() / 1000;
                if (decoded.exp && decoded.exp < now) {
                    // Token expired
                    logout();
                } else {
                    setUser(decoded);
                }
            } catch (err) {
                console.error('Invalid token', err);
                logout();
            }
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = Boolean(token && user);
    const isAdmin = Boolean(user?.roles?.includes('Admin'));

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isAdmin,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
