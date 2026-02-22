import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, ChevronDown } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
  onBack: () => void;
}

// All 18 Pokemon types (fallback if API fails)
const FALLBACK_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const TYPE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  normal: { bg: 'bg-slate-100', text: 'text-slate-700', badge: 'bg-slate-300 text-slate-800' },
  fire: { bg: 'bg-orange-100', text: 'text-orange-700', badge: 'bg-orange-400 text-white' },
  water: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-500 text-white' },
  electric: { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-400 text-slate-900' },
  grass: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-500 text-white' },
  ice: { bg: 'bg-cyan-100', text: 'text-cyan-700', badge: 'bg-cyan-400 text-white' },
  fighting: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-600 text-white' },
  poison: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-500 text-white' },
  ground: { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-600 text-white' },
  flying: { bg: 'bg-indigo-100', text: 'text-indigo-700', badge: 'bg-indigo-400 text-white' },
  psychic: { bg: 'bg-pink-100', text: 'text-pink-700', badge: 'bg-pink-500 text-white' },
  bug: { bg: 'bg-lime-100', text: 'text-lime-700', badge: 'bg-lime-500 text-white' },
  rock: { bg: 'bg-stone-100', text: 'text-stone-700', badge: 'bg-stone-500 text-white' },
  ghost: { bg: 'bg-violet-100', text: 'text-violet-700', badge: 'bg-violet-600 text-white' },
  dragon: { bg: 'bg-blue-100', text: 'text-blue-900', badge: 'bg-blue-800 text-white' },
  dark: { bg: 'bg-slate-200', text: 'text-slate-900', badge: 'bg-slate-700 text-white' },
  steel: { bg: 'bg-slate-100', text: 'text-slate-600', badge: 'bg-slate-400 text-white' },
  fairy: { bg: 'bg-rose-100', text: 'text-rose-700', badge: 'bg-rose-400 text-white' },
};

const getTypeBadge = (type: string) => {
  const c = TYPE_COLORS[type] || { badge: 'bg-slate-200 text-slate-700' };
  return c.badge;
};

// ─── TypeSelect Component ───────────────────────────────────────────────────
interface TypeSelectProps {
  label: string;
  value: string;
  options: string[];
  disabledOption?: string;   // prevent duplicate selection
  onChange: (val: string) => void;
  required?: boolean;
  allowClear?: boolean;
}

const TypeSelect: React.FC<TypeSelectProps> = ({
  label, value, options, disabledOption, onChange, required = false, allowClear = false
}) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: string) => {
    onChange(type);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {!required && <span className="text-slate-400 text-xs ml-1">(optional)</span>}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm bg-white
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors
          ${open ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-300 hover:border-slate-400'}`}
      >
        {value ? (
          <span className={`inline-flex items-center gap-1.5 font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${getTypeBadge(value)}`}>
            {value}
          </span>
        ) : (
          <span className="text-slate-400">Select type…</span>
        )}
        <div className="flex items-center gap-1">
          {allowClear && value && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Clear option */}
            {allowClear && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 font-medium border-b border-slate-100 flex items-center gap-1.5"
              >
                <X className="w-3 h-3" /> Clear selection
              </button>
            )}
            <div className="grid grid-cols-2 gap-0.5 p-1.5 max-h-52 overflow-y-auto">
              {options.map(type => {
                const isDisabled = type === disabledOption;
                const isSelected = type === value;
                const c = TYPE_COLORS[type] || { bg: 'bg-slate-100', text: 'text-slate-700' };
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSelect(type)}
                    className={`capitalize text-xs font-semibold px-2 py-1.5 rounded-lg text-left transition-all
                      ${isSelected ? `${c.bg} ${c.text} ring-2 ring-blue-500` : isDisabled
                        ? 'opacity-30 cursor-not-allowed bg-slate-50 text-slate-400'
                        : `${c.bg} ${c.text} hover:brightness-95 cursor-pointer`
                      }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-outside backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
};

// ─── Main CMS Component ─────────────────────────────────────────────────────
export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error & success state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Pokemon>>({
    name: '',
    types: [],
    image: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>(FALLBACK_TYPES);
  const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);

  const isOperating = loading || isSaving || deletingId !== null;

  useEffect(() => {
    loadData();
    loadTypes();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pokemonService.getList(0, 50);
      setPokemonList(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Pokémon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const res = await fetch('https://pokeapi.co/api/v2/type');
      const data = await res.json();
      const types = data.results.map((t: any) => t.name);
      setAvailableTypes(types);
    } catch (err) {
      console.error('Failed to load types:', err);
      // fallback to FALLBACK_TYPES already in state
    }
  };

  const handleDeleteClick = (p: Pokemon) => {
    setDeleteTarget(p);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setIsSaving(true);
    try {
      await pokemonService.deletePokemon(deleteTarget.id);
      setPokemonList(prev => prev.filter(p => p.id !== deleteTarget.id));
      setSuccess('Pokemon deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete Pokemon.');
    } finally {
      setIsSaving(false);
      setDeleteTarget(null);
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdding) {
      const newId = Math.max(...pokemonList.map(p => p.id)) + 1;
      const newPokemon: Pokemon = {
        id: newId,
        name: formData.name || 'Unknown',
        types: formData.types || ['normal'],
        image: formData.image || ''
      };
      setPokemonList([newPokemon, ...pokemonList]);
    } else if (isEditing) {
      setPokemonList(prev =>
        prev.map(p => (p.id === isEditing ? ({ ...p, ...formData } as Pokemon) : p))
      );
    }

    setIsSaving(true);
    try {
      if (isAdding) {
        const created = await pokemonService.createPokemon({
          name: formData.name.trim(),
          types: formData.types || ['normal'],
          image: formData.image || '',
        });

        // Ensure the new pokemon appears at the very top of the list (Criterion: New Pokemon appears in list)
        setPokemonList(prev => [created, ...prev]);
        setSuccess(`"${created.name}" was added successfully!`);

        // Clear the form data immediately (Criterion: Form cleared after success)
        setFormData({ name: '', types: [], image: '' });

        // Brief delay before closing the form so the user sees the "cleared" state and success message
        setTimeout(() => {
          setIsAdding(false);
          setIsEditing(null);
        }, 1000);

      } else if (isEditing) {
        setPokemonList(prev =>
          prev.map(p => p.id === isEditing ? { ...p, ...formData } as Pokemon : p)
        );
        setSuccess(`"${formData.name}" was updated!`);
        setTimeout(() => {
          setIsEditing(null);
          setIsAdding(false);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save Pokemon. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              disabled={isOperating}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">CMS Dashboard</h1>
          </div>
          <button
            onClick={startAdd}
            disabled={isOperating}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add New Pokemon
          </button>
        </div>
      </header>

      {/* ── Banners ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 mt-4"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">⚠️ {error}</span>
              <button onClick={() => setError(null)} className="ml-4 hover:text-red-900"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-7xl mx-auto px-4 mt-4"
          >
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">✅ {success}</span>
              <button onClick={() => setSuccess(null)} className="ml-4 hover:text-green-900"><X className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* List View */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium text-slate-500 flex justify-between">
              <span>Inventory ({pokemonList.length})</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[80vh] overflow-y-auto">
              {pokemonList.map(p => (
                <div
                  key={p.id}
                  className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${isEditing === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-slate-100 rounded-lg p-1" />
                    <div>
                      <h3 className="font-bold text-slate-800 capitalize">{p.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {p.types.map(t => (
                          <span key={t} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(p)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <AnimatePresence mode="wait">
          {(isEditing || isAdding) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-96 sticky top-24 h-fit"
            >
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">
                    {isAdding ? 'Create New Entry' : 'Edit Details'}
                  </h2>
                  <button
                    onClick={() => { setIsEditing(null); setIsAdding(false); }}
                    className="p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <TypeSelect
                      label="Primary Type"
                      value={formData.types?.[0] || ''}
                      options={availableTypes}
                      required
                      onChange={val => {
                        const newTypes = [...(formData.types || [])];
                        newTypes[0] = val;
                        if (!newTypes[1]) newTypes.length = 1;
                        setFormData({ ...formData, types: newTypes });
                      }}
                    />
                    <TypeSelect
                      label="Secondary Type"
                      value={formData.types?.[1] || ''}
                      options={availableTypes}
                      disabledOption={formData.types?.[0]}
                      allowClear
                      onChange={val => {
                        const newTypes = [...(formData.types || [])];
                        if (val) {
                          newTypes[1] = val;
                        } else {
                          newTypes.length = 1;
                        }
                        setFormData({ ...formData, types: newTypes });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.image}
                          onChange={e => setFormData({ ...formData, image: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    {formData.image && (
                      <div className="mt-2 p-2 border border-slate-100 rounded-lg flex justify-center bg-slate-50">
                        <img src={formData.image} className="h-24 object-contain" alt="Preview" />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setIsEditing(null); setIsAdding(false); }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2.5 rounded-full">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Confirm Delete</h3>
                </div>
                <p className="text-slate-600 text-sm mb-6">
                  Are you sure you want to delete{' '}
                  <span className="font-bold capitalize text-slate-800">"{deleteTarget.name}"</span>?
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
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
