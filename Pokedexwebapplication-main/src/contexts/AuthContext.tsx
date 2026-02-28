import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken, isTokenExpired, UserFromToken } from '../utils/jwt';

interface AuthContextType {
    user: UserFromToken | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (token: string) => void;
    logout: (reason?: string) => void;
    message: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    const [token, setToken] = useState<string | null>(() => {
        const stored = localStorage.getItem('token');
        if (stored && isTokenExpired(stored)) {
            localStorage.removeItem('token');
            return null;
        }
        return stored;
    });

    const [user, setUser] = useState<UserFromToken | null>(() => {
        const stored = localStorage.getItem('token');
        if (stored && !isTokenExpired(stored)) {
            try {
                return decodeToken(stored);
            } catch {
                return null;
            }
        }
        return null;
    });

    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            try {
                const decoded = decodeToken(token);
                setUser(decoded);
                localStorage.setItem('token', token);
            } catch {
                setUser(null);
                setToken(null);
                localStorage.removeItem('token');
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = (newToken: string) => {
        setToken(newToken);
        setMessage(null);
    };

    const logout = (reason?: string) => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        if (reason) setMessage(reason);
        navigate('/login');
    };

    useEffect(() => {
        const handleLogout = () => logout('Session expired');
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const isAuthenticated = !!token && !!user && !isTokenExpired(token);
    const isAdmin = user?.roles?.includes('Admin') ?? false;

    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated, isAdmin, login, logout, message }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};