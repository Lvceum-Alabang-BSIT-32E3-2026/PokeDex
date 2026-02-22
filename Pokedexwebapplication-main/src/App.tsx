import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Para hindi bumabalik sa Login page kapag nag-refresh (Persistence)
        return localStorage.getItem('isAuth') === 'true';
    });
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/login');

    useEffect(() => {
        // 1. Function para i-sync ang state sa hash
        const handleHashChange = () => {
            setCurrentPath(window.location.hash);
        };

        // 2. Makinig sa browser forward/back buttons at URL changes
        window.addEventListener('hashchange', handleHashChange);

        // 3. Guards: Proteksyon para sa Private Routes
        if (!isAuthenticated && !['#/login', '#/register'].includes(currentPath)) {
            window.location.hash = '#/login';
        }
        else if (isAuthenticated && (currentPath === '#/login' || currentPath === '#/register' || currentPath === '')) {
            window.location.hash = '#/pokedex';
        }

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [isAuthenticated, currentPath]);

    const handleLogin = (email: string) => {
        setIsAuthenticated(true);
        setUserEmail(email);
        localStorage.setItem('isAuth', 'true');
        localStorage.setItem('userEmail', email);
        window.location.hash = '#/pokedex';
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserEmail('');
        localStorage.clear(); // Linisin ang auth data
        window.location.hash = '#/login';
    };

    // Routing Logic
    const renderContent = () => {
        // Public Routes
        if (!isAuthenticated) {
            if (currentPath === '#/register') {
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-slate-200">
                            <h2 className="text-2xl font-bold mb-4">Create Trainer Account</h2>
                            <p className="text-slate-500 mb-6">Registration is currently under maintenance.</p>
                            <button onClick={() => window.location.hash = '#/login'} className="text-red-600 font-bold underline">
                                Back to Login
                            </button>
                        </div>
                    </div>
                );
            }
            return <Login onLogin={handleLogin} />;
        }

        // Private Routes
        switch (currentPath) {
            case '#/cms':
                return <PokemonCMS onBack={() => window.location.hash = '#/pokedex'} />;

            case '#/recommendations':
                return <Recommendations onBack={() => window.location.hash = '#/pokedex'} />;

            case '#/collection':
                return (
                    <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-white">
                        <h2 className="text-3xl font-bold text-slate-800">My Collection</h2>
                        <p className="text-slate-500 mt-2">Your captured Pokemon will appear here soon!</p>
                        <button
                            onClick={() => window.location.hash = '#/pokedex'}
                            className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-md"
                        >
                            Back to Pokedex
                        </button>
                    </div>
                );

            case '#/profile':
                return (
                    <ProfilePage
                        userEmail={userEmail}
                        onBack={() => window.location.hash = '#/pokedex'}
                        onLogout={handleLogout}
                    />
                );

            case '#/pokedex':
            default:
                return (
                    <Pokedex
                        onLogout={handleLogout}
                        userEmail={userEmail}
                        onOpenCMS={() => window.location.hash = '#/cms'}
                        onOpenRecommendations={() => window.location.hash = '#/recommendations'}
                        onOpenProfile={() => window.location.hash = '#/profile'}
                        onOpenCollection={() => window.location.hash = '#/collection'} // <--- Dinagdag ito para sa Task 3.2.6
                    />
                );
        }
    };

    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
            {renderContent()}
        </div>
    );
}