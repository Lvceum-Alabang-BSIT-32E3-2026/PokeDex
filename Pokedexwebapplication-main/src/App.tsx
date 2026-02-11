import React, { useState, useContext } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, logout } = useContext(AuthContext)!;
  const [view, setView] = useState<'pokedex' | 'cms' | 'recommendations'>('pokedex');

  if (!isAuthenticated) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <>
      {view === 'cms' ? (
        <PokemonCMS onBack={() => setView('pokedex')} />
      ) : view === 'recommendations' ? (
        <Recommendations onBack={() => setView('pokedex')} />
      ) : (
        <Pokedex
          onLogout={() => { logout(); setView('pokedex'); }}
          onOpenCMS={() => setView('cms')}
          onOpenRecommendations={() => setView('recommendations')}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="font-sans antialiased text-slate-900">
        <AppContent />
      </div>
    </AuthProvider>
  );
}
