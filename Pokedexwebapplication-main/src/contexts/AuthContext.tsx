import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { decodeToken, isTokenExpired } from '../utils/jwt';

interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    roles: string[]; 
}

interface AuthContextType {
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
            if (isTokenExpired(token)) {
                logout();
            } else {
                const userData = decodeToken(token);
                if (userData) {
                    setUser(userData as any);
                } else {
                    logout();
                }
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

    const isAuthenticated = !!token;

    const isAdmin = user?.roles?.includes('Admin') || false;

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};