//// src/components/AdminRoute.tsx
import React, { ReactNode } from "react";
import { useAuth } from "hooks/useAuth"; // absolute path from src/hooks/useAuth
import { Login } from "components/Login"; // absolute path from src/components/Login
import { Pokedex } from "components/Pokedex"; // absolute path from src/components/Pokedex

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();

  // 1️⃣ Redirect non-authenticated users to login
  if (!isAuthenticated) {
    return <Login />;
  }

  // 2️⃣ Redirect non-admin users to Pokedex or show access denied
  if (!isAdmin) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <Pokedex />
      </div>
    );
  }

  // 3️⃣ Admin users can access children
  return <>{children}</>;
}