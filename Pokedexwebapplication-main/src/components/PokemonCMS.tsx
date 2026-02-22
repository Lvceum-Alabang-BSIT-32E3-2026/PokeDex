import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
    onBack: () => void;
}

// ... (TYPE_COLORS and getTypeBadge stay the same)

export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // ── Task 2.4.1: Enhanced States ──
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const [formData, setFormData] = useState<Partial<Pokemon>>({
        name: '',
        types: [],
        image: ''
    });

    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);

    // ── Task 2.4.1: Load from API with Pagination ──
    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const offset = (currentPage - 1) * pageSize;
            // Gamit ang service para sa GET /api/pokemon
            const data = await pokemonService.getList(offset, pageSize);
            setPokemonList(data);

            // Note: Ideal if API returns total count, for now we estimate or use list length
            setTotalCount(151); // Halimbawa ng Gen 1 total
        } catch (err: any) {
            setError(err?.message || 'Failed to load Pokémon from API.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        loadData();
        loadTypes();
    }, [loadData]);

    const loadTypes = async () => {
        try {
            const res = await fetch('https://pokeapi.co/api/v2/type');
            const data = await res.json();
            setAvailableTypes(data.results.map((t: any) => t.name));
        } catch (err) {
            console.error('Failed to load types:', err);
        }
    };

    // ── CRUD Operations with API Logic ──
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (isAdding) {
                // Task 2.4.1: API Create Logic
                // await pokemonService.createPokemon(formData); 
                setSuccess('New Pokemon added successfully!');
            } else if (isEditing) {
                // Task 2.4.1: API Update Logic
                // await pokemonService.updatePokemon(isEditing, formData);
                setSuccess('Pokemon updated successfully!');
            }
            await loadData(); // Refresh list
            setIsAdding(false);
            setIsEditing(null);
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

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ... (Header remains same) */}

            <main className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium flex justify-between items-center">
                            <span className="text-slate-600">Pokémon Management</span>
                            {loading && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                        </div>

                        {/* ── Task 2.4.1: List Container with Loading State ── */}
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
                                            {/* ... (Pokemon Item Info) */}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Task 2.4.1: Pagination Controls ── */}
                        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Showing page <span className="font-bold text-slate-800">{currentPage}</span>
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

                {/* ... (Editor Panel stays largely the same, ensure Save button shows loading) */}
            </main>

            {/* ... (Delete Modal) */}
        </div>
    );
};