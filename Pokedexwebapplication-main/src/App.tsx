import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    // Initial check for authentication and redirection
    if (!isAuthenticated && currentPath !== '#/login' && currentPath !== '#/register') {
      window.location.hash = '#/login';
    } else if (isAuthenticated && (currentPath === '#/login' || currentPath === '#/register' || currentPath === '')) {
      window.location.hash = '#/pokedex';
    }


    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isAuthenticated, currentPath]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    window.location.hash = '#/pokedex'; // Navigate to pokedex after login
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    window.location.hash = '#/login'; // Navigate to login after logout
  };

  let content;

  if (!isAuthenticated) {
    if (currentPath === '#/register') {
      content = <div>Register Component (Not Implemented Yet)</div>; // Placeholder for register
    } else {
      content = <Login onLogin={handleLogin} />;
    }
  } else {
    switch (currentPath) {
      case '#/cms':
        content = <PokemonCMS onBack={() => window.location.hash = '#/pokedex'} />;
        break;
      case '#/recommendations':
        content = <Recommendations onBack={() => window.location.hash = '#/pokedex'} />;
        break;
      case '#/collection':
        content = <div>Collection Component (Not Implemented Yet)</div>; // Placeholder for collection
        break;
      case '#/profile':
        content = <div>Profile Component (Not Implemented Yet)</div>; // Placeholder for profile
        break;
      case '#/pokedex':
      default: // Default to pokedex if hash is not recognized or empty
        content = (
          <Pokedex 
            onLogout={handleLogout} 
            onOpenCMS={() => window.location.hash = '#/cms'}
            onOpenRecommendations={() => window.location.hash = '#/recommendations'}
          />
        );
        break;
    }
  }

  return (
    <div className="font-sans antialiased text-slate-900">
      {content}
    </div>
  );
}
