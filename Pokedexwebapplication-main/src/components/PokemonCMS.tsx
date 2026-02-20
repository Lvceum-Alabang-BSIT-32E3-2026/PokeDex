import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Save, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setLoading(true);
    // For CMS, let's just fetch the first page or a mock list to manage
    const data = await pokemonService.getList(0, 50);
    setPokemonList(data);
    setLoading(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this Pokemon?')) {
      setPokemonList(prev => prev.filter(p => p.id !== id));
    }
  };

  const startEdit = (p: Pokemon) => {
    setIsEditing(p.id);
    setFormData({ ...p });
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      name: '',
      types: [],
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    });
  };

  const resetForm = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({ name: '', types: [], image: '' });
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAdding) {
      setIsSaving(true);
      try {
        const created = await pokemonService.createPokemon({
          name: formData.name || 'Unknown',
          types: formData.types || ['normal'],
          image: formData.image || '',
        });
        setPokemonList(prev => [created, ...prev]);
        resetForm();
        showSuccess('Pokemon added successfully!');
      } catch (err: any) {
        showError(err.message || 'Failed to add Pokemon. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else if (isEditing) {
      setPokemonList(prev => prev.map(p => p.id === isEditing ? { ...p, ...formData } as Pokemon : p));
      resetForm();
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
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Pokemon
          </button>
        </div>
      </header>

      {/* Success Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-7xl mx-auto px-4 pt-4"
          >
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3 flex items-center gap-2 font-medium">
              <Save className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-7xl mx-auto px-4 pt-4"
          >
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 flex items-center gap-2 font-medium">
              <X className="w-4 h-4 text-red-600" />
              {errorMessage}
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
                      onClick={() => handleDelete(p.id)}
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type (comma separated)</label>
                    <input
                      type="text"
                      value={formData.types?.join(', ')}
                      onChange={e => setFormData({ ...formData, types: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
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
