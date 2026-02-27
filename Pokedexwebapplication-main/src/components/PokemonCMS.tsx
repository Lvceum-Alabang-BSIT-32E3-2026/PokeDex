import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Edit2, Save, X, ArrowLeft, 
    ChevronDown, Loader2, ChevronLeft, ChevronRight, 
    ChevronsLeft, ChevronsRight, Search 
} from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { useParams, Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

interface PokemonCMSProps {
    onBack?: () => void;
}

const FALLBACK_TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {
    const { isAdmin } = useAuth();
    
    // ── State Management ──
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);
    
    // ── Filter & Pagination State ──
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);

    // ── Form State ──
    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        types: [],
        imageUrl: ''
    });

    const isOperating = loading || isSaving;

    // ── Data Fetching ──
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetching a larger set for client-side filtering/pagination as per dev branch
            const response = await pokemonService.getList(0, 500);
            setPokemonList(response.items || response); 
        } catch (err: any) {
            setError(err?.message || 'Failed to load Pokémon from API.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadTypes = async () => {
        try {
            const res = await fetch('https://pokeapi.co/api/v2/type');
            const data = await res.json();
            setAvailableTypes(data.results.map((t: any) => t.name));
        } catch (err) {
            console.error('Failed to load types:', err);
        }
    };

    useEffect(() => {
        loadData();
        loadTypes();
    }, [loadData]);

    // ── Search & Pagination Logic ──
    const filteredList = pokemonList.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.types.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const paginatedList = filteredList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ── Handlers ──
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
            types: ['normal'],
            imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSaving(true);
        try {
            if (isAdding) {
                const created = await pokemonService.createPokemon({
                    name: formData.name.trim(),
                    types: formData.types || ['normal'],
                    imageUrl: formData.imageUrl || '',
                });
                setPokemonList(prev => [created, ...prev]);
                setSuccess(`"${created.name}" added successfully!`);
            } else if (isEditing !== null) {
                const updated = await pokemonService.updatePokemon(isEditing, formData);
                setPokemonList(prev => prev.map(p => p.id === isEditing ? updated : p));
                setSuccess(`"${updated.name}" updated successfully!`);
            }
            setIsAdding(false);
            setIsEditing(null);
        } catch (err: any) {
            setError(err?.message || 'Save failed.');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            await pokemonService.deletePokemon(deleteTarget.id);
            setPokemonList(prev => prev.filter(p => p.id !== deleteTarget.id));
            setSuccess('Deleted successfully!');
        } catch (err: any) {
            setError(err?.message || 'Delete failed.');
        } finally {
            setIsSaving(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/cms/dashboard" className="text-sm font-bold text-slate-300 hover:text-white">Dashboard</Link>
                        <h1 className="text-xl font-bold ml-6">Pokémon CMS</h1>
                    </div>
                    <button 
                        onClick={startAdd}
                        className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
                {/* List Section */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between gap-4">
                            <div className="relative flex-1 max-w-xs">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder="Search inventory..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative min-h-[400px]">
                            {loading && (
                                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            )}
                            <div className="divide-y divide-slate-100">
                                {paginatedList.map(p => (
                                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 object-contain" />
                                            <div>
                                                <h4 className="font-bold capitalize text-slate-800">{p.name}</h4>
                                                <div className="flex gap-1 mt-1">
                                                    {p.types.map(t => (
                                                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase font-bold">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => setDeleteTarget(p)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
                            <span className="text-sm text-slate-500">Page {currentPage} of {totalPages || 1}</span>
                            <div className="flex gap-2">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    className="p-2 border rounded bg-white disabled:opacity-50"
                                ><ChevronLeft className="w-4 h-4" /></button>
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    className="p-2 border rounded bg-white disabled:opacity-50"
                                ><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Sidebar */}
                <AnimatePresence>
                    {(isEditing || isAdding) && (
                        <motion.div 
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="w-full lg:w-80 bg-white p-6 rounded-xl shadow-lg border h-fit sticky top-24"
                        >
                            <h2 className="text-lg font-bold mb-4">{isAdding ? 'Add Pokémon' : 'Edit Pokémon'}</h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Name</label>
                                    <input 
                                        className="w-full p-2 border rounded" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => { setIsEditing(null); setIsAdding(false); }}
                                    className="w-full text-slate-500 text-sm"
                                >
                                    Cancel
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl">
                            <h3 className="text-lg font-bold mb-2">Delete {deleteTarget.name}?</h3>
                            <p className="text-slate-500 text-sm mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                                <button onClick={confirmDelete} disabled={isSaving} className="flex-1 py-2 bg-red-600 text-white rounded-lg">
                                    {isSaving ? 'Deleting...' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};