// src/components/Pokedex.tsx
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
    Search,
    LogOut,
    Filter,
    Settings,
    Lightbulb,
    User,
    AlertCircle
} from 'lucide-react';
import { PokemonCard } from './PokemonCard';
import { PokemonDetail } from './PokemonDetail';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { captureService } from '../services/captureService';

export const Pokedex: React.FC = () => {
    const { isAdmin, user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedGen, setSelectedGen] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');

    const [offset, setOffset] = useState(0);
    const limit = 24;

    const [captured, setCaptured] = useState<Set<number>>(new Set());
    const [captureError, setCaptureError] = useState<string | null>(null);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (!isAuthenticated) {
            setCaptured(new Set());
            return;
        }

        const loadCaptured = async () => {
            try {
                const ids = await captureService.list();
                if (isMounted) {
                    setCaptured(new Set(ids));
                    setCaptureError(null);
                }
            } catch (error) {
                console.error('Failed to load captured Pokémon:', error);
                if (isMounted) {
                    setCaptureError('Failed to sync captures. Please try again later.');
                }
            }
        };

        loadCaptured();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated]);

    const toggleCapture = async (id: number) => {
        if (!isAuthenticated) {
            setCaptureError('Please log in to capture Pokémon.');
            return;
        }

        const wasCaptured = captured.has(id);

        setCaptured((prev) => {
            const updated = new Set(prev);
            if (wasCaptured) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });

        try {
            if (wasCaptured) {
                await captureService.release(id);
            } else {
                await captureService.capture(id);
            }
            setCaptureError(null);
        } catch (error) {
            console.error('Failed to toggle capture:', error);
            setCaptured((prev) => {
                const updated = new Set(prev);
                if (wasCaptured) {
                    updated.add(id);
                } else {
                    updated.delete(id);
                }
                return updated;
            });
            setCaptureError('Failed to update capture status. Please try again.');
        }
    };

    const filteredPokemon = pokemon;

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

                setPokemon(response.items);
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* HEADER */}
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-white hidden sm:block">Pokedex</h1>

                        <div className="flex items-center gap-2">
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
                                    {user?.email || 'Profile'}
                                </span>
                            </button>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {captureError && (
                    <div className="mb-6">
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                            {captureError}
                        </div>
                    </div>
                )}
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
                ) : (
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
