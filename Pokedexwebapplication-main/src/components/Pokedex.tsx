// src/components/Pokedex.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Using framer-motion as per dev-frontend
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
    userEmail?: string | null;
}

export const Pokedex: React.FC<PokedexProps> = ({
    onLogout,
    onOpenCMS,
    onOpenRecommendations,
    onOpenProfile,
    onOpenCollection,
    userEmail
}) => {
    const { isAdmin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    // Core State
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    // Filters & Pagination
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const limit = 24;

    // Capture & UI State
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Derived Values
    const currentHash = window.location.hash;
    const effectiveEmail = userEmail || user?.email;
    const userInitial = effectiveEmail ? effectiveEmail.charAt(0).toUpperCase() : '?';
    const userDisplayName = effectiveEmail ? effectiveEmail.split('@')[0] : 'Trainer';

    // --- Effects ---

    // Sync Captured Pokemon
    useEffect(() => {
        let isMounted = true;

        const loadCaptured = async () => {
            const saved = localStorage.getItem('capturedPokemon');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setCaptured(new Set(parsed));
                } catch (e) { console.error("Parse error", e); }
            }

            if (isAuthenticated) {
                try {
                    const ids = await captureService.getCaptures();
                    if (!isMounted) return;
                    setCaptured(new Set(ids));
                    localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                } catch (err) {
                    setCaptureError('Failed to sync captures. Using local data.');
                }
            }
        };

        loadCaptured();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    // Fetch Pokemon Data with Debounce
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const genNum = selectedGen !== 'all' ? parseInt(selectedGen) : undefined;
                const typeStr = selectedType !== 'all' ? selectedType : undefined;
                
                const response = await pokemonService.getList(offset, limit, genNum, typeStr, searchTerm);
                // Handle both raw arrays and paginated response objects
                setPokemon(Array.isArray(response) ? response : response.items || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load Pokemon.');
                setPokemon([]);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchData, 400);
        return () => clearTimeout(timer);
    }, [offset, selectedGen, selectedType, searchTerm, retryCount]);

    // Handle Click Outside for Dropdown
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // --- Handlers ---

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
                setCaptureError('Cloud sync failed.');
                // Optional: Revert state if critical
            }
        }
    };

    const handleGenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGen(e.target.value);
        setOffset(0);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(e.target.value);
        setOffset(0);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* HEADER */}
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-4 border-slate-800">
                                <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight hidden sm:block">Pokedex</h1>
                        </div>

                        {/* Search */}
                        <div className="flex-1 max-w-xl mx-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search Pokémon..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-10 text-white placeholder-red-200 focus:outline-none focus:bg-white focus:text-slate-900 transition-all"
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

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            
                            <button onClick={onOpenRecommendations} className="p-2 text-white hover:bg-red-700 rounded-full transition-colors" title="Recommendations">
                                <Lightbulb className="w-6 h-6" />
                            </button>

                            {isAdmin && (
                                <button onClick={onOpenCMS} className="p-2 text-white hover:bg-red-700 rounded-full transition-colors" title="Admin CMS">
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
                                    <span className="hidden md:block text-sm font-medium">{userDisplayName}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 bg-slate-50 border-b">
                                                <p className="text-xs text-slate-500 font-bold uppercase">Trainer</p>
                                                <p className="text-sm font-semibold text-slate-800 truncate">{effectiveEmail}</p>
                                            </div>
                                            <div className="py-1">
                                                <button onClick={() => { setIsProfileMenuOpen(false); onOpenProfile(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                                    <User className="w-4 h-4" /> My Profile
                                                </button>
                                                <button onClick={() => { setIsProfileMenuOpen(false); onOpenCollection(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                                    <Library className="w-4 h-4" /> My Collection
                                                </button>
                                                <hr className="my-1 border-slate-100" />
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

            {/* Sub-Header & Filters can go here... */}
        </div>
    );
};