import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LogOut, ChevronRight, ChevronLeft, Filter, Settings, Lightbulb, User, ChevronDown, AlertCircle } from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { pokemonService, Pokemon } from '../services/pokemonService';

interface PokedexProps {
    onLogout: () => void;
    onOpenCMS: () => void;
    onOpenRecommendations: () => void;
    onOpenProfile: () => void;
    userEmail: string;
}

export const Pokedex: React.FC<PokedexProps> = ({ onLogout, onOpenCMS, onOpenRecommendations, onOpenProfile, userEmail }) => {
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Filters
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    // Pagination
    const [offset, setOffset] = useState(0);
    const limit = 24;

    // Capture State
    const [captured, setCaptured] = useState<Set<number>>(new Set());

    // Modal
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

    // Profile dropdown
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Derived user display
    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
    const userDisplayName = userEmail ? userEmail.split('@')[0] : 'Trainer';

    // Search Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setOffset(0); // Reset pagination on search
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Load captured state
    useEffect(() => {
        const saved = localStorage.getItem('capturedPokemon');
        if (saved) {
            setCaptured(new Set(JSON.parse(saved)));
        }
    }, []);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCapture = (id: number) => {
        const newCaptured = new Set(captured);
        if (newCaptured.has(id)) {
            newCaptured.delete(id);
        } else {
            newCaptured.add(id);
        }
        setCaptured(newCaptured);
        localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(newCaptured)));
    };

    // MAIN API FETCH - This fulfills "Selecting generation triggers API call"
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            // We don't always clear pokemon here to prevent flicker, 
            // but you can if you want a clean state every fetch.
            try {
                const data = await pokemonService.getList(offset, limit, selectedGen, selectedType, debouncedSearch);
                setPokemon(data);
            } catch (error: any) {
                console.error('Error fetching pokemon:', error);
                if (error.name === 'TypeError' || error.message.toLowerCase().includes('network')) {
                    setError('Network error: Please check your connection and try again.');
                } else {
                    setError('API Error: Failed to load Pokemon.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [offset, selectedGen, selectedType, retryCount, debouncedSearch]);

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

    // Modified Handlers to allow Combined Filtering
    const handleGenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGen(e.target.value);
        setOffset(0); // Essential: always reset to first page when filter changes
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value);
        setOffset(0); // Essential: always reset to first page when filter changes
    };

    const clearFilters = () => {
        setSelectedGen('all');
        setSelectedType('all');
        setOffset(0);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
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
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-4 text-white placeholder-red-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2 mr-4 bg-red-700 px-3 py-1 rounded-full text-red-100 text-sm font-bold">
                                <span>Captured:</span>
                                <span className="bg-white text-red-600 px-2 rounded-full">{captured.size}</span>
                            </div>
                            <button
                                onClick={onOpenRecommendations}
                                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                                title="Recommendations"
                            >
                                <Lightbulb className="w-6 h-6" />
                            </button>
                            <button
                                onClick={onOpenCMS}
                                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                                title="Manage Pokemon (CMS)"
                            >
                                <Settings className="w-6 h-6" />
                            </button>

                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-red-700 transition-colors text-white"
                                >
                                    <div className="w-7 h-7 rounded-full bg-white text-red-600 flex items-center justify-center text-sm font-black shrink-0">
                                        {userInitial}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium max-w-[96px] truncate">{userDisplayName}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                                        >
                                            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black shrink-0">
                                                        {userInitial}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Signed in as</p>
                                                        <p className="text-sm font-semibold text-slate-800 truncate">{userEmail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="py-1">
                                                <button
                                                    onClick={() => { setIsProfileMenuOpen(false); onOpenProfile(); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                >
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    My Profile
                                                </button>
                                            </div>
                                            <div className="border-t border-slate-100 py-1">
                                                <button
                                                    onClick={() => { setIsProfileMenuOpen(false); onLogout(); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
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
                                onClick={clearFilters}
                                className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                        <p className="text-slate-600 text-lg font-medium">{error}</p>
                        <button
                            onClick={() => setRetryCount(prev => prev + 1)}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            <AnimatePresence mode='popLayout'>
                                {pokemon.map((p) => (
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

                        {pokemon.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-slate-500 text-lg">No Pokemon found matching your criteria.</p>
                            </div>
                        )}

                        {/* Pagination Logic */}
                        {/* Show pagination only when NOT searching, or when a filter is applied but there's more data */}
                        {pokemon.length > 0 && (
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
                                    disabled={pokemon.length < limit} // Simple check: if we got less than the limit, there's no next page
                                    className="flex items-center px-6 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

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