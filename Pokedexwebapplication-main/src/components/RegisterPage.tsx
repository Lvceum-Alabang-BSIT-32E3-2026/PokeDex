import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, AlertCircle, User } from 'lucide-react';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const result = await authService.register({
        email: form.email,
        username: form.username,
        password: form.password,
        displayName: form.displayName || undefined,
      });
      setSuccess(result.message);
      setForm({ email: '', username: '', password: '', confirmPassword: '', displayName: '' });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-slate-700">
            <div className="w-12 h-12 bg-white rounded-full border-4 border-slate-800 relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 rounded-full"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pokédex Registration</h1>
          <p className="text-slate-400">Create your trainer account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`px-4 py-3 rounded-lg flex items-center text-sm ${
                error ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-green-500/10 border border-green-500/20 text-green-400'
              }`}
            >
              {error && <AlertCircle className="w-4 h-4 mr-2" />}
              {error ? error : success}
            </motion.div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="ash@ketchum.com"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="TrainerName"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Display Name (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Display Name (optional)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Ash Ketchum"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-red-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/"
              className="text-red-500 hover:text-red-600 hover:underline transition-colors"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-slate-400 text-xs">
          © 2026 Pokémon Trainer Registration
        </footer>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
