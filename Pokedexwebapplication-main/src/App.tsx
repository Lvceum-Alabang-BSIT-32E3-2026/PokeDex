import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = () => {
    // 1. Get auth state and actions from Context
    const { isAuthenticated, user, logout } = useAuth();
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/login');

    useEffect(() => {
        // 2. Sync state with URL hash
        const handleHashChange = () => {
            setCurrentPath(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);

        // 3. Route Guards
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

    // 4. Routing Logic
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
            content = <Login onLogin={() => { }} />;
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
                    <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-slate-50">
                        <h2 className="text-3xl font-bold text-slate-800">My Collection</h2>
                        <p className="text-slate-500 mt-2">Coming soon!</p>
                        <button 
                            onClick={() => window.location.hash = '#/pokedex'} 
                            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-md"
                        >
                            Back to Pokedex
                        </button>
                    </div>
                );
                break;
            case '#/profile':
                content = (
                    <ProfilePage
                        userEmail={userEmail}
                        onBack={() => window.location.hash = '#/pokedex'}
                        onLogout={handleLogout}
                    />
                );
                break;
            case '#/pokedex':
            default:
                content = (
                    <Pokedex
                        onLogout={handleLogout}
                        userEmail={userEmail}
                        onOpenCMS={() => window.location.hash = '#/cms'}
                        onOpenRecommendations={() => window.location.hash = '#/recommendations'}
                        onOpenProfile={() => window.location.hash = '#/profile'}
                    />
                );
                break;
        }
    }

    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
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