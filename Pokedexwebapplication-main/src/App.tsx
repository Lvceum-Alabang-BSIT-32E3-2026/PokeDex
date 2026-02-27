import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/Login';
import RegisterPage from './components/RegisterPage';
import Pokedex from './components/Pokedex';
import PokemonCMS from './components/PokemonCMS';
import Recommendations from './components/Recommendations';
import ProfilePage from './components/ProfilePage';

/* ---------- SHARED MAINTENANCE UI ---------- */
const MaintenanceView = ({ title, message }: { title: string; message: string }) => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-slate-500 mb-6">{message}</p>
      <button 
        onClick={() => window.location.hash = '#/pokedex'} 
        className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all shadow-md"
      >
        Back to Pokedex
      </button>
    </div>
  </div>
);

/* ---------- ROUTING LOGIC ---------- */
const AppRoutes = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const userEmail = user?.email || '';

  const handleLogout = () => logout();

  // 1. PUBLIC ROUTES
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/register" 
          element={
            <MaintenanceView 
              title="Create Trainer Account" 
              message="Registration is currently under maintenance. Please check back later!" 
            />
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 2. PROTECTED ROUTES
  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-50 min-h-screen">
      <Routes>
        <Route
          path="/pokedex"
          element={
            <Pokedex
              onLogout={handleLogout}
              userEmail={userEmail}
            />
          }
        />
        <Route path="/cms" element={<PokemonCMS />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              userEmail={userEmail}
              onLogout={handleLogout}
            />
          }
        />
        <Route 
          path="/collection" 
          element={
            <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-slate-50">
              <h2 className="text-3xl font-bold text-slate-800">My Collection</h2>
              <p className="text-slate-500 mt-2">Your captured Pokemon will appear here soon!</p>
              <button
                onClick={() => window.location.hash = '#/pokedex'}
                className="mt-6 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-md"
              >
                Back to Pokedex
              </button>
            </div>
          } 
        />
        {/* Fallback to Pokedex */}
        <Route path="*" element={<Navigate to="/pokedex" replace />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      {/* HashRouter handles the #/ logic automatically without manual event listeners */}
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}