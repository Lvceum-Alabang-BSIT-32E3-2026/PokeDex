import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
    onBack: () => void;
}

const FALLBACK_TYPES = ['normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];

export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    
    // States mula sa dev-frontend at Task 2.4.1
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Pagination State (Task 2.4.1)
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        types: [],
        image: ''
    });

    const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);

    const isOperating = loading || isSaving;

    // ── Load Data with Pagination Logic ──
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const offset = (currentPage - 1) * pageSize;
            const data = await pokemonService.getList(offset, pageSize);
            setPokemonList(data);
        } catch (err: any) {
            setError(err?.message || 'Failed to load Pokémon. Please try again.');
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
                setSuccess(`"${created.name}" added successfully!`);
            } else if (isEditing !== null) {
                const updated = await pokemonService.updatePokemon(isEditing, formData);
                setSuccess(`"${updated.name}" updated successfully!`);
            }
            
            await loadData(); // Refresh current page
            setIsAdding(false);
            setIsEditing(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save Pokemon.');
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
            {/* Header omitted for brevity, use your existing header code */}
            
            <main className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium flex justify-between items-center">
                            <span className="text-slate-600">Pokémon Inventory</span>
                            <button 
                                onClick={startAdd}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Pokemon
                            </button>
                        </div>

                        <div className="relative min-h-[400px]">
                            {loading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                                    <p className="text-slate-400 font-medium">Updating list...</p>
                                </div>
                            ) : null}

                            <div className="divide-y divide-slate-100">
                                {pokemonList.map(p => (
                                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image} alt={p.name} className="w-12 h-12 object-contain" />
                                            <div>
                                                <h3 className="font-bold capitalize text-slate-800">{p.name}</h3>
                                                <p className="text-xs text-slate-400">ID: #{p.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setDeleteTarget(p)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
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
                                    className="p-2 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={loading || pokemonList.length < pageSize}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-2 border rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor Panel & Modals remain the same as your dev-frontend version */}
            </main>

            {/* Delete Modal AnimatePresence code here */}
        </div>
    );
};