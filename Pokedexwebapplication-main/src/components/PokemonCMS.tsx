import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
    onBack: () => void;
}

const FALLBACK_TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {
    // ── Basic States ──
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    
    // ── Status States ──
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // ── Pagination State ──
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // ── Form & Data States ──
    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        types: [],
        image: ''
    });
    const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);

    const isOperating = loading || isSaving;

    // ── Data Loading Logic ──
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

    // ── Helper Functions ──
    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
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

    // ── CRUD Operations ──
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setIsSaving(true);
        setError(null);

        try {
            if (isAdding) {
                const created = await pokemonService.createPokemon({
                    name: formData.name.trim(),
                    types: formData.types || ['normal'],
                    image: formData.image || '',
                });
                showSuccess(`"${created.name}" added successfully!`);
            } else if (isEditing !== null) {
                const updated = await pokemonService.updatePokemon(isEditing, formData);
                showSuccess(`"${updated.name}" updated successfully!`);
            }
            
            setIsAdding(false);
            setIsEditing(null);
            await loadData(); // Refresh list to reflect changes and pagination
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
            showSuccess('Deleted successfully!');
            await loadData();
        } catch (err: any) {
            setError(err?.message || 'Delete failed.');
        } finally {
            setIsSaving(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header section... */}
            
            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Inventory List Section */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium flex justify-between items-center">
                            <span className="text-slate-600">Pokémon Inventory</span>
                            <button 
                                onClick={startAdd}
                                className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add New
                            </button>
                        </div>

                        <div className="relative min-h-[400px]">
                            {loading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                                    <p className="text-slate-400 font-medium">Syncing with PokeData...</p>
                                </div>
                            ) : null}

                            <div className="divide-y divide-slate-100">
                                {pokemonList.map(p => (
                                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image} alt={p.name} className="w-12 h-12 object-contain" />
                                            <div>
                                                <h4 className="font-bold capitalize text-slate-800">{p.name}</h4>
                                                <div className="flex gap-1 mt-1">
                                                    {p.types.map(t => (
                                                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase font-bold">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteTarget(p)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Page <span className="font-bold text-slate-800">{currentPage}</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage === 1 || loading}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-2 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={loading || pokemonList.length < pageSize}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Panel would go here... */}
            </main>

            {/* Delete Modal Logic from dev-frontend... */}
            <AnimatePresence>
                {deleteTarget && (
                    /* Modal JSX as seen in the dev-frontend branch */
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                         <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl">
                            <h3 className="text-lg font-bold mb-2">Delete {deleteTarget.name}?</h3>
                            <p className="text-slate-500 text-sm mb-6">This action is permanent and will remove the entry from the database.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                                <button onClick={confirmDelete} disabled={isSaving} className="flex-1 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50">
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