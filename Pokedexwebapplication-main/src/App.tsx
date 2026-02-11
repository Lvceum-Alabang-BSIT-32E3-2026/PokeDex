import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Collection } from './components/Collection';
import { Profile } from './components/Profile';
import { Recommendations } from './components/Recommendations';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('login');

  // Parse hash on load and navigation
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.slice(1) || '/login'; // Remove # and default to /login
      const route = hash.split('/')[1] || 'login'; // Extract route name
      setCurrentRoute(route);
      
      // Update authentication state based on route
      const protectedRoutes = ['pokedex', 'cms', 'collection', 'profile'];
      if (!protectedRoutes.includes(route)) {
        // Routes like login and register don't require authentication
        if (route === 'login' || route === 'register') {
          setIsAuthenticated(false);
        }
      }
    };

    // Parse hash on initial load
    parseHash();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', parseHash);

    return () => {
      window.removeEventListener('hashchange', parseHash);
    };
  }, []);

  const navigateTo = (route: string) => {
    window.location.hash = `#/${route}`;
  };

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
    if (!isAuthenticated && (currentRoute === 'login' || currentRoute === 'register')) {
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

    // Redirect to login if trying to access protected route without auth
    if (!isAuthenticated) {
      navigateTo('login');
      return <Login onLogin={handleLogin} />;
    }

    // Handle authenticated routes
    switch (currentRoute) {
      case 'cms':
        return <PokemonCMS onBack={() => navigateTo('pokedex')} />;
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
            onOpenRecommendations={() => navigateTo('collection')}
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
