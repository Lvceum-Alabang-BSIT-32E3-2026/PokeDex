import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';
import { ArrowLeft, LogOut, User, Mail, Edit2, Check, X, Key } from 'lucide-react';

interface ProfilePageProps {
  userEmail: string;
  onBack: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userEmail, onBack, onLogout }) => {
  const { updateUser } = useAuth();
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
  const defaultDisplayName = userEmail.split('@')[0];

  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const API_URL = import.meta.env.VITE_IDENTITY_API_URL || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editName.trim()) {
      setError('Display Name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setDisplayName(editName.trim());
      updateUser({ displayName: editName.trim() });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while changing password';
      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(displayName);
    setError('');
  };

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
            <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
              {success && (
                <div className="bg-green-50 border-b border-green-100 px-5 py-3">
                  <p className="text-sm text-green-700 font-medium text-center">{success}</p>
                </div>
              )}
              <div className="divide-y divide-slate-100">
                <div className="flex items-start gap-4 px-5 py-5">
                  <User className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Display Name</p>
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <div>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={isLoading}
                            placeholder="Enter display name"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                          />
                          {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between items-center group">
                        <p className="text-slate-800 font-semibold text-lg capitalize truncate">{displayName}</p>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setSuccess('');
                          }}
                          className="text-slate-400 hover:text-red-600 p-2 -mr-2 rounded-full hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Edit Display Name"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 px-5 py-5">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-slate-800 font-medium truncate">{userEmail}</p>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Key className="w-5 h-5 text-slate-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-slate-800">Change Password</h3>
                  </div>

                  {passwordSuccess && (
                    <div className="bg-green-50 border border-green-100 rounded-md px-4 py-2 mb-4">
                      <p className="text-sm text-green-700 font-medium">{passwordSuccess}</p>
                    </div>
                  )}
                  {passwordError && (
                    <div className="bg-red-50 border border-red-100 rounded-md px-4 py-2 mb-4">
                      <p className="text-sm text-red-700 font-medium">{passwordError}</p>
                    </div>
                  )}

                  <form onSubmit={handlePasswordChange} className="space-y-3">
                    <div>
                      <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isChangingPassword}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isChangingPassword}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isChangingPassword}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {isChangingPassword ? 'Changing Password...' : 'Update Password'}
                    </button>
                  </form>
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
