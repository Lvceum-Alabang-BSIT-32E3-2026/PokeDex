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

/**
 * AppContent handles the conditional rendering and routing logic.
 * It is separated from the Providers so it can access hooks like useAuth and useNavigate.
 */
const AppContent = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // State for captured Pokemon (Integrated from Task 2.3.4)
    // This tracks the IDs of Pokémon the user has "caught"
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Public Routing (Unauthenticated) ---
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={() => {}} />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Redirect any unknown route to login if not authenticated */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // --- Private Routing (Authenticated) ---
    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
            <Routes>
                {/* Dashboard / Pokedex */}
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

                {/* Content Management System */}
                <Route 
                    path="/cms" 
                    element={<PokemonCMS onBack={() => navigate('/pokedex')} />} 
                />

                {/* Recommendations Engine */}
                <Route 
                    path="/recommendations" 
                    element={<Recommendations onBack={() => navigate('/pokedex')} />} 
                />

                {/* Personal Collection (Task 2.3.4) */}
                <Route 
                    path="/collection" 
                    element={
                        <CollectionPage 
                            onBack={() => navigate('/pokedex')} 
                            capturedIds={capturedIds} 
                        />
                    } 
                />

                {/* User Profile */}
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

                {/* Catch-all: Redirect to Pokedex if logged in */}
                <Route path="*" element={<Navigate to="/pokedex" replace />} />
            </Routes>
        </div>
    );
};

/**
 * Main Entry Point
 * Wraps the application in necessary Context Providers and the Router.
 */
export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}