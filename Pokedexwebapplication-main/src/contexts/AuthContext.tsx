// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: (reason?: string) => void;
    message: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const logout = (reason?: string) => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        if (reason) setMessage(reason);
        navigate('/login');
    };

    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setMessage(null);
    };

    // Listen for global logout events (from apiFetch)
    useEffect(() => {
        const handleLogout = (event: CustomEvent) => {
            logout(event.detail?.reason || 'Logged out');
        };

        window.addEventListener('logout', handleLogout as EventListener);
        return () => window.removeEventListener('logout', handleLogout as EventListener);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, message }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};