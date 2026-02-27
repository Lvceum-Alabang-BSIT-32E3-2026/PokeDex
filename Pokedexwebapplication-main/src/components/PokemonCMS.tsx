import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, X, Save, Edit2, Trash2, 
  ChevronDown, ChevronLeft, ChevronRight, 
  Search, Loader2 
} from 'lucide-react';
import { useParams, Link } from "react-router-dom";
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../contexts/AuthContext';

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
  const { isAdmin } = useAuth();
  
  // Data States
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form States
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);
  const [formData, setFormData] = useState<Partial<Pokemon>>({
    name: '',
    types: [],
    imageUrl: ''
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isOperating = loading || isSaving;

  // ── Data Loading ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetching a larger set to allow the client-side search/filter requested in dev-frontend
      const data = await pokemonService.getList(0, 500);
      setPokemonList(data.items || data); 
    } catch (err: any) {
      setError(err?.message || 'Failed to load Pokémon.');
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
      } catch (e) { console.error("Types fetch failed", e); }
    };
    loadTypes();
  }, [loadData]);

  // ── Logic: Filter & Pagination ──
  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return pokemonList;
    return pokemonList.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.types.some(t => t.toLowerCase().includes(term))
    );
  }, [searchTerm, pokemonList]);

  const totalPages = Math.ceil(filteredList.length / pageSize);
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── Handlers ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.types?.length) {
      setError("Name and at least one type are required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      if (isAdding) {
        const created = await pokemonService.createPokemon({
          name: formData.name.trim(),
          types: formData.types,
          imageUrl: formData.imageUrl || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        });
        setPokemonList(prev => [created, ...prev]);
        setSuccess('Pokémon created!');
      } else if (isEditing !== null) {
        const updated = await pokemonService.updatePokemon(isEditing, formData);
        setPokemonList(prev => prev.map(p => p.id === isEditing ? updated : p));
        setSuccess('Pokémon updated!');
      }
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
      setPokemonList(prev => prev.filter(p => p.id !== deleteTarget.id));
      setSuccess('Deleted successfully.');
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err?.message || 'Delete failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <h1 className="text-xl font-bold hidden md:block">Pokémon CMS</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search..." 
                className="bg-slate-800 border-none rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
              />
            </div>
            <button 
              onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ name: '', types: [], imageUrl: '' }); }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add New
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {/* Status Banners */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between">
                <span>{error}</span>
                <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                  <p>Loading Pokedex...</p>
                </div>
              ) : paginatedList.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={p.imageUrl || p.image} alt={p.name} className="w-12 h-12 object-contain" />
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
                    <button onClick={() => { setIsEditing(p.id); setFormData(p); setIsAdding(false); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">Page {currentPage} of {totalPages || 1}</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-white border rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-white border rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Side Panel */}
        <AnimatePresence>
          {(isEditing || isAdding) && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full lg:w-96">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-24">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">{isAdding ? 'Add Pokémon' : 'Edit Pokémon'}</h2>
                  <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Image URL</label>
                    <input type="text" value={formData.imageUrl || formData.image} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Types (Max 2)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTypes.slice(0, 18).map(type => (
                        <button key={type} type="button" onClick={() => {
                          const current = formData.types || [];
                          const updated = current.includes(type) ? current.filter(t => t !== type) : current.length < 2 ? [...current, type] : [current[1], type];
                          setFormData({ ...formData, types: updated });
                        }} className={`py-1.5 rounded-md text-[10px] font-bold uppercase transition-all border-2 ${formData.types?.includes(type) ? `${TYPE_COLORS[type]} border-transparent text-white` : 'bg-white border-slate-100 text-slate-400'}`}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="text-lg font-bold mb-2">Delete {deleteTarget.name}?</h3>
                <p className="text-slate-500 text-sm mb-6">This will permanently remove this Pokémon from the database.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold">Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};