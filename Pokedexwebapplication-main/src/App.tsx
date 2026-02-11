import React, { useState, useEffect, useCallback } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Collection } from './components/Collection';
import { Profile } from './components/Profile';
import { Recommendations } from './components/Recommendations';

// Define public routes that don't require authentication
const publicRoutes = ['login', 'register'];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('login');

  // Parse hash on load and navigation
  useEffect(() => {
    const parseHash = () => {
      // Extract route from hash, e.g., "#/login" -> "login", "#/" -> "login", "" -> "login"
      const hash = window.location.hash.slice(1); // Remove #
      const route = hash.replace(/^\/+/, '') || 'login'; // Remove leading slashes and default to login
      setCurrentRoute(route);
    };

    // Parse hash on initial load
    parseHash();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', parseHash);

    return () => {
      window.removeEventListener('hashchange', parseHash);
    };
  }, []);

  const navigateTo = useCallback((route: string) => {
    window.location.hash = `#/${route}`;
  }, []);

  // Redirect to login if trying to access protected route without auth
  useEffect(() => {
    if (!isAuthenticated && !publicRoutes.includes(currentRoute)) {
      navigateTo('login');
    }
  }, [isAuthenticated, currentRoute, navigateTo]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigateTo('pokedex');
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
    navigateTo('pokedex');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigateTo('login');
  };

  const renderRoute = () => {
    // Handle unauthenticated routes
    if (!isAuthenticated && publicRoutes.includes(currentRoute)) {
      if (currentRoute === 'register') {
        return (
          <Register 
            onRegister={handleRegister}
            onNavigateToLogin={() => navigateTo('login')}
          />
        );
      }
      return <Login onLogin={handleLogin} />;
    }

    // Redirect to login if trying to access protected route without auth (handled by useEffect)
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    // Handle authenticated routes
    switch (currentRoute) {
      case 'cms':
        return <PokemonCMS onBack={() => navigateTo('pokedex')} />;
      case 'recommendations':
        return <Recommendations onBack={() => navigateTo('pokedex')} />;
      case 'collection':
        return <Collection onBack={() => navigateTo('pokedex')} />;
      case 'profile':
        return <Profile onBack={() => navigateTo('pokedex')} />;
      case 'pokedex':
      default:
        return (
          <Pokedex 
            onLogout={handleLogout} 
            onOpenCMS={() => navigateTo('cms')}
            onOpenRecommendations={() => navigateTo('recommendations')}
            onOpenProfile={() => navigateTo('profile')}
            onOpenCollection={() => navigateTo('collection')}
          />
        );
    }
  };

  return (
    <div className="font-sans antialiased text-slate-900">
      {renderRoute()}
    </div>
  );
}
