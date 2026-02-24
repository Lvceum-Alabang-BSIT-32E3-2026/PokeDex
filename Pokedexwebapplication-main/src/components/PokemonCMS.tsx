import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
  onBack: () => void;
}

export const PokemonCMS: React.FC<PokemonCMSProps> = ({ onBack }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState<Partial<Pokemon>>({
    name: '',
    types: [],
    image: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For CMS, let's just fetch the first page or a mock list to manage
      const data = await pokemonService.getList(0, 50);
      setPokemonList(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Pokemon inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this Pokemon?')) {
      try {
        setLoading(true);
        setError(null);
        // Simulate API call
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Randomly fail for demonstration or just succeed
            resolve(true);
          }, 300);
        });
        setPokemonList((prev: Pokemon[]) => prev.filter((p: Pokemon) => p.id !== id));
      } catch (err: any) {
        setError(err.message || 'Failed to delete Pokemon.');
      } finally {
        setLoading(false);
      }
    }
  };

  const startEdit = (p: Pokemon) => {
    setIsEditing(p.id);
    setFormData({ ...p });
    setIsAdding(false);
    setValidationErrors({});
    setError(null);
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      name: '',
      types: [],
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    });
    setValidationErrors({});
    setError(null);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.types || formData.types.length === 0 || formData.types[0] === '') {
      errors.types = 'At least one type is required';
    }
    if (!formData.image?.trim()) errors.image = 'Image URL is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      // Simulate API call and possibility of failure
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (formData.name?.toLowerCase() === 'error') {
            reject(new Error('Simulated API Error: Failed to save to database.'));
          } else {
            resolve(true);
          }
        }, 500);
      });

      if (isAdding) {
        const newId = pokemonList.length > 0 ? Math.max(...pokemonList.map((p: Pokemon) => p.id)) + 1 : 1;
        const newPokemon: Pokemon = {
          id: newId,
          name: formData.name || 'Unknown',
          types: formData.types || ['normal'],
          image: formData.image || ''
        };
        setPokemonList([newPokemon, ...pokemonList]);
      } else if (isEditing) {
        setPokemonList((prev: Pokemon[]) => prev.map((p: Pokemon) => p.id === isEditing ? { ...p, ...formData } as Pokemon : p));
      }

      setIsAdding(false);
      setIsEditing(null);
    } catch (err: any) {
      setError(err.message || 'An unexpected API error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fire: 'bg-orange-100 text-orange-800',
      water: 'bg-blue-100 text-blue-800',
      grass: 'bg-green-100 text-green-800',
      electric: 'bg-yellow-100 text-yellow-800',
      psychic: 'bg-pink-100 text-pink-800',
      normal: 'bg-slate-200 text-slate-800',
      // ... others
    };
    return colors[type] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">CMS Dashboard</h1>
          </div>
          <button
            onClick={startAdd}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add New Pokemon
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-8 items-start">
          {/* List View */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium text-slate-500 flex justify-between">
                <span>Inventory ({pokemonList.length})</span>
                {loading && <span className="text-blue-500 text-sm">Loading...</span>}
              </div>
              <div className="divide-y divide-slate-100 max-h-[80vh] overflow-y-auto">
                {pokemonList.map((p: Pokemon) => (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${isEditing === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-contain bg-slate-100 rounded-lg p-1" />
                      <div>
                        <h3 className="font-bold text-slate-800 capitalize">{p.name}</h3>
                        <div className="flex gap-1 mt-1">
                          {p.types.map((t: string) => (
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
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {pokemonList.length === 0 && !loading && (
                  <div className="p-8 text-center text-slate-500">
                    No Pokemon found. Add one to get started.
                  </div>
                )}
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
                className="w-96 sticky mx-auto top-24 h-fit"
              >
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">
                      {isAdding ? 'Create New Entry' : 'Edit Details'}
                    </h2>
                    <button
                      onClick={() => { setIsEditing(null); setIsAdding(false); setValidationErrors({}); setError(null); }}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${validationErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      />
                      {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Type (comma separated)</label>
                      <input
                        type="text"
                        value={formData.types?.join(', ')}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, types: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                        className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${validationErrors.types ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                        placeholder="e.g. fire, flying"
                      />
                      {validationErrors.types && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.types}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={formData.image}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.value })}
                            className={`w-full border rounded-lg px-3 py-2 text-xs font-mono outline-none focus:ring-2 ${validationErrors.image ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                          />
                        </div>
                      </div>
                      {validationErrors.image && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.image}</p>
                      )}
                      {formData.image && (!validationErrors.image) && (
                        <div className="mt-2 p-2 border border-slate-100 rounded-lg flex justify-center bg-slate-50">
                          <img
                            src={formData.image}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
                            }}
                            className="h-24 object-contain"
                            alt="Preview"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setIsEditing(null); setIsAdding(false); setValidationErrors({}); setError(null); }}
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
