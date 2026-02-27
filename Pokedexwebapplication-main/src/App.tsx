import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import { Login } from './components/Login';
import RegisterPage from './components/RegisterPage';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';
import { CollectionPage } from './components/CollectionPage';

/**
 * AppRoutes handles the conditional rendering based on authentication
 * using React Router v6 instead of manual hash listeners.
 */
const AppRoutes = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // State preserved from task-241 for tracking captured Pokémon
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Public Routes ---
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={() => {}} />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Redirect any unknown route to login when not authenticated */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // --- Private Routes ---
    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
            <Routes>
                <Route 
                    path="/pokedex" 
                    element={
                        <Pokedex 
                            onLogout={handleLogout} 
                            userEmail={user?.email || ''}
                            onOpenCMS={() => navigate('/cms')}
                            onOpenRecommendations={() => navigate('/recommendations')}
                            onOpenProfile={() => navigate('/profile')}
                            onOpenCollection={() => navigate('/collection')}
                        />
                    } 
                />
                
                <Route 
                    path="/cms" 
                    element={<PokemonCMS onBack={() => navigate('/pokedex')} />} 
                />
                
                <Route 
                    path="/recommendations" 
                    element={<Recommendations onBack={() => navigate('/pokedex')} />} 
                />
                
                <Route 
                    path="/collection" 
                    element={
                        <CollectionPage 
                            onBack={() => navigate('/pokedex')} 
                            capturedIds={capturedIds} 
                        />
                    } 
                />
                
                <Route 
                    path="/profile" 
                    element={
                        <ProfilePage 
                            userEmail={user?.email || ''} 
                            onBack={() => navigate('/pokedex')} 
                        />
                    } 
                />

                {/* Redirect authenticated users from root or unknown paths to Pokedex */}
                <Route path="/" element={<Navigate to="/pokedex" replace />} />
                <Route path="*" element={<Navigate to="/pokedex" replace />} />
            </Routes>
        </div>
    );
};

/**
 * Main Entry Point
 */
export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}