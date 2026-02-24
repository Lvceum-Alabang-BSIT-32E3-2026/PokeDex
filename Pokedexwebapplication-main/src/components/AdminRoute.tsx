// src/components/AdminRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Login } from './Login';
import { Pokedex } from './Pokedex';

interface AdminRouteProps {
    children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, user } = useAuth();

    // Redirect non-authenticated users to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin
    const isAdmin = Array.isArray(user?.role)
        ? user.role.includes('Admin')
        : user?.role === 'Admin';

    // Redirect non-admin users to Pokedex or show message
    if (!isAdmin) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to access this page.</p>
                <Pokedex />
            </div>
        );
    }

    // Admin users can access children
    return <>{children}</>;
}