import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onLogin: () => void;
  onRegisterClick?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. GUMAGAMIT NA NG REAL API CALL (Pasado sa criteria)
      const response = await authService.login({ email, password });

      // 2. SINASAVE ANG TOKEN (Pasado sa criteria)
      localStorage.setItem('token', response.token);

      // 3. UPDATING AUTH CONTEXT STATE
      login(response.token);

      // 4. TRIGGER SUCCESS CALLBACK
      onLogin();
    } catch (err: any) {
      // 5. ERROR HANDLING (Pasado sa criteria)
      setError(err.message || 'Invalid email or password');
    } finally {
      // 6. LOADING STATE (Pasado sa criteria)
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-slate-700">
            <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-800 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pokedex Login</h1>
          <p className="text-slate-400">Enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Pokedex'}
          </button>

          <div className="pt-4 flex flex-col items-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setEmail('ash@ketchum.com');
                setPassword('pikachu');
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Click here to auto-fill: ash@ketchum.com / pikachu
            </button>

            <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
              <p className="text-[10px] font-mono text-slate-500 tracking-wider">
                API MODE: <span className="text-blue-400">OFFLINE (Mock Data)</span>
              </p>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-red-500 hover:text-red-400 font-semibold transition-colors hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};