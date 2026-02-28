import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import RegisterPage from './components/RegisterPage';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';
import { CollectionPage } from './components/CollectionPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { UserManagementPage } from './components/UserManagementPage';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/pokedex" replace />;
    }
    return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <RegisterPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/pokedex"
                element={
                    <ProtectedRoute>
                        <Pokedex />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/collection"
                element={
                    <ProtectedRoute>
                        <CollectionPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/recommendations"
                element={
                    <ProtectedRoute>
                        <Recommendations />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cms"
                element={
                    <AdminRoute>
                        <PokemonCMS />
                    </AdminRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <AdminRoute>
                        <UserManagementPage />
                    </AdminRoute>
                }
            />
            <Route path="*" element={<Navigate to="/pokedex" replace />} />
        </Routes>
    );
};

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}