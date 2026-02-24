import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit2, Save, X, ArrowLeft,
  ChevronDown, Loader2, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';

import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokemonCMSProps {
  onBack: () => void;
}

export const PokemonCMS = ({ onBack }: PokemonCMSProps) => {

  /* ---------------- STATE ---------------- */

  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Pokemon>>({
    name: '',
    types: [],
    image: ''
  });

  const [formErrors, setFormErrors] = useState<{ name?: string; types?: string }>({});
  const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  /* ---------------- PAGINATION ---------------- */

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    const errors: { name?: string; types?: string } = {};

    if (!formData.name?.trim())
      errors.name = 'Name required';

    if (!formData.types || formData.types.length === 0)
      errors.types = 'At least one type required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormInvalid =
    !formData.name?.trim() ||
    !formData.types ||
    formData.types.length === 0;

  /* ---------------- LOAD DATA ---------------- */

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const offset = (currentPage - 1) * pageSize;
      const data = await pokemonService.getList(offset, pageSize);
      setPokemonList(data);

      // if backend later returns totalCount replace this
      setTotalCount(151);

    } catch (err: any) {
      setError(err?.message || 'Failed to load Pokémon.');
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
    } catch {
      console.error('Failed to load types');
    }
  };

  /* ---------------- CRUD ---------------- */

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      if (isAdding) {
        const created = await pokemonService.createPokemon({
          name: formData.name!.trim(),
          types: formData.types!,
          image: formData.image || ''
        });

        setPokemonList(prev => [created, ...prev]);
        setSuccess(`"${created.name}" added`);
      }
      else if (isEditing !== null) {
        const updated = await pokemonService.updatePokemon(isEditing, formData);

        setPokemonList(prev =>
          prev.map(p => p.id === isEditing ? updated : p)
        );

        setSuccess(`"${updated.name}" updated`);
      }

      setIsAdding(false);
      setIsEditing(null);

    } catch (err: any) {
      setError(err?.message || 'Save failed');
    }
    finally {
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
    }
    catch (err: any) {
      setError(err?.message || 'Delete failed.');
    }
    finally {
      setIsSaving(false);
      setDeleteTarget(null);
    }
  };

  /* ---------------- PAGINATION CALC ---------------- */

  const totalPages = Math.ceil(totalCount / pageSize);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-7xl mx-auto px-4 py-8 flex gap-8">

        {/* LIST */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

            <div className="p-4 bg-slate-50 border-b flex justify-between">
              <span className="font-medium text-slate-600">
                Pokemon Inventory
              </span>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
            </div>

            <div className="divide-y min-h-[400px]">

              {pokemonList.map(p => (
                <div key={p.id} className="p-4 flex justify-between items-center">

                  <div className="flex gap-4 items-center">
                    <img src={p.image} className="w-12 h-12" />
                    <div>
                      <div className="font-bold capitalize">{p.name}</div>
                      <div className="flex gap-1">
                        {p.types.map(t =>
                          <span key={t} className="text-xs bg-slate-200 px-1 rounded">
                            {t}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditing(p.id); setFormData(p); }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => setDeleteTarget(p)}>
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              ))}

            </div>

            {/* PAGINATION */}
            <div className="p-4 flex justify-between bg-slate-50 border-t">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft />
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight />
              </button>

            </div>

          </div>
        </div>

      </main>

    </div>
  );
};