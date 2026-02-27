// src/components/Pokedex.tsx
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
    onOpenCMS: () => void;
    onOpenRecommendations: () => void;
    onOpenProfile: () => void;
    onOpenCollection: () => void;
    userEmail: string;
}

export const Pokedex: React.FC<PokedexProps> = ({
    onLogout,
    onOpenCMS,
    onOpenRecommendations,
    onOpenProfile,
    onOpenCollection,
    userEmail
}) => {
    const { isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // State
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    // Filters & Pagination
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const limit = 24;

    // Capture State
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

    // UI State
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const currentHash = window.location.hash;

    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
    const userDisplayName = userEmail ? userEmail.split('@')[0] : 'Trainer';

    // 1. Debounce Search Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setOffset(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 2. Load Captured Status (Sync with Service)
    useEffect(() => {
        let isMounted = true;
        const loadCaptures = async () => {
            const saved = localStorage.getItem('capturedPokemon');
            if (saved) setCaptured(new Set(JSON.parse(saved)));

            if (isAuthenticated) {
                try {
                    const ids = await captureService.getCaptures();
                    if (!isMounted) return;
                    setCaptured(new Set(ids));
                    localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                } catch (err) {
                    setCaptureError('Failed to sync captures. Using offline data.');
                }
            }
        };
        loadCaptures();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    // 3. Fetch Pokemon List
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const genNum = selectedGen !== 'all' ? parseInt(selectedGen) : undefined;
                const data = await pokemonService.getList(offset, limit, genNum, selectedType, debouncedSearch);
                setPokemon(data.items || data);
            } catch (err: any) {
                setError(err.message || 'Failed to load Pokemon.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [offset, selectedGen, selectedType, debouncedSearch, retryCount]);

    // 4. Toggle Capture Logic
    const toggleCapture = async (id: number) => {
        const wasCaptured = captured.has(id);
        const updated = new Set(captured);
        
        if (wasCaptured) updated.delete(id);
        else updated.add(id);
        
        setCaptured(updated);
        localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(updated)));

        if (isAuthenticated) {
            try {
                if (wasCaptured) await captureService.release(id);
                else await captureService.capture(id);
            } catch (err) {
                setCaptureError('Sync failed. Try again later.');
            }
        }
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
        { id: '1', name: 'Gen I' }, { id: '2', name: 'Gen II' }, { id: '3', name: 'Gen III' },
        { id: '4', name: 'Gen IV' }, { id: '5', name: 'Gen V' }, { id: '6', name: 'Gen VI' },
        { id: '7', name: 'Gen VII' }, { id: '8', name: 'Gen VIII' }, { id: '9', name: 'Gen IX' },
    ];

    const types = ['fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'];

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/pokedex')}>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-800">
                            <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-10 text-white focus:bg-white focus:text-slate-900 transition-all outline-none"
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={onOpenCollection} className="p-2 text-white hover:bg-red-700 rounded-full relative">
                            <Library className="w-6 h-6" />
                            {captured.size > 0 && (
                                <span className="absolute top-0 right-0 bg-white text-red-600 text-[10px] font-bold px-1.5 rounded-full border border-red-600">
                                    {captured.size}
                                </span>
                            )}
                        </button>
                        
                        <div className="relative" ref={profileMenuRef}>
                            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-2 p-1.5 text-white hover:bg-red-700 rounded-full transition-all">
                                <div className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center font-bold">{userInitial}</div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                                {isProfileMenuOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                                        <div className="px-4 py-2 border-b border-slate-100 mb-1">
                                            <p className="text-xs text-slate-500">Trainer</p>
                                            <p className="text-sm font-bold truncate text-slate-800">{userDisplayName}</p>
                                        </div>
                                        <button onClick={onOpenProfile} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><User className="w-4 h-4" /> Profile</button>
                                        {isAdmin && <button onClick={onOpenCMS} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><Settings className="w-4 h-4" /> Admin Panel</button>}
                                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"><LogOut className="w-4 h-4" /> Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            {/* Rest of the component (Filters & Grid) remains similar to your logic */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Pokemon Grid Logic Here */}
                {loading ? <p>Loading...</p> : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
            </main>
        </div>
    );
};