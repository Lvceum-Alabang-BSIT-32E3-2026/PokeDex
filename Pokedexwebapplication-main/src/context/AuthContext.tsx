import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { decodeToken, isTokenExpired, User } from '../utils/jwt';

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

    // Check token on mount & whenever token changes
    useEffect(() => {
        if (!token) {
            setUser(null);
            return;
        }

        try {
            if (isTokenExpired(token)) {
                logout();
            } else {
                const decodedUser = decodeToken(token);
                setUser(decodedUser);
            }
        } catch (error) {
            console.error('Invalid token:', error);
            logout();
        }
    }, [token]);

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);

        const decodedUser = decodeToken(newToken);
        setUser(decodedUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = Boolean(token && user);
    const isAdmin = Boolean(user?.roles.includes('Admin'));

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
