// src/components/ProtectedRoute.tsx
import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // your auth hook

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Optional: could handle side effects on auth state change
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login...');
        }
    }, [isAuthenticated]);

    // Redirect unauthenticated users to /login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render protected content if authenticated
    return <>{children}</>;
}