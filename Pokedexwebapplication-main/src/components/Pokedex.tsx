import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Search,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Settings,
    User,
    ChevronDown,
    AlertCircle,
    Library,
    Filter,
    Lightbulb,
} from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { pokemonService } from '../services/pokemonService';
import { captureService } from '../services/captureService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const limit = 20;

export const Pokedex: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAdmin, isAuthenticated, logout } = useAuth();

    const [items, setItems] = useState<Pokemon[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [generation, setGeneration] = useState<string>('all');
    const [type, setType] = useState<string>('all');
    const [page, setPage] = useState(1);

    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);

    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    // Load captures (local + API)
    useEffect(() => {
        const syncCaptures = async () => {
            const saved = localStorage.getItem('capturedPokemon');
            if (saved) setCaptured(new Set(JSON.parse(saved)));

            if (isAuthenticated) {
                try {
                    const ids = await captureService.getCaptures();
                    setCaptured(new Set(ids));
                    localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                } catch (err) {
                    setCaptureError('Failed to sync captures with server.');
                    console.error(err);
                }
            }
        };
        syncCaptures();
    }, [isAuthenticated]);

    // Fetch pokemon list
    useEffect(() => {
        const offset = (page - 1) * limit;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await pokemonService.getList(offset, limit, generation === 'all' ? undefined : Number(generation), type === 'all' ? undefined : type, debouncedSearch);
                setItems(data.items);
                setTotal(data.totalCount);
            } catch (err: any) {
                console.error('Error fetching pokemon:', err);
                setError(err?.message || 'Failed to load Pokémon.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, generation, type, debouncedSearch, reloadKey]);

    // Close profile menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const generations = useMemo(
        () => [
            { id: 'all', name: 'All Generations' },
            { id: '1', name: 'Gen I' },
            { id: '2', name: 'Gen II' },
            { id: '3', name: 'Gen III' },
            { id: '4', name: 'Gen IV' },
            { id: '5', name: 'Gen V' },
            { id: '6', name: 'Gen VI' },
            { id: '7', name: 'Gen VII' },
            { id: '8', name: 'Gen VIII' },
            { id: '9', name: 'Gen IX' },
        ],
        []
    );

    const types = useMemo(
        () => ['all', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy', 'normal', 'dark'],
        []
    );

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const handleToggleCapture = async (id: number) => {
        const wasCaptured = captured.has(id);
        const next = new Set(captured);
        if (wasCaptured) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setCaptured(next);
        localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(next)));

        if (isAuthenticated) {
            try {
                if (wasCaptured) await captureService.release(id);
                else await captureService.capture(id);
            } catch (err) {
                console.error(err);
                setCaptureError('Failed to sync capture.');
                // revert on error
                const revert = new Set(captured);
                setCaptured(revert);
                localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(revert)));
            }
        }
    };

    const handleLogout = () => {
        logout();
    };

    const userDisplay = user?.displayName || user?.email || 'Trainer';
    const userInitial = (userDisplay[0] || '?').toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <button className="flex items-center gap-3" onClick={() => navigate('/pokedex')}>
                            <div className="w-10 h-10 bg-white rounded-full border-4 border-slate-800 flex items-center justify-center">
                                <div className="w-3 h-3 bg-slate-800 rounded-full" />
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight hidden sm:block">Pokedex</h1>
                        </button>

                        <div className="flex-1 max-w-xl mx-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-200 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-4 text-white placeholder-red-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex items-center gap-2 mr-2 bg-red-700 px-3 py-1 rounded-full text-red-100 text-sm font-bold">
                                <span>Captured:</span>
                                <span className="bg-white text-red-600 px-2 rounded-full">{captured.size}</span>
                            </div>
                            <button onClick={() => navigate('/recommendations')} className="p-2 text-white hover:bg-red-700 rounded-full transition-colors" title="Recommendations">
                                <Lightbulb className="w-6 h-6" />
                            </button>
                            <button onClick={() => navigate('/collection')} className="p-2 text-white hover:bg-red-700 rounded-full relative" aria-label="Go to collection">
                                <Library className="w-6 h-6" />
                                {captured.size > 0 && (
                                    <span className="absolute top-0 right-0 bg-white text-red-600 text-[10px] font-bold px-1 rounded-full">
                                        {captured.size}
                                    </span>
                                )}
                            </button>
                            {isAdmin && (
                                <button onClick={() => navigate('/users')} className="p-2 text-white hover:bg-red-700 rounded-full transition-colors" title="Manage Users">
                                    <User className="w-6 h-6" />
                                </button>
                            )}
                            <ThemeToggle />

                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-2 bg-red-700 p-1 pr-3 rounded-full text-white hover:bg-red-800"
                                >
                                    <div className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center font-bold">
                                        {userInitial}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2"
                                        >
                                            <div className="px-4 py-2 text-sm text-slate-600 font-semibold">{userDisplay}</div>
                                            <button onClick={() => navigate('/profile')} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                                                <User className="w-4 h-4" /> Profile
                                            </button>
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => navigate('/cms')} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                                                        <Settings className="w-4 h-4" /> CMS
                                                    </button>
                                                    <button onClick={() => navigate('/users')} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                                                        <Settings className="w-4 h-4" /> Users
                                                    </button>
                                                </>
                                            )}
                                            <hr className="my-1 border-slate-100" />
                                            <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-white border-b border-slate-200 sticky top-16 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium">Filters:</span>
                        </div>
                        <select
                            value={generation}
                            onChange={(e) => {
                                setGeneration(e.target.value);
                                setPage(1);
                            }}
                            className="bg-slate-100 border-none rounded-lg py-1.5 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-red-500"
                        >
                            {generations.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <select
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                setPage(1);
                            }}
                            className="bg-slate-100 border-none rounded-lg py-1.5 pl-3 pr-8 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-red-500 capitalize"
                        >
                            {types.map((t) => (
                                <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
                            ))}
                        </select>
                        {(generation !== 'all' || type !== 'all') && (
                            <button onClick={() => { setGeneration('all'); setType('all'); }} className="text-xs text-red-500 hover:text-red-700 font-medium underline">Clear Filters</button>
                        )}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                                <button onClick={() => setReloadKey((k) => k + 1)} className="underline font-semibold">Retry</button>
                            </div>
                        )}
                        {captureError && (
                            <div className="text-xs text-orange-600 font-semibold">{captureError}</div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-4">
                        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 animate-pulse">Searching the wild...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            <AnimatePresence mode="popLayout">
                                {items.map((p) => (
                                    <PokemonCard
                                        key={p.id}
                                        {...p}
                                        isCaptured={captured.has(p.id)}
                                        onToggleCapture={handleToggleCapture}
                                        onClick={() => setSelectedPokemon(p)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {items.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <p className="text-slate-500 text-lg">No Pokemon found matching your criteria.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3 pt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-2 rounded-full bg-white border disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-semibold">Page {page} of {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="p-2 rounded-full bg-white border disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </>
                )}
            </main>

            <AnimatePresence>
                {selectedPokemon && (
                    <PokemonDetail
                        pokemon={selectedPokemon}
                        onClose={() => setSelectedPokemon(null)}
                        isCaptured={captured.has(selectedPokemon.id)}
                        onToggleCapture={handleToggleCapture}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
