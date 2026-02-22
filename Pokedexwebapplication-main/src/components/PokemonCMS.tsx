import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
    onBack: () => void;
}

const FALLBACK_TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

const TYPE_COLORS: Record<string, string> = {
    normal: 'bg-slate-400', fire: 'bg-orange-500', water: 'bg-blue-500',
    grass: 'bg-green-500', electric: 'bg-yellow-400', ice: 'bg-cyan-400',
    fighting: 'bg-red-600', poison: 'bg-purple-500', ground: 'bg-amber-600',
    flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-lime-500',
    rock: 'bg-stone-500', ghost: 'bg-violet-600', dragon: 'bg-violet-700',
    dark: 'bg-slate-700', steel: 'bg-slate-500', fairy: 'bg-pink-400',
};

export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // States mula sa Task 2.4.1 at dev-frontend
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // Form State
    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        types: [],
        image: ''
    });

    const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);

    const isOperating = loading || isSaving;

    // ── Load Data with Pagination ──
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const offset = (currentPage - 1) * pageSize;
            const data = await pokemonService.getList(offset, pageSize);
            setPokemonList(data);
        } catch (err: any) {
            setError(err?.message || 'Failed to load Pokémon from API.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const loadTypes = async () => {
            try {
                const res = await fetch('https://pokeapi.co/api/v2/type');
                const data = await res.json();
                setAvailableTypes(data.results.map((t: any) => t.name));
            } catch (err) {
                console.error('Failed to load types:', err);
            }
        };
        loadTypes();
    }, []);

    // ── CRUD Handlers ──
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSaving(true);
        setError(null);

        try {
            if (isAdding) {
                await pokemonService.createPokemon({
                    name: formData.name.trim(),
                    types: formData.types || ['normal'],
                    image: formData.image || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
                });
                setSuccess('New Pokemon added successfully!');
            } else if (isEditing !== null) {
                await pokemonService.updatePokemon(isEditing, formData);
                setSuccess('Pokemon updated successfully!');
            }
            
            await loadData();
            setIsAdding(false);
            setIsEditing(null);
            setFormData({ name: '', types: [], image: '' });
        } catch (err: any) {
            setError(err?.message || 'Save failed.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            await pokemonService.deletePokemon(deleteTarget.id);
            setSuccess('Deleted successfully!');
            await loadData();
        } catch (err: any) {
            setError(err?.message || 'Delete failed.');
        } finally {
            setIsSaving(false);
            setDeleteTarget(null);
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const startEdit = (p: Pokemon) => {
        if (isOperating) return;
        setIsEditing(p.id);
        setFormData({ ...p });
        setIsAdding(false);
    };

    const startAdd = () => {
        if (isOperating) return;
        setIsAdding(true);
        setIsEditing(null);
        setFormData({
            name: '',
            types: [],
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Pokedex
                    </button>
                    <div className="flex items-center gap-4">
                        {success && <span className="text-green-600 font-medium text-sm animate-pulse">{success}</span>}
                        {error && <span className="text-red-600 font-medium text-sm">{error}</span>}
                        <button onClick={startAdd} disabled={isOperating} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50">
                            <Plus className="w-5 h-5" /> Add New
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* List Container */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium flex justify-between items-center">
                            <span className="text-slate-600">Pokémon Management</span>
                            {loading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                        </div>

                        <div className="relative min-h-[400px]">
                            {loading && !pokemonList.length ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                                    <p className="text-slate-400 font-medium">Loading inventory...</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {pokemonList.map(p => (
                                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <img src={p.image} alt={p.name} className="w-12 h-12 object-contain" />
                                                <div>
                                                    <h3 className="font-bold capitalize text-slate-800">{p.name}</h3>
                                                    <div className="flex gap-1 mt-1">
                                                        {p.types.map(t => (
                                                            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full text-white uppercase font-bold ${TYPE_COLORS[t] || 'bg-slate-400'}`}>
                                                                {t}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="w-5 h-5" /></button>
                                                <button onClick={() => setDeleteTarget(p)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing page <span className="font-bold text-slate-800">{currentPage}</span>
                            </p>
                            <div className="flex gap-2">
                                <button disabled={currentPage === 1 || loading} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button disabled={loading || pokemonList.length < pageSize} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Panel */}
                <AnimatePresence mode="wait">
                    {(isEditing || isAdding) && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full lg:w-96">
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-24">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-800">{isAdding ? 'Add New Pokémon' : 'Edit Pokémon'}</h2>
                                    <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-6 h-6 text-slate-400" /></button>
                                </div>
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Pokémon Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Pikachu" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 uppercase">Image URL</label>
                                        <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 uppercase">Types (Max 2)</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableTypes.slice(0, 18).map(type => (
                                                <button key={type} type="button" onClick={() => {
                                                    const current = formData.types || [];
                                                    const updated = current.includes(type) ? current.filter(t => t !== type) : current.length < 2 ? [...current, type] : [current[1], type];
                                                    setFormData({ ...formData, types: updated });
                                                }} className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all border-2 ${formData.types?.includes(type) ? `${TYPE_COLORS[type]} border-transparent text-white shadow-md scale-105` : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 mt-6 shadow-lg shadow-slate-200">
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {isAdding ? 'Create Pokémon' : 'Update Pokémon'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-red-100 p-2.5 rounded-full"><Trash2 className="w-5 h-5 text-red-600" /></div>
                                    <h3 className="text-lg font-bold text-slate-800">Delete {deleteTarget.name}?</h3>
                                </div>
                                <p className="text-slate-600 text-sm mb-6">Are you sure you want to delete <span className="font-bold capitalize text-slate-800">"{deleteTarget.name}"</span>? This action cannot be undone.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                                    <button onClick={confirmDelete} disabled={isSaving} className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                                        {isSaving ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};