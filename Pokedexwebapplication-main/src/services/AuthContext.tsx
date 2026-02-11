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


    useEffect(() => {
        if (token) {
            try {
                const decoded: User = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                console.error('Failed to decode token', err);
                setUser(null);
            }
        } else {
            setUser(null);
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

    const isAuthenticated = Boolean(token);
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
