import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LogOut, User, Mail, Edit2, Check, X, Loader2 } from 'lucide-react';
import { userService, UserProfile } from '../services/userService';
import { toast } from 'sonner';

interface ProfilePageProps {
  userEmail: string;
  onBack: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userEmail, onBack, onLogout }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getCurrentUser();
        setUser(data);
        setDisplayName(data.displayName || userEmail.split('@')[0]);
        setEditName(data.displayName || userEmail.split('@')[0]);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      toast.error('Display Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await userService.updateProfile({ displayName: editName.trim() });
      setDisplayName(updated.displayName);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(displayName);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const initial = displayName ? displayName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase();

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
                            disabled={isSaving}
                            placeholder="Enter display name"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-colors"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSaving}
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
