import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Shield, Lock } from 'lucide-react';
import { apiFetch } from '../utils/api';

interface UserProfile {
    email: string;
    username: string;
    displayName: string;
}

type Message = { type: 'success' | 'error'; text: string } | null;

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [message, setMessage] = useState<Message>(null);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            setMessage(null);
            try {
                const res = await apiFetch('/api/users/me');
                if (!res.ok) throw new Error('Failed to load user info');
                const data = (await res.json()) as UserProfile;
                setUser(data);
                setDisplayName(data.displayName || '');
                setUsername(data.username || '');
            } catch (err: any) {
                setMessage({ type: 'error', text: err?.message || 'Failed to load user info.' });
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const validateProfile = () => {
        if (!displayName.trim()) return 'Display name is required.';
        if (displayName.trim().length < 3) return 'Display name must be at least 3 characters.';
        if (!username.trim()) return 'Username is required.';
        return null;
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        const validation = validateProfile();
        if (validation) {
            setMessage({ type: 'error', text: validation });
            return;
        }
        setSavingProfile(true);
        setMessage(null);
        try {
            const res = await apiFetch('/api/users/me', {
                method: 'PUT',
                body: JSON.stringify({ displayName: displayName.trim(), username: username.trim() }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || 'Failed to update profile.');
            }
            setUser({ ...user, displayName: displayName.trim(), username: username.trim() });
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.message || 'Failed to update profile.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setSavingPassword(true);
        setMessage(null);
        try {
            const res = await apiFetch('/api/users/me/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || 'Failed to change password.');
            }
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setMessage({ type: 'success', text: 'Password changed successfully.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err?.message || 'Failed to change password.' });
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex justify-center items-center py-16 text-slate-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading profile...</span>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Unable to load profile.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Signed in as</p>
                        <h1 className="text-xl font-bold text-slate-900">{user.email}</h1>
                    </div>
                    <button onClick={() => navigate('/pokedex')} className="text-sm font-semibold text-red-600 hover:text-red-700">Back to Pokedex</button>
                </div>

                {message && (
                    <div className={`rounded-lg px-4 py-3 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Shield className="w-4 h-4" />
                        <h2 className="text-lg font-semibold">Profile</h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Username</label>
                            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Display Name</label>
                            <input className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                        {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />} Save Profile
                    </button>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Lock className="w-4 h-4" />
                        <h2 className="text-lg font-semibold">Change Password</h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Current Password</label>
                            <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">New Password</label>
                            <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Confirm Password</label>
                            <input type="password" className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </div>
                    <button
                        onClick={handlePasswordChange}
                        disabled={savingPassword}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 disabled:opacity-60"
                    >
                        {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />} Update Password
                    </button>
                </section>
            </div>
        </div>
    );
};