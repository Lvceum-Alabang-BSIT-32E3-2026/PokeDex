// src/components/Pokedex.tsx
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
    ChevronLeft,
    ChevronDown
} from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { pokemonService } from '../services/pokemonService';
import { captureService } from '../services/captureService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from "./ThemeToggle";

interface PokedexProps {
    onLogout: () => void;
    userEmail?: string | null;
}

export const Pokedex: React.FC<PokedexProps> = ({ onLogout, userEmail }) => {
    const { isAdmin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Data State
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Filters & Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const limit = 24;

    // Capture State
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);

    // UI State
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Derived user display
    const activeEmail = userEmail || user?.email;
    const userInitial = activeEmail ? activeEmail.charAt(0).toUpperCase() : '?';
    const userDisplayName = activeEmail ? activeEmail.split('@')[0] : 'Trainer';

    // 1. Fetch Pokemon Data (with Debounce)
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

                // Handle both raw arrays (mock) and paginated objects (API)
                setPokemon(Array.isArray(response) ? response : response.items);
            } catch (err: any) {
                console.error('Error fetching pokemon:', err);
                setError(err.message || 'Failed to load Pokemon list.');
                setPokemon([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceId = setTimeout(fetchData, 300);
        return () => clearTimeout(debounceId);
    }, [offset, selectedGen, selectedType, searchTerm, retryCount]);

    // 2. Sync Captured State (Live API + Local Storage Fallback)
    useEffect(() => {
        let isMounted = true;

        const syncCaptures = async () => {
            if (!isAuthenticated) {
                const saved = localStorage.getItem('capturedPokemon');
                if (saved) setCaptured(new Set(JSON.parse(saved)));
                return;
            }

            try {
                const ids = await captureService.getCaptures();
                if (!isMounted) return;
                setCaptured(new Set(ids));
                localStorage.setItem('capturedPokemon', JSON.stringify(ids));
            } catch (err) {
                setCaptureError('Sync failed. Showing offline data.');
            }
        };

        syncCaptures();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    // 3. Toggle Capture Logic
    const toggleCapture = async (id: number) => {
        const wasCaptured = captured.has(id);
        
        // Optimistic UI Update
        setCaptured(prev => {
            const next = new Set(prev);
            wasCaptured ? next.delete(id) : next.add(id);
            localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(next)));
            return next;
        });

        if (isAuthenticated) {
            try {
                wasCaptured ? await captureService.release(id) : await captureService.capture(id);
                setCaptureError(null);
            } catch (err) {
                setCaptureError('Failed to update server. Progress saved locally.');
            }
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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

    const types = ['fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-800">
                            <div className="w-3 h-3 bg-slate-800 rounded-full" />
                        </div>
                        <h1 className="text-2xl font-bold text-white hidden sm:block">Pokedex</h1>
                    </div>

                    <div className="flex-1 max-w-xl mx-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search Pokémon..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setOffset(0); }}
                            className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-10 text-white placeholder-red-200 focus:outline-none focus:bg-white focus:text-slate-900"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <div className="hidden md:flex bg-red-700 px-3 py-1 rounded-full text-white text-sm font-bold items-center gap-2">
                            <span>Captured:</span>
                            <span className="bg-white text-red-600 px-2 rounded-full">{captured.size}</span>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-red-700 text-white transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-white text-red-600 flex items-center justify-center font-bold">
                                    {userInitial}
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800"
                                    >
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <p className="text-xs text-slate-500">Signed in as</p>
                                            <p className="text-sm font-bold truncate">{userDisplayName}</p>
                                        </div>
                                        <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-sm">
                                            <User className="w-4 h-4" /> Profile
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => navigate('/cms')} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 text-sm">
                                                <Settings className="w-4 h-4" /> CMS Panel
                                            </button>
                                        )}
                                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 text-sm border-t border-slate-100">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-20">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                        value={selectedGen} 
                        onChange={(e) => { setSelectedGen(e.target.value); setOffset(0); }}
                        className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-1.5 text-sm"
                    >
                        <option value="all">All Generations</option>
                        {generations.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <select 
                        value={selectedType} 
                        onChange={(e) => { setSelectedType(e.target.value); setOffset(0); }}
                        className="bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-1.5 text-sm capitalize"
                    >
                        <option value="all">All Types</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Main Grid */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {captureError && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> {captureError}
                    </div>
                )}

                {loading && pokemon.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p>Loading Pokedex...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-500 mb-4">{error}</p>
                        <button onClick={() => setRetryCount(c => c + 1)} className="bg-red-600 text-white px-6 py-2 rounded-lg">Retry</button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {pokemon.map(p => (
                                <PokemonCard 
                                    key={p.id} 
                                    {...p} 
                                    isCaptured={captured.has(p.id)} 
                                    onToggleCapture={toggleCapture}
                                    onClick={() => setSelectedPokemon(p)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-12 gap-4">
                            <button 
                                disabled={offset === 0} 
                                onClick={() => setOffset(Math.max(0, offset - limit))}
                                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                                disabled={pokemon.length < limit}
                                onClick={() => setOffset(offset + limit)}
                                className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </main>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedPokemon && (
                    <PokemonDetail 
                        pokemon={selectedPokemon} 
                        onClose={() => setSelectedPokemon(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};