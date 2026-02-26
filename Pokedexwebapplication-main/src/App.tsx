import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import RegisterPage from './components/RegisterPage';
import Pokedex from './components/Pokedex';
import PokemonCMS from './components/PokemonCMS';
import Recommendations from './components/Recommendations';
import ProfilePage from './components/ProfilePage';

const AppRoutes = () => {
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    const handleLogout = () => logout();

    return (
        <Routes>
            <Route
                path="/pokedex"
                element={
                    <Pokedex
                        onLogout={handleLogout}
                        userEmail={user?.email}
                    />
                }
            />
            <Route path="/cms" element={<PokemonCMS />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route
                path="/profile"
                element={
                    <ProfilePage
                        userEmail={user?.email}
                        onLogout={handleLogout}
                    />
                }
            />
            <Route path="*" element={<Navigate to="/pokedex" replace />} />
        </Routes>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}