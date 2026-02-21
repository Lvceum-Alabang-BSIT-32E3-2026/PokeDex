import React, { useState } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import RegisterPage from './components/RegisterPage'; 

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); 
    const [view, setView] = useState<'pokedex' | 'cms' | 'recommendations'>('pokedex');

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setView('pokedex');
    };

    return (
        <div className="font-sans antialiased text-slate-900">
            {isAuthenticated ? (
                view === 'cms' ? (
                    <PokemonCMS onBack={() => setView('pokedex')} />
                ) : view === 'recommendations' ? (
                    <Recommendations onBack={() => setView('pokedex')} />
                ) : (
                    <Pokedex
                        onLogout={handleLogout}
                        onOpenCMS={() => setView('cms')}
                        onOpenRecommendations={() => setView('recommendations')}
                    />
                )
            ) : (
                /* Logic para magpalit sa pagitan ng Login at Register */
                isRegistering ? (
                    <RegisterPage onBackToLogin={() => setIsRegistering(false)} />
                ) : (
                    <Login
                        onLogin={handleLogin}
                        onRegisterClick={() => setIsRegistering(true)}
                    />
                )
            )}
        </div>
    );
}