import React, { useState } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}
