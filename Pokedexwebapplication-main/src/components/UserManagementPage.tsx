import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Shield, Trash2, UserCog, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface UserRow {
    id: string;
    username: string;
    email: string;
    roles: string[];
}

export const UserManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [rows, setRows] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [workingId, setWorkingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return rows.filter((u) => u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }, [rows, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch('/api/users');
                if (!res.ok) throw new Error('Failed to fetch users');
                const data = (await res.json()) as UserRow[];
                setRows(data);
            } catch (err: any) {
                setError(err?.message || 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const updateRole = async (userId: string, role: string) => {
        const user = rows.find((u) => u.id === userId);
        if (!user) return;
        if (!window.confirm(`Change ${user.username}'s role to ${role}?`)) return;
        setWorkingId(userId);
        setError(null);
        setSuccess(null);
        try {
            const res = await apiFetch(`/api/users/${userId}/roles`, {
                method: 'PUT',
                body: JSON.stringify({ role }),
            });
            if (!res.ok) throw new Error('Failed to update role');
            setRows((prev) => prev.map((u) => (u.id === userId ? { ...u, roles: [role] } : u)));
            setSuccess(`${user.username} is now ${role}`);
        } catch (err: any) {
            setError(err?.message || 'Role update failed');
        } finally {
            setWorkingId(null);
        }
    };

    const deleteUser = async (userId: string) => {
        const user = rows.find((u) => u.id === userId);
        if (!user) return;
        if (!window.confirm(`Delete user ${user.username}? This cannot be undone.`)) return;
        setWorkingId(userId);
        setError(null);
        setSuccess(null);
        try {
            const res = await apiFetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete user');
            setRows((prev) => prev.filter((u) => u.id !== userId));
            setSuccess(`Deleted ${user.username}`);
        } catch (err: any) {
            setError(err?.message || 'Delete failed');
        } finally {
            setWorkingId(null);
        }
    };

    if (!isAdmin) {
        return (
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>Admin access required.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-700">
                        <UserCog className="w-5 h-5" />
                        <h1 className="text-xl font-bold">User Management</h1>
                    </div>
                    <button onClick={() => navigate('/pokedex')} className="text-sm font-semibold text-red-600 hover:text-red-700">Back</button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <input className="w-full md:w-64 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Search by user or email" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    {loading && <Loader2 className="w-5 h-5 animate-spin text-red-600" />}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="flex-1">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{success}</span>
                    </div>
                )}

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="text-left px-4 py-2">Username</th>
                                <th className="text-left px-4 py-2">Email</th>
                                <th className="text-left px-4 py-2">Role</th>
                                <th className="text-left px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((u) => (
                                <tr key={u.id} className="border-t border-slate-100">
                                    <td className="px-4 py-2 font-semibold text-slate-800">{u.username}</td>
                                    <td className="px-4 py-2 text-slate-600">{u.email}</td>
                                    <td className="px-4 py-2">
                                        <select value={u.roles[0]} onChange={(e) => updateRole(u.id, e.target.value)} className="border border-slate-200 rounded px-2 py-1 text-sm" disabled={workingId === u.id}>
                                            <option value="User">User</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => deleteUser(u.id)} disabled={workingId === u.id} className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-60">
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && paged.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-4 text-center text-slate-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-center gap-3">
                    <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Prev</button>
                    <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Next</button>
                </div>
            </div>
        </div>
    );
};