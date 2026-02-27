
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';
import { CollectionPage } from './components/CollectionPage'; 
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = () => {
    // Galing sa dev-frontend (New Auth System)
    const { isAuthenticated, user, logout } = useAuth();
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/login');

    // Galing sa task-233 branch mo (State for Collection)
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);

        // Auth Guards
        if (!isAuthenticated && currentPath !== '#/login' && currentPath !== '#/register') {
            window.location.hash = '#/login';
        } else if (isAuthenticated && (currentPath === '#/login' || currentPath === '#/register' || currentPath === '')) {
            window.location.hash = '#/pokedex';
        }

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [isAuthenticated, currentPath]);

    const handleLogout = () => {
        logout(); 
        window.location.hash = '#/login';
    };

    let content;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import RegisterPage from './components/RegisterPage';
import Pokedex from './components/Pokedex';
import PokemonCMS from './components/PokemonCMS';
import Recommendations from './components/Recommendations';
import ProfilePage from './components/ProfilePage';
import UserManagement from './components/UserManagement';

const AppRoutes = () => {
    const { isAuthenticated, user, logout } = useAuth();


    // --- ROUTING LOGIC ---
    if (!isAuthenticated) {

        if (currentPath === '#/register') {
            content = (
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                    <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-slate-200">
                        <h2 className="text-2xl font-bold mb-4">Create Trainer Account</h2>
                        <p className="text-slate-500 mb-6">Registration is currently under maintenance.</p>
                        <button onClick={() => window.location.hash = '#/login'} className="text-red-600 font-bold underline">
                            Back to Login
                        </button>
                    </div>
                </div>
            );
        } else {
            content = <Login onLogin={() => {}} />;
        }
    } else {
        const userEmail = user?.email || '';

        switch (currentPath) {
            case '#/cms':
                content = <PokemonCMS onBack={() => window.location.hash = '#/pokedex'} />;
                break;
            case '#/recommendations':
                content = <Recommendations onBack={() => window.location.hash = '#/pokedex'} />;
                break;
            case '#/collection':
                content = (
                    <CollectionPage
                        onBack={() => window.location.hash = '#/pokedex'}
                        capturedIds={capturedIds}
                    />
                );
                break;
            case '#/profile':
                content = (
                    <ProfilePage
                        userEmail={userEmail}
                        onBack={() => window.location.hash = '#/pokedex'}

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

                        userEmail={userEmail}
                        onOpenCMS={() => window.location.hash = '#/cms'}
                        onOpenRecommendations={() => window.location.hash = '#/recommendations'}
                        onOpenProfile={() => window.location.hash = '#/profile'}
                        onOpenCollection={() => window.location.hash = '#/collection'}
                    />
                );
                break;
        }
    }

    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
            {content}
        </div>

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