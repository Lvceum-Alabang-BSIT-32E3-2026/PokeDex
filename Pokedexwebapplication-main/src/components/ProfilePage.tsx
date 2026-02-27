// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api'; // Your fetch wrapper
import { Loader2, AlertCircle } from 'lucide-react';

interface UserProfile {
    email: string;
    username: string;
    displayName: string;
}

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch current user info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await apiFetch<UserProfile>('/user/me');
                setUser(data);
                setDisplayName(data.displayName);
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to load user info.' });
            }
        };
        fetchUser();
    }, []);

    // Save display name
    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        setMessage(null);

        try {
            await apiFetch('/user/update', {
                method: 'PUT',
                body: JSON.stringify({ displayName }),
            });
            setUser({ ...user, displayName });
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const handlePasswordChange = async () => {
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await apiFetch('/user/change-password', {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            setPassword('');
            setConfirmPassword('');
            setMessage({ type: 'success', text: 'Password changed successfully.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p>Loading...</p>;

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>

            {/* Display messages */}
            {message && (
                <div
                    className={`p-2 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {/* User Info */}
            <div className="mb-4">
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
                <p>
                    <strong>Username:</strong> {user.username}
                </p>
            </div>

            {/* Edit Display Name */}
            <div className="mb-6">
                <label className="block font-medium mb-1">Display Name</label>
                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                />
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {loading ? <Loader2 className="animate-spin inline-block mr-2" /> : 'Save'}
                </button>
            </div>

            {/* Password Change */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Change Password</h2>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 rounded mb-2"
                />
                <button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    {loading ? <Loader2 className="animate-spin inline-block mr-2" /> : 'Change Password'}
                </button>
            </div>

            {/* Back Button */}
            <button
                onClick={() => navigate('/pokedex')}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
                Back to Pokedex
            </button>
        </div>
    );
};