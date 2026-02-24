import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';
import { CollectionPage } from './components/CollectionPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [currentPath, setCurrentPath] = useState(window.location.hash || '#/login');

    // State for captured Pokemon (Task 3.2.5)
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const handleHashChange = () => {
            setCurrentPath(window.location.hash);
        };

        window.addEventListener('hashchange', handleHashChange);

        // Routing Guards
        if (!isAuthenticated && !['#/login', '#/register'].includes(currentPath)) {
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
    const userEmail = user?.email || '';

    if (!isAuthenticated) {
        if (currentPath === '#/register') {
            content = <RegisterPage onBackToLogin={() => window.location.hash = '#/login'} />;
        } else {
            content = (
                <Login
                    onLogin={() => { window.location.hash = '#/pokedex'; }}
                    onRegisterClick={() => { window.location.hash = '#/register'; }}
                />
            );
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
                        onLogout={handleLogout} 
                    />
                );
                break;
            case '#/pokedex':
            default:
                content = (
                    <Pokedex
                        onLogout={handleLogout}
                        user={user}
                        onOpenProfile={() => window.location.hash = '#/profile'}
                        onOpenCMS={() => window.location.hash = '#/cms'}
                        onOpenRecommendations={() => window.location.hash = '#/recommendations'}
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
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}