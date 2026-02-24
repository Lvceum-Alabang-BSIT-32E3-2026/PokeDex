// src/components/AdminRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth'; // absolute path from src/hooks/useAuth
import { Pokedex } from 'components/Pokedex'; // absolute path from src/components/Pokedex

interface AdminRouteProps {
    children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, user } = useAuth();

    // 1️⃣ Redirect non-authenticated users to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2️⃣ Check if user is admin
    const isAdmin = Array.isArray(user?.role)
        ? user.role.includes('Admin')
        : user?.role === 'Admin';

    // 3️⃣ Redirect non-admin users to Pokedex
    if (!isAdmin) {
        return <Navigate to="/pokedex" replace />;
    }

    // 4️⃣ Admin users can access children
    return <>{children}</>;
}