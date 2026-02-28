import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, X, Search, Loader2, ChevronLeft, ChevronRight, Shield, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../contexts/AuthContext';

const FALLBACK_TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

interface FormErrors {
    name?: string;
    pokedexNumber?: string;
    generation?: string;
    types?: string;
    imageUrl?: string;
}

export const PokemonCMS: React.FC = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    const [items, setItems] = useState<Pokemon[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [generation, setGeneration] = useState<string>('all');
    const [type, setType] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);
    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        pokedexNumber: 0,
        imageUrl: '',
        generation: 1,
        types: ['normal'],
        isLegendary: false,
        isMythical: false,
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', pokedexNumber: 0, imageUrl: '', generation: 1, types: ['normal'], isLegendary: false, isMythical: false });
        setFormErrors({});
    };

    const loadTypes = useCallback(async () => {
        try {
            const res = await fetch('https://pokeapi.co/api/v2/type');
            const data = await res.json();
            setAvailableTypes(data.results.map((t: any) => t.name));
        } catch {
            setAvailableTypes(FALLBACK_TYPES);
        }
    }, []);

    const loadList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const offset = (page - 1) * pageSize;
            const data = await pokemonService.getList(offset, pageSize, generation === 'all' ? undefined : Number(generation), type === 'all' ? undefined : type, search);
            setItems(data.items);
            setTotal(data.totalCount);
        } catch (err: any) {
            setError(err?.message || 'Failed to load Pokémon.');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, generation, type, search]);

    useEffect(() => {
        loadTypes();
    }, [loadTypes]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    const validateForm = (): boolean => {
        const next: FormErrors = {};
        if (!formData.name?.trim()) next.name = 'Name is required';
        if (!formData.pokedexNumber || formData.pokedexNumber <= 0) next.pokedexNumber = 'Pokedex number required';
        if (!formData.generation || formData.generation < 1) next.generation = 'Generation required';
        if (!formData.types || formData.types.length === 0 || !formData.types[0]) next.types = 'At least one type required';
        if (!formData.imageUrl?.trim()) next.imageUrl = 'Image URL required';
        setFormErrors(next);
        return Object.keys(next).length === 0;
    };

    const openCreate = () => {
        resetForm();
        setShowForm(true);
    };

    const openEdit = (p: Pokemon) => {
        setEditingId(p.id);
        setFormData({ ...p });
        setFormErrors({});
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            if (editingId) {
                const updated = await pokemonService.updatePokemon(editingId, formData);
                setItems((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
                setSuccess(`Updated ${updated.name}`);
            } else {
                const created = await pokemonService.createPokemon(formData);
                setItems((prev) => [created, ...prev]);
                setTotal((t) => t + 1);
                setSuccess(`Added ${created.name}`);
            }
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            setError(err?.message || 'Save failed.');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await pokemonService.deletePokemon(deleteTarget.id);
            setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
            setTotal((t) => Math.max(0, t - 1));
            setSuccess('Deleted successfully');
        } catch (err: any) {
            setError(err?.message || 'Delete failed.');
        } finally {
            setIsSaving(false);
            setDeleteTarget(null);
        }
    };

    const typeOptions = useMemo(() => ['all', ...availableTypes], [availableTypes]);
    const generations = useMemo(
        () => ['all', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        []
    );

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
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/pokedex')} className="flex items-center gap-2 text-slate-200 hover:text-white">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </button>
                        <h1 className="text-xl font-bold">Pokemon CMS</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <nav className="hidden md:flex items-center gap-4">
                            <button onClick={() => navigate('/cms')} className="text-sm font-bold text-white border-b-2 border-emerald-500 pb-1">Pokemon</button>
                            <button onClick={() => navigate('/users')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-slate-700">Users</button>
                        </nav>
                        <button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
                            <Plus className="w-4 h-4" /> Add Pokemon
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input className="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-lg text-sm" placeholder="Search name or type" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                        </div>
                        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={generation} onChange={(e) => { setGeneration(e.target.value); setPage(1); }}>
                            {generations.map((g) => (
                                <option key={g} value={g}>{g === 'all' ? 'All Generations' : `Gen ${g}`}</option>
                            ))}
                        </select>
                        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
                            {typeOptions.map((t) => (
                                <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
                            ))}
                        </select>
                    </div>
                    {loading && <Loader2 className="w-5 h-5 animate-spin text-red-600" />}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="flex-1">{error}</span>
                        <button className="underline text-sm" onClick={loadList}>Retry</button>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>{success}</span>
                        <button className="ml-auto text-xs underline" onClick={() => setSuccess(null)}>Dismiss</button>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y">
                    {items.map((p) => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div className="flex items-center gap-4">
                                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-contain" />
                                <div>
                                    <div className="font-bold capitalize">{p.name}</div>
                                    <div className="text-xs text-slate-500">Dex #{p.pokedexNumber} • Gen {p.generation}</div>
                                    <div className="flex gap-1 mt-1">
                                        {p.types.map((t) => (
                                            <span key={t} className="text-[10px] uppercase font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openEdit(p)} className="p-2 hover:text-blue-600" aria-label="Edit Pokemon">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => setDeleteTarget(p)} className="p-2 hover:text-red-600" aria-label="Delete Pokemon">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && !loading && (
                        <div className="p-6 text-center text-slate-500 text-sm">No Pokémon found.</div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                    <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded-full bg-white border disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-2 rounded-full bg-white border disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </main>

            <AnimatePresence>
                {showForm && (
                    <motion.div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">{editingId ? 'Edit Pokemon' : 'Add Pokemon'}</h2>
                                <button onClick={() => { setShowForm(false); resetForm(); }} aria-label="Close form"><X className="w-5 h-5" /></button>
                            </div>
                            <form className="space-y-3" onSubmit={handleSave}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Name</label>
                                        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                        {formErrors.name && <p className="text-xs text-red-600">{formErrors.name}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Pokedex #</label>
                                        <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" value={formData.pokedexNumber ?? ''} onChange={(e) => setFormData({ ...formData, pokedexNumber: Number(e.target.value) })} />
                                        {formErrors.pokedexNumber && <p className="text-xs text-red-600">{formErrors.pokedexNumber}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Generation</label>
                                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2" value={formData.generation ?? 1} onChange={(e) => setFormData({ ...formData, generation: Number(e.target.value) })}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (<option key={g} value={g}>Gen {g}</option>))}
                                        </select>
                                        {formErrors.generation && <p className="text-xs text-red-600">{formErrors.generation}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Image URL</label>
                                        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500" value={formData.imageUrl || ''} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
                                        {formErrors.imageUrl && <p className="text-xs text-red-600">{formErrors.imageUrl}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Primary Type</label>
                                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2" value={formData.types?.[0] || ''} onChange={(e) => setFormData({ ...formData, types: [e.target.value, formData.types?.[1] || ''] })}>
                                            <option value="">Select type</option>
                                            {availableTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
                                        </select>
                                        {formErrors.types && <p className="text-xs text-red-600">{formErrors.types}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Secondary Type</label>
                                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2" value={formData.types?.[1] || ''} onChange={(e) => setFormData({ ...formData, types: [formData.types?.[0] || '', e.target.value || ''] })}>
                                            <option value="">None</option>
                                            {availableTypes.filter((t) => t !== formData.types?.[0]).map((t) => (<option key={t} value={t}>{t}</option>))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" checked={!!formData.isLegendary} onChange={(e) => setFormData({ ...formData, isLegendary: e.target.checked })} />
                                        Legendary
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" checked={!!formData.isMythical} onChange={(e) => setFormData({ ...formData, isMythical: e.target.checked })} />
                                        Mythical
                                    </label>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
                                    <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60">
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteTarget && (
                    <motion.div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
                            <h3 className="text-lg font-bold mb-2">Delete {deleteTarget.name}?</h3>
                            <p className="text-sm text-slate-600 mb-4">This action cannot be undone.</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200">Cancel</button>
                                <button onClick={confirmDelete} disabled={isSaving} className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60">{isSaving ? 'Deleting...' : 'Delete'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};