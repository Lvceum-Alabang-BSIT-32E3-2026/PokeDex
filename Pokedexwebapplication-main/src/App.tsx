import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Component Imports
import Login from './components/Login';
import RegisterPage from './components/RegisterPage';
import Pokedex from './components/Pokedex';
import PokemonCMS from './components/PokemonCMS';
import Recommendations from './components/Recommendations';
import ProfilePage from './components/ProfilePage';

/**
 * Maintenance View for features not yet fully implemented
 */
const MaintenanceView = ({ title, message }: { title: string; message: string }) => (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <button 
                onClick={() => window.location.hash = '#/pokedex'} 
                className="text-red-600 font-bold underline"
            >
                Back to Dashboard
            </button>
        </div>
    </div>
);

/**
 * AppRoutes handles the conditional rendering based on Auth state.
 * Using HashRouter ensures URLs look like domain.com/#/route
 */
const AppRoutes = () => {
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        // HashRouter handles navigation, but manual redirect ensures clean state
    };

    const userEmail = user?.email || '';

    // 1. PUBLIC ROUTES (Not Logged In)
    if (!isAuthenticated) {
        return (
            <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* Catch-all for guests: Redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        );
    }

    // 2. PROTECTED ROUTES (Authenticated)
    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
            <Routes>
                {/* Main Dashboard */}
                <Route
                    path="/pokedex"
                    element={
                        <Pokedex
                            onLogout={handleLogout}
                            userEmail={userEmail}
                        />
                    }
                />

                {/* Content Management System */}
                <Route path="/cms" element={<PokemonCMS />} />

                {/* AI Recommendations */}
                <Route path="/recommendations" element={<Recommendations />} />

                {/* Profile Settings */}
                <Route
                    path="/profile"
                    element={
                        <ProfilePage
                            userEmail={userEmail}
                            onLogout={handleLogout}
                        />
                    }
                />

                {/* Placeholder for "My Collection" */}
                <Route 
                    path="/collection" 
                    element={
                        <MaintenanceView 
                            title="My Collection" 
                            message="This feature is coming soon to all trainers!" 
                        />
                    } 
                />

                {/* Catch-all for authenticated users: Redirect to pokedex */}
                <Route path="*" element={<Navigate to="/pokedex" replace />} />
            </Routes>
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            {/* HashRouter is used to handle #/routing logic automatically 
                without needing manual window.location.hash listeners.
            */}
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}