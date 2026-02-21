import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LogOut, User, Mail } from 'lucide-react';

interface ProfilePageProps {
  userEmail: string;
  onBack: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userEmail, onBack, onLogout }) => {
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const displayName = userEmail.split('@')[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={onBack}
              className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
              title="Back to Pokédex"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-800 shadow-sm">
                <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight hidden sm:block">My Profile</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 w-full max-w-md overflow-hidden"
        >
          {/* Avatar banner */}
          <div className="bg-gradient-to-br from-red-500 to-red-700 px-8 pt-10 pb-16 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-red-600 text-4xl font-black shadow-lg ring-4 ring-white/40">
              {initial}
            </div>
          </div>

          {/* Info card */}
          <div className="px-8 pb-8 -mt-8">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 divide-y divide-slate-100">
              <div className="flex items-center gap-3 px-5 py-4">
                <User className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Display Name</p>
                  <p className="text-slate-800 font-semibold capitalize">{displayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-4">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email Address</p>
                  <p className="text-slate-800 font-semibold">{userEmail}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Pokédex
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
