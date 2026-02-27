// src/components/Pokedex.tsx
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Search,
    LogOut,
    Filter,
    Settings,
    Lightbulb,
    User,
    AlertCircle,
    X,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from "./ThemeToggle";

interface PokedexProps {
  onLogout: () => void;
  userEmail?: string | null;
}

export const Pokedex: React.FC<PokedexProps> = ({ onLogout, userEmail }) => {
    const { isAdmin, user } = useAuth();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    const [offset, setOffset] = useState(0);
    const limit = 24;

    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('capturedPokemon');
        if (saved) {
            setCaptured(new Set(JSON.parse(saved)));
        }
    }, []);

    const toggleCapture = (id: number) => {
        const newCaptured = new Set(captured);
        if (newCaptured.has(id)) newCaptured.delete(id);
        else newCaptured.add(id);

        setCaptured(newCaptured);
        localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(newCaptured)));
    };

    // Client-side filtering for Search
    const filteredPokemon = pokemon.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const genNum = selectedGen !== 'all' ? parseInt(selectedGen) : undefined;
                const typeStr = selectedType !== 'all' ? selectedType : undefined;
                const searchStr = searchTerm.trim() !== '' ? searchTerm.trim() : undefined;

                const response = await pokemonService.getList(
                    offset,
                    limit,
                    genNum,
                    typeStr,
                    searchStr
                );

                setPokemon(response.items || response); // Handle array or paginated response
            } catch (err: any) {
                console.error('Error fetching pokemon:', err);
                setError(err.message || 'Failed to load Pokemon list. Please try again.');
                setPokemon([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceId = setTimeout(fetchData, 300);
        return () => clearTimeout(debounceId);
    }, [offset, selectedGen, selectedType, searchTerm, retryCount]);

    const generations = [
        { id: '1', name: 'Gen I (Kanto)' },
        { id: '2', name: 'Gen II (Johto)' },
        { id: '3', name: 'Gen III (Hoenn)' },
        { id: '4', name: 'Gen IV (Sinnoh)' },
        { id: '5', name: 'Gen V (Unova)' },
        { id: '6', name: 'Gen VI (Kalos)' },
        { id: '7', name: 'Gen VII (Alola)' },
        { id: '8', name: 'Gen VIII (Galar)' },
        { id: '9', name: 'Gen IX (Paldea)' },
    ];

    const types = [
        'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
        'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'
    ];

    const handleGenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGen(e.target.value);
        setSelectedType('all');
        setOffset(0);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value);
        setSelectedGen('all');
        setOffset(0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* HEADER */}
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-800 shadow-sm">
                            <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                          </div>
                          <h1 className="text-2xl font-bold text-white tracking-tight hidden sm:block">Pokedex</h1>
                        </div>

                        <div className="flex-1 max-w-xl mx-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                              ref={searchInputRef}
                              type="text"
                              placeholder="Search Pokémon by name..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-10 text-white placeholder-red-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
                            />
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                searchInputRef.current?.focus();
                              }}
                              title="Clear search"
                              className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-900 text-white shadow transition-all duration-150 ${searchTerm ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
                                }`}
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2 mr-4 bg-red-700 px-3 py-1 rounded-full text-red-100 text-sm font-bold">
                              <span>Captured:</span>
                              <span className="bg-white text-red-600 px-2 rounded-full">{captured.size}</span>
                            </div>

                            <ThemeToggle />

                            <button
                                onClick={() => navigate('/recommendations')}
                                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                                title="Recommendations"
                            >
                                <Lightbulb className="w-6 h-6" />
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/cms')}
                                    className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                                    title="Manage Pokemon (CMS)"
                                >
                                    <Settings className="w-6 h-6" />
                                </button>
                            )}

                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 px-3 py-1.5 text-white hover:bg-red-700 rounded-full transition-colors"
                                title="Profile"
                            >
                                <User className="w-5 h-5" />
                                <span className="text-sm font-medium hidden md:block">
                                    {userEmail || user?.email || 'Profile'}
                                </span>
                            </button>

                            <button
                                onClick={onLogout}
                                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Filters:</span>
                  </div>

                  <select
                    value={selectedGen}
                    onChange={handleGenChange}
                    className="bg-slate-100 border-none rounded-lg py-1.5 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Generations</option>
                    {generations.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="bg-slate-100 border-none rounded-lg py-1.5 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-red-500 capitalize"
                  >
                    <option value="all">All Types</option>
                    {types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  {(selectedGen !== 'all' || selectedType !== 'all') && (
                    <button
                      onClick={() => { setSelectedGen('all'); setSelectedType('all'); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {error ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-slate-600">{error}</p>
                        <button
                            onClick={() => setRetryCount((c) => c + 1)}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
                        >
                            Retry
                        </button>
                    </div>
                ) : loading && pokemon.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                      <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                      <p className="text-slate-400 animate-pulse">Searching the wild...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {filteredPokemon.map((p) => (
                                    <PokemonCard
                                        key={p.id}
                                        {...p}
                                        isCaptured={captured.has(p.id)}
                                        onToggleCapture={toggleCapture}
                                        onClick={() => setSelectedPokemon(p)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                        
                        {filteredPokemon.length === 0 && !loading && (
                          <div className="text-center py-12">
                            <p className="text-slate-500 text-lg">No Pokemon found matching your criteria.</p>
                          </div>
                        )}

                        {/* Pagination (Only show in 'All' mode) */}
                        {selectedGen === 'all' && selectedType === 'all' && searchTerm === '' && filteredPokemon.length > 0 && (
                          <div className="mt-12 flex justify-center space-x-4">
                            <button
                              onClick={() => setOffset(Math.max(0, offset - limit))}
                              disabled={offset === 0}
                              className="flex items-center px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
                            >
                              <ChevronLeft className="w-4 h-4 mr-2" />
                              Previous
                            </button>
                            <button
                              onClick={() => setOffset(offset + limit)}
                              disabled={filteredPokemon.length < limit}
                              className="flex items-center px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Next
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </button>
                          </div>
                        )}
                    </>
                )}
            </main>

            {/* DETAIL MODAL */}
            <AnimatePresence>
                {selectedPokemon && (
                    <PokemonDetail
                        pokemon={selectedPokemon}
                        onClose={() => setSelectedPokemon(null)}
                        isCaptured={captured.has(selectedPokemon.id)}
                        onToggleCapture={toggleCapture}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
export default Pokedex;
