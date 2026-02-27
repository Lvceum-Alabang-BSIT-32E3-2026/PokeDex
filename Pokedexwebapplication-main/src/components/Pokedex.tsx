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

    // Data State
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Filter/Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [offset, setOffset] = useState(0);
    const limit = 24;
    
    // UI Refs & State
    const searchInputRef = useRef<HTMLInputElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const currentHash = window.location.hash;

    // Capture State
    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);

    // UI State
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const currentHash = window.location.hash;

    // Derived User Display
    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';
    const userDisplayName = userEmail ? userEmail.split('@')[0] : 'Trainer';

    // Handle Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setOffset(0);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Sync Captures (Local + Server)
    useEffect(() => {
        let isMounted = true;

        const loadCaptures = async () => {
            const saved = localStorage.getItem('capturedPokemon');
            if (saved) setCaptured(new Set(JSON.parse(saved)));

            if (isAuthenticated) {
                try {
                    const ids = await captureService.getCaptures();
                    if (isMounted) {
                        setCaptured(new Set(ids));
                        localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                    }
                } catch (err) {
                    setCaptureError('Failed to sync captures with server.');
                }
            }
        };

        loadCaptures();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    // Fetch Pokemon List
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            setPokemon([]);
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

            try {
                const data = await pokemonService.getList(offset, limit, selectedGen, selectedType, debouncedSearch);
                setPokemon(data);
            } catch (err) {
                setError('Failed to load Pokemon.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [offset, selectedGen, selectedType, debouncedSearch, retryCount]);

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

    const toggleCapture = async (id: number) => {
        const wasCaptured = captured.has(id);
        const newCaptured = new Set(captured);
        
        if (wasCaptured) newCaptured.delete(id);
        else newCaptured.add(id);
        
        setCaptured(newCaptured);
        localStorage.setItem('capturedPokemon', JSON.stringify(Array.from(newCaptured)));

        if (isAuthenticated) {
            try {
                if (wasCaptured) await captureService.release(id);
                else await captureService.capture(id);
            } catch (err) {
                setCaptureError('Server sync failed.');
            }
        }
    };

    const generations = [
        { id: '1', name: 'Gen I' }, { id: '2', name: 'Gen II' }, { id: '3', name: 'Gen III' },
        { id: '4', name: 'Gen IV' }, { id: '5', name: 'Gen V' }, { id: '6', name: 'Gen VI' },
        { id: '7', name: 'Gen VII' }, { id: '8', name: 'Gen VIII' }, { id: '9', name: 'Gen IX' }
    ];

    const types = ['fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'steel', 'fairy'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {/* Header */}
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/pokedex')}>
                        <div className="w-10 h-10 bg-white rounded-full border-4 border-slate-800 flex items-center justify-center">
                            <div className="w-3 h-3 bg-slate-800 rounded-full animate-pulse" />
                        </div>
                        <h1 className="text-2xl font-bold text-white hidden sm:block">Pokedex</h1>
                    </div>

                    <div className="flex-1 max-w-md mx-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-red-200 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search Pokemon..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-red-700/50 border-none rounded-full py-2 pl-10 pr-4 text-white placeholder-red-300 focus:ring-2 focus:ring-white outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button onClick={onOpenCollection} className="p-2 text-white hover:bg-red-700 rounded-full relative">
                            <Library className="w-6 h-6" />
                            {captured.size > 0 && (
                                <span className="absolute top-0 right-0 bg-white text-red-600 text-[10px] font-bold px-1 rounded-full">
                                    {captured.size}
                                </span>
                            )}
                        </button>
                        
                        {/* Profile Dropdown Logic Here... */}
                        <div className="relative" ref={profileMenuRef}>
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
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
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2"
                                    >
                                        <button onClick={onOpenProfile} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Profile
                                        </button>
                                        {isAdmin && (
                                            <button onClick={onOpenCMS} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                <Settings className="w-4 h-4" /> CMS
                                            </button>
                                        )}
                                        <hr className="my-1 border-slate-100 dark:border-slate-700" />
                                        <button onClick={onLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content & Grid logic would follow here */}
            <main className="max-w-7xl mx-auto p-6">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2 mb-6">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}
                {/* ... Render Pokemon Cards ... */}
            </main>
        </div>
    );
};
