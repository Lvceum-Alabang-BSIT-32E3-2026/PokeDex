import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/Login';
import RegisterPage from './components/RegisterPage';
import Pokedex from './components/Pokedex';
import PokemonCMS from './components/PokemonCMS';
import Recommendations from './components/Recommendations';
import ProfilePage from './components/ProfilePage';
import CollectionPage from './components/CollectionPage';

const AppRoutes = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // State for captured Pokemon preserved from task-235
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Public Routes: Accessible only when NOT authenticated
    if (!isAuthenticated) {
        return (
            <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
                <Routes>
                    <Route path="/login" element={<Login onLogin={() => {}} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        );
    }

    // Private Routes: Accessible only when authenticated
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
                            onLogout={handleLogout}
                        />
                    }
                />

                {/* Default redirect to Pokedex if logged in */}
                <Route path="*" element={<Navigate to="/pokedex" replace />} />
            </Routes>
        </div>
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