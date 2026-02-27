import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import { Login } from './components/Login';
import RegisterPage from './components/RegisterPage';
import { Pokedex } from './components/Pokedex';
import { PokemonCMS } from './components/PokemonCMS';
import { Recommendations } from './components/Recommendations';
import { ProfilePage } from './components/ProfilePage';
import { CollectionPage } from './components/CollectionPage';

/**
 * AppContent handles the conditional rendering and routing logic.
 * It is separated from the Providers so it can access hooks like useAuth and useNavigate.
 */
const AppContent = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    // State for captured Pokemon brought over from task/232
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Public Routes: Redirect to Pokedex if already logged in
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
            content = <Login onLogin={() => {}} />;
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

        return (
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        <Login 
                            onLogin={() => navigate('/pokedex')} 
                            onRegisterClick={() => navigate('/register')} 
                        />
                    } 
                />
                <Route 
                    path="/register" 
                    element={<RegisterPage onBackToLogin={() => navigate('/login')} />} 
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    // Protected Routes: Redirect to Login if not authenticated
    return (
        <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
            <Routes>
                <Route
                    path="/pokedex"
                    element={
                        <Pokedex
                            onLogout={handleLogout}
                            user={user}
                            onOpenProfile={() => navigate('/profile')}
                            onOpenCMS={() => navigate('/cms')}
                            onOpenRecommendations={() => navigate('/recommendations')}
                            onOpenCollection={() => navigate('/collection')}
                        />
                    }
                />
                <Route path="/cms" element={<PokemonCMS onBack={() => navigate('/pokedex')} />} />
                <Route path="/recommendations" element={<Recommendations onBack={() => navigate('/pokedex')} />} />
                <Route 
                    path="/collection" 
                    element={<CollectionPage onBack={() => navigate('/pokedex')} capturedIds={capturedIds} />} 
                />
                <Route
                    path="/profile"
                    element={
                        <ProfilePage
                            userEmail={user?.email || ''}
                            onBack={() => navigate('/pokedex')}
                            onLogout={handleLogout}
                        />
                    }
                />
                {/* Fallback for authenticated users */}
                <Route path="*" element={<Navigate to="/pokedex" replace />} />
            </Routes>
        </div>
    );
};

/**
 * Main Entry Point
 * Wraps the application in necessary Context Providers and the Router.
 */
export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}