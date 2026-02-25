// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Login } from '../components/Login';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirect to login
        return <Login />;
    }

    return <>{children}</>;
}