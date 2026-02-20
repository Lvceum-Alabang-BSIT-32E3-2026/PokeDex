import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, Loader2 } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
  onBack: () => void;
}

export const PokemonCMS: React.FC<PokemonCMSProps> = ({ onBack }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Pokemon>>({
    name: '',
    types: [],
    image: ''
  });

  const isOperating = loading || isSaving || deletingId !== null;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await pokemonService.getList(0, 50);
      setPokemonList(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Pokemon?')) return;
    setDeletingId(id);
    try {
      // Simulate async delete (replace with real API call if available)
      await new Promise(resolve => setTimeout(resolve, 600));
      setPokemonList(prev => prev.filter(p => p.id !== id));
      if (isEditing === id) {
        setIsEditing(null);
      }
    } finally {
      setDeletingId(null);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Simulate async save (replace with real API call if available)
      await new Promise(resolve => setTimeout(resolve, 700));

      if (isAdding) {
        const newId = pokemonList.length > 0 ? Math.max(...pokemonList.map(p => p.id)) + 1 : 1;
        const newPokemon: Pokemon = {
          id: newId,
          name: formData.name || 'Unknown',
          types: formData.types || ['normal'],
          image: formData.image || ''
        };
        setPokemonList([newPokemon, ...pokemonList]);
      } else if (isEditing) {
        setPokemonList(prev =>
          prev.map(p => (p.id === isEditing ? { ...p, ...formData } as Pokemon : p))
        );
      }

      setIsAdding(false);
      setIsEditing(null);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (isSaving) return;
    setIsEditing(null);
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
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

      <main className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* List View */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-medium text-slate-500 flex justify-between items-center">
              <span>Inventory ({pokemonList.length})</span>
              {loading && (
                <span className="flex items-center gap-2 text-blue-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-[80vh] overflow-y-auto">
              {/* Loading Spinner for List */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  <p className="text-slate-500 text-sm font-medium">Loading Pokémon...</p>
                </div>
              ) : pokemonList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  No Pokémon found. Add one to get started!
                </div>
              ) : (
                pokemonList.map(p => (
                  <div
                    key={p.id}
                    className={`p-4 flex items-center justify-between transition-colors ${
                      isEditing === p.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 object-contain bg-slate-100 rounded-lg p-1"
                      />
                      <div>
                        <h3 className="font-bold text-slate-800 capitalize">{p.name}</h3>
                        <div className="flex gap-1 mt-1">
                          {p.types.map(t => (
                            <span
                              key={t}
                              className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => startEdit(p)}
                        disabled={isOperating}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {/* Delete Button with per-row spinner */}
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={isOperating}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
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
              className="w-96 sticky top-24 h-fit"
            >
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800">
                    {isAdding ? 'Create New Entry' : 'Edit Details'}
                  </h2>
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
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
                      disabled={isSaving}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.types?.join(', ')}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          types: e.target.value.split(',').map(s => s.trim())
                        })
                      }
                      disabled={isSaving}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
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
                          disabled={isSaving}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
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
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
