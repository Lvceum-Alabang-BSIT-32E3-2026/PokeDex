// src/contexts/AuthContext.tsx
import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';
import { useNavigate } from 'react-router-dom';

/* ===============================
   Types
================================ */

export interface User {
    email: string;
    roles: string[];
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (token: string, user: User) => void;
    logout: (reason?: string) => void;
    message: string | null;
}

/* ===============================
   Context
================================ */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

/* ===============================
   Provider
================================ */

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem('token')
    );

    const [message, setMessage] = useState<string | null>(null);

    /* ---------------------------
       Login
    ---------------------------- */
    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        setMessage(null);
    };

    /* ---------------------------
       Logout
    ---------------------------- */
    const logout = (reason?: string) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
        setIsAuthenticated(false);

        if (reason) setMessage(reason);

        navigate('/login');
    };

    /* ---------------------------
       Listen for 401 event
    ---------------------------- */
    useEffect(() => {
        const handleLogout = (event: CustomEvent) => {
            logout(event.detail?.reason || 'Session expired');
        };

        window.addEventListener('logout', handleLogout as EventListener);

        return () =>
            window.removeEventListener('logout', handleLogout as EventListener);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isAdmin: user?.roles?.includes('Admin') ?? false,
                login,
                logout,
                message
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/* ===============================
   Custom Hook
================================ */

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};