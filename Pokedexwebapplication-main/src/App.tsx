import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';
import RegisterPage from './components/RegisterPage'; // 1. IDINAGDAG NA IMPORT
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [currentPath, setCurrentPath] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash);
        };
        window.addEventListener('hashchange', handleHashChange);

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

    if (!isAuthenticated) {
        if (currentPath === '#/register') {
            // 2. PINALITAN ANG PLACEHOLDER NG TOTOONG COMPONENT
            content = <RegisterPage onBackToLogin={() => window.location.hash = '#/login'} />;
        } else {
            // 3. IDINAGDAG ANG onRegisterClick PROP PARA GUMANA ANG LINK SA LOGIN
            content = <Login onLogin={() => { }} onRegisterClick={() => window.location.hash = '#/register'} />;
        }
    } else {
        // ... (rest of the switch code stays the same)
        const userEmail = user?.email || '';
        switch (currentPath) {
            case '#/cms':
                content = <PokemonCMS onBack={() => window.location.hash = '#/pokedex'} />;
                break;
            case '#/recommendations':
                content = <Recommendations onBack={() => window.location.hash = '#/pokedex'} />;
                break;
            case '#/profile':
                content = <ProfilePage userEmail={userEmail} onBack={() => window.location.hash = '#/pokedex'} onLogout={handleLogout} />;
                break;
            case '#/pokedex':
            default:
                content = <Pokedex onLogout={handleLogout} userEmail={userEmail} onOpenCMS={() => window.location.hash = '#/cms'} onOpenRecommendations={() => window.location.hash = '#/recommendations'} onOpenProfile={() => window.location.hash = '#/profile'} />;
                break;
        }
    }

    return (
        <div className="font-sans antialiased text-slate-900">
            {content}
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}