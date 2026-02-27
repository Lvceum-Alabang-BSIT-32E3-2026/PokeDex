import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components from dev-frontend and task-325
import Login from './components/Login';
import RegisterPage from './components/RegisterPage';
import Pokedex from './components/Pokedex';
import PokemonCMS from './components/PokemonCMS';
import Recommendations from './components/Recommendations';
import ProfilePage from './components/ProfilePage';
import { CollectionPage } from './components/CollectionPage';

/**
 * AppRoutes handles the conditional rendering based on authentication
 * and maps URL paths to specific components.
 */
const AppRoutes = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // Preserve Task 3.2.5 State for tracking caught Pokemon
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // 1. Unauthenticated Route Guard
    if (!isAuthenticated) {
        return (
            <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
                <Routes>
                    <Route path="/login" element={<Login onLogin={() => {}} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* Catch-all for logged-out users: Redirect to Login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        );
    }

    // 2. Authenticated Routes (Main App)
    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
            <Routes>
                {/* Home / Pokedex */}
                <Route 
                    path="/pokedex" 
                    element={
                        <Pokedex 
                            onLogout={handleLogout} 
                            userEmail={user?.email || ''} 
                        />
                    } 
                />

                {/* Content Management System */}
                <Route 
                    path="/cms" 
                    element={<PokemonCMS onBack={() => navigate('/pokedex')} />} 
                />

                {/* AI Recommendations */}
                <Route 
                    path="/recommendations" 
                    element={<Recommendations onBack={() => navigate('/pokedex')} />} 
                />

                {/* Task 3.2.5 Collection Integration */}
                <Route 
                    path="/collection" 
                    element={
                        <CollectionPage 
                            onBack={() => navigate('/pokedex')} 
                            capturedIds={capturedIds} 
                        />
                    } 
                />

                {/* Profile and Settings */}
                <Route 
                    path="/profile" 
                    element={
                        <ProfilePage 
                            userEmail={user?.email || ''} 
                            onLogout={handleLogout}
                            onBack={() => navigate('/pokedex')}
                            // Navigation callbacks for the Profile menu
                            onOpenCMS={() => navigate('/cms')}
                            onOpenRecommendations={() => navigate('/recommendations')}
                            onOpenCollection={() => navigate('/collection')}
                        />
                    } 
                />

                {/* Catch-all for logged-in users: Redirect to Pokedex */}
                <Route path="*" element={<Navigate to="/pokedex" replace />} />
            </Routes>
        </div>
    );
};

/**
 * Main Entry Point
 * Provides Auth and Routing context to the rest of the application.
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