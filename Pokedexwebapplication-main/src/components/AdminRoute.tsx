// src/components/AdminRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'hooks/useAuth'; // absolute path from src/hooks/useAuth
import { Pokedex } from 'components/Pokedex'; // absolute path from src/components/Pokedex

interface AdminRouteProps {
    children: ReactNode;
}

import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "Admin") {
    return <Navigate to="/pokedex" replace />;
  }

  return children;
}