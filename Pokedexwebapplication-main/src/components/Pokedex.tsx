import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, LogOut, ChevronRight, ChevronLeft, Filter, Settings,
    Lightbulb, User, ChevronDown, AlertCircle, Library, X
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
    const { isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Core Data State
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    
    // Pagination
    const [offset, setOffset] = useState(0);
    const limit = 24;

    // Capture State
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);
    
    // UI State
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Derived UI values
    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
    const userDisplayName = userEmail ? userEmail.split('@')[0] : 'Trainer';

    /* ---------- DATA SYNCING ---------- */

    // Sync Captures (Local + Server)
    useEffect(() => {
        let isMounted = true;
        const saved = localStorage.getItem('capturedPokemon');
        if (saved) setCaptured(new Set(JSON.parse(saved)));

        if (isAuthenticated) {
            const loadCaptured = async () => {
                try {
                    const ids = await captureService.getCaptures();
                    if (isMounted) {
                        setCaptured(new Set(ids));
                        localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                    }
                } catch (err) {
                    console.error('Capture sync failed', err);
                    setCaptureError('Sync failed. Showing local data.');
                }
            };
            loadCaptured();
        }
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    // Fetch Pokemon List (Server-side)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const genNum = selectedGen !== 'all' ? parseInt(selectedGen) : undefined;
                const typeStr = selectedType !== 'all' ? selectedType : undefined;
                const searchStr = searchTerm.trim() || undefined;

                const response = await pokemonService.getList(offset, limit, genNum, typeStr, searchStr);
                setPokemon(response.items || response);
            } catch (err: any) {
                setError(err.message || 'Failed to load Pokemon.');
            } finally {
                setLoading(false);
            }
        };

        const debounceId = setTimeout(fetchData, 300);
        return () => clearTimeout(debounceId);
    }, [offset, selectedGen, selectedType, searchTerm, retryCount]);

    /* ---------- HANDLERS ---------- */

    const toggleCapture = async (id: number) => {
        const wasCaptured = captured.has(id);
        setCaptured(prev => {
            const next = new Set(prev);
            wasCaptured ? next.delete(id) : next.add(id);
            localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(next)));
            return next;
        });

        if (isAuthenticated) {
            try {
                wasCaptured ? await captureService.release(id) : await captureService.capture(id);
            } catch (err) {
                setCaptureError('Failed to update server.');
            }
        }
    };

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

    const generations = [
        { id: '1', name: 'Gen I (Kanto)' }, { id: '2', name: 'Gen II (Johto)' },
        { id: '3', name: 'Gen III (Hoenn)' }, { id: '4', name: 'Gen IV (Sinnoh)' },
        { id: '5', name: 'Gen V (Unova)' }, { id: '6', name: 'Gen VI (Kalos)' },
        { id: '7', name: 'Gen VII (Alola)' }, { id: '8', name: 'Gen VIII (Galar)' },
        { id: '9', name: 'Gen IX (Paldea)' },
    ];

    const types = [
        'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground',
        'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* HEADER */}
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/pokedex')}>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-800 shadow-sm">
                                <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight hidden sm:block">Pokedex</h1>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search Pokémon..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-10 text-white placeholder-red-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2 mr-2 bg-red-700 px-3 py-1 rounded-full text-red-100 text-sm font-bold cursor-pointer hover:bg-red-800" onClick={() => navigate('/collection')}>
                                <span>Captured:</span>
                                <span className="bg-white text-red-600 px-2 rounded-full">{captured.size}</span>
                            </div>

                            <ThemeToggle />

                            <button onClick={() => navigate('/recommendations')} className="p-2 text-white hover:bg-red-700 rounded-full" title="Recommendations">
                                <Lightbulb className="w-6 h-6" />
                            </button>

                            {isAdmin && (
                                <button onClick={() => navigate('/cms')} className="p-2 text-white hover:bg-red-700 rounded-full" title="CMS">
                                    <Settings className="w-6 h-6" />
                                </button>
                            )}

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileMenuRef}>
                                <button 
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-red-700 transition-colors text-white"
                                >
                                    <div className="w-7 h-7 rounded-full bg-white text-red-600 flex items-center justify-center text-sm font-black">
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
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                                        >
                                            <div className="px-4 py-3 bg-slate-50 border-b">
                                                <p className="text-xs text-slate-500 uppercase">Trainer</p>
                                                <p className="text-sm font-bold text-slate-800 truncate">{userEmail}</p>
                                            </div>
                                            <div className="py-1">
                                                <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                                    <User className="w-4 h-4" /> My Profile
                                                </button>
                                                <button onClick={() => navigate('/collection')} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                                    <Library className="w-4 h-4" /> My Collection
                                                </button>
                                            </div>
                                            <div className="border-t py-1">
                                                <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                    <LogOut className="w-4 h-4" /> Logout
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

            {/* FILTERS & CONTENT ... (Same structure as dev-frontend) */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Filters:</span>
                    </div>
                    <select value={selectedGen} onChange={handleGenChange} className="bg-slate-100 rounded-lg py-1.5 px-3 text-sm font-medium">
                        <option value="all">All Generations</option>
                        {generations.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <select value={selectedType} onChange={handleTypeChange} className="bg-slate-100 rounded-lg py-1.5 px-3 text-sm font-medium capitalize">
                        <option value="all">All Types</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {error ? (
                    <div className="text-center py-20">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">{error}</p>
                        <button onClick={() => setRetryCount(c => c + 1)} className="bg-red-600 text-white px-6 py-2 rounded-lg">Retry</button>
                    </div>
                ) : (
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
                )}

                {/* Pagination */}
                <div className="mt-12 flex justify-center space-x-4">
                    <button 
                        onClick={() => setOffset(Math.max(0, offset - limit))} 
                        disabled={offset === 0}
                        className="flex items-center px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </button>
                    <button 
                        onClick={() => setOffset(offset + limit)} 
                        className="flex items-center px-4 py-2 bg-white border rounded-lg"
                    >
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </main>

            {selectedPokemon && (
                <PokemonDetail 
                    pokemon={selectedPokemon} 
                    onClose={() => setSelectedPokemon(null)} 
                />
            )}
        </div>
    );
};