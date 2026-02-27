import React, { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "../components/Login";
import { Pokedex } from "../components/Pokedex"; // keep this if your Pokedex is in pages

export function AdminRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, isAdmin } = useAuth();

    // If not authenticated → show Login
    if (!isAuthenticated) {
        return <Login />;
    }

    // If authenticated but not admin → redirect to Pokedex
    if (!isAdmin) {
        return <Pokedex />;
    }

    // If admin → allow access
    return <>{children}</>;
}