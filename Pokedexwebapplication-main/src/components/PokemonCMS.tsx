import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Edit2, Save, X, Search, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
    Loader2, AlertCircle 
} from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../contexts/AuthContext';
import { Link } from "react-router-dom";

const FALLBACK_TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

export const PokemonCMS = () => {
    const { isAdmin } = useAuth();
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [totalContents, setTotalContents] = useState(0);
    
    // UI State
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Pagination & Filter State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        types: [],
        image: ''
    });
    const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);

    const isOperating = loading || isSaving;

    // ── Data Fetching ──
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const offset = (currentPage - 1) * pageSize;
            // Uses the merged service logic with search and pagination
            const response = await pokemonService.getList(offset, pageSize, 'all', 'all', searchTerm);
            setPokemonList(response.items);
            setTotalContents(response.totalCount);
        } catch (err: any) {
            setError(err?.message || 'Failed to load Pokémon.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── CRUD Operations ──
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) return;

        setIsSaving(true);
        try {
            if (isAdding) {
                const created = await pokemonService.createPokemon({
                    ...formData,
                    name: formData.name.trim(),
                    types: formData.types?.length ? formData.types : ['normal']
                });
                setSuccess(`"${created.name}" created!`);
            } else if (isEditing !== null) {
                const updated = await pokemonService.updatePokemon(isEditing, formData);
                setSuccess(`"${updated.name}" updated!`);
            }
            setIsAdding(false);
            setIsEditing(null);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Save failed.');
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
            setSuccess('Deleted successfully');
            loadData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
            setDeleteTarget(null);
        }
    };

    // ── Helper UI Logic ──
    const startEdit = (p: Pokemon) => {
        setIsEditing(p.id);
        setFormData({ ...p });
        setIsAdding(false);
    };

    const totalPages = Math.ceil(totalContents / pageSize);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <nav className="flex gap-4 text-sm font-bold text-slate-300">
                            <Link to="/cms/dashboard" className="hover:text-white">Dashboard</Link>
                            <Link to="/cms/pokedex" className="text-white border-b-2 border-blue-500">CMS</Link>
                        </nav>
                        <h1 className="text-xl font-bold border-l border-slate-700 pl-6">Inventory Manager</h1>
                    </div>
                    <button 
                        onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ name: '', types: [], image: '' }); }}
                        className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Pokemon
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* List Section */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Search by name..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                            <div className="text-sm text-slate-500 font-medium">
                                Total: <span className="text-slate-900">{totalContents}</span>
                            </div>
                        </div>

                        <div className="relative min-h-[400px]">
                            {loading && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                </div>
                            )}
                            
                            <div className="divide-y divide-slate-100">
                                {pokemonList.map(p => (
                                    <motion.div key={p.id} layout className="p-4 flex items-center justify-between hover:bg-slate-50">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-slate-100 rounded-lg p-1" />
                                            <div>
                                                <h3 className="font-bold capitalize text-slate-800">{p.name}</h3>
                                                <div className="flex gap-1 mt-1">
                                                    {p.types.map(t => (
                                                        <span key={t} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteTarget(p)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Show</span>
                                <select 
                                    value={pageSize} 
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                    className="border rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                                <span>entries</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex gap-1">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-20"><ChevronsLeft className="w-4 h-4"/></button>
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-20"><ChevronLeft className="w-4 h-4"/></button>
                                </div>
                                <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
                                <div className="flex gap-1">
                                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-20"><ChevronRight className="w-4 h-4"/></button>
                                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(totalPages)} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-20"><ChevronsRight className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Panel */}
                <AnimatePresence>
                    {(isEditing || isAdding) && (
                        <motion.aside 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-full lg:w-96"
                        >
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-24">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-slate-800">{isAdding ? 'New Pokémon' : 'Edit Pokémon'}</h2>
                                    <button onClick={() => { setIsEditing(null); setIsAdding(false); }} className="p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                                </div>
                                
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                            value={formData.image}
                                            onChange={e => setFormData({...formData, image: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </form>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </main>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4"><Trash2 className="w-6 h-6" /></div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Confirm Delete</h2>
                            <p className="text-slate-500 mb-6">Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteTarget.name}"</span>? This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-2 font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};