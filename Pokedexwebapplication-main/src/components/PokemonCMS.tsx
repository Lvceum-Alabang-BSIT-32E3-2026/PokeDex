import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, Trash2, Edit2, Save, X, Search, Loader2, 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { Link } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

interface PokemonCMSProps {
    onBack?: () => void;
}

const FALLBACK_TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {
    const { isAdmin } = useAuth();
    
    // Core Data State
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);
    
    // UI Logic States
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);
    
    // Feedback States
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{ name?: string; types?: string }>({});

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const pageOptions = [10, 20, 50];

    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        types: [],
        imageUrl: ''
    });

    const isOperating = loading || isSaving;

    // --- Data Fetching ---
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetching a large set to support the client-side filtering/pagination requested in dev-frontend
            const response = await pokemonService.getList(0, 500);
            setPokemonList(response.items || response); 
        } catch (err: any) {
            setError(err?.message || 'Failed to load Pokémon inventory.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const loadTypes = async () => {
            try {
                const res = await fetch('https://pokeapi.co/api/v2/type');
                const data = await res.json();
                setAvailableTypes(data.results.map((t: any) => t.name));
            } catch (err) { console.error('Type load failed', err); }
        };
        loadTypes();
    }, [loadData]);

    // --- Search & Pagination Logic ---
    const filteredList = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return pokemonList;
        return pokemonList.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.types.some(t => t.toLowerCase().includes(term))
        );
    }, [searchTerm, pokemonList]);

    const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage]);

    // --- Form Actions ---
    const validateForm = () => {
        const errors: { name?: string; types?: string } = {};
        if (!formData.name?.trim()) errors.name = 'Name is required';
        if (!formData.types || formData.types.length === 0) errors.types = 'Select at least one type';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            if (isAdding) {
                const created = await pokemonService.createPokemon({
                    name: formData.name!.trim(),
                    types: formData.types || ['normal'],
                    imageUrl: formData.imageUrl || '',
                });
                setPokemonList(prev => [created, ...prev]);
                setSuccess(`"${created.name}" created!`);
            } else if (isEditing !== null) {
                const updated = await pokemonService.updatePokemon(isEditing, formData);
                setPokemonList(prev => prev.map(p => p.id === isEditing ? updated : p));
                setSuccess('Update successful!');
            }
            setIsAdding(false);
            setIsEditing(null);
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
            setPokemonList(prev => prev.filter(p => p.id !== deleteTarget.id));
            setSuccess('Deleted successfully');
            setDeleteTarget(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/cms/dashboard" className="text-sm font-bold text-slate-300 hover:text-white">Dashboard</Link>
                        <h1 className="text-xl font-bold border-l border-slate-700 pl-6">Pokédex CMS</h1>
                    </div>
                    <button 
                        onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({name: '', types: [], imageUrl: ''}); }}
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
                        <div className="p-4 bg-slate-50 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-72">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name or type..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="text-sm text-slate-500 font-medium">
                                Showing {paginatedList.length} of {filteredList.length} Entries
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 min-h-[400px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                                    <p className="text-slate-400">Loading Pokedex...</p>
                                </div>
                            ) : paginatedList.map(p => (
                                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg p-1">
                                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold capitalize text-slate-800">{p.name}</h4>
                                            <div className="flex gap-1 mt-1">
                                                {p.types.map(t => (
                                                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-600">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setIsEditing(p.id); setFormData(p); setIsAdding(false); }} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setDeleteTarget(p)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 bg-slate-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>Rows per page:</span>
                                <select 
                                    value={itemsPerPage} 
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                    className="border rounded px-1 py-1"
                                >
                                    {pageOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                                <div className="flex gap-1">
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)} className="p-2 border rounded bg-white disabled:opacity-30"><ChevronsLeft className="w-4 h-4" /></button>
                                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 border rounded bg-white disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 border rounded bg-white disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} className="p-2 border rounded bg-white disabled:opacity-30"><ChevronsRight className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Sidebar */}
                <AnimatePresence>
                    {(isEditing || isAdding) && (
                        <motion.aside 
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="w-full lg:w-96 sticky top-24 h-fit"
                        >
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-lg">{isAdding ? 'New Pokémon' : 'Edit Details'}</h2>
                                    <button onClick={() => { setIsEditing(null); setIsAdding(false); }} className="text-slate-400 hover:text-slate-600"><X /></button>
                                </div>
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Name</label>
                                        <input 
                                            className={`w-full p-2 border rounded-lg outline-none focus:ring-2 ${formErrors.name ? 'border-red-500 focus:ring-red-200' : 'focus:ring-blue-100'}`}
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                                        <input 
                                            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
                                            value={formData.imageUrl}
                                            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {isAdding ? 'Create Entry' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </main>

            {/* Modals & Notifications (Banners) can be kept as per your existing JSX */}
        </div>
    );
};