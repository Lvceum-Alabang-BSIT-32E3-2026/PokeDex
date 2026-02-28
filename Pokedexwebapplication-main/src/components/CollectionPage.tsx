import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ListFilter, RefreshCw, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { pokemonService } from '../services/pokemonService';
import { captureService } from '../services/captureService';
import { Pokemon } from '../types/pokemon';
import { ProgressBar } from './ProgressBar';

const typeColors: Record<string, string> = {
    grass: 'from-emerald-500 to-green-400',
    fire: 'from-orange-500 to-amber-400',
    water: 'from-blue-500 to-cyan-400',
    bug: 'from-lime-600 to-green-500',
    normal: 'from-slate-400 to-slate-300',
    poison: 'from-purple-500 to-fuchsia-500',
    electric: 'from-yellow-400 to-amber-300',
    ground: 'from-amber-600 to-orange-500',
    fairy: 'from-pink-400 to-rose-400',
    fighting: 'from-red-700 to-orange-600',
    psychic: 'from-pink-600 to-rose-500',
    rock: 'from-stone-500 to-amber-500',
    ghost: 'from-indigo-700 to-purple-700',
    ice: 'from-cyan-300 to-sky-300',
    dragon: 'from-indigo-600 to-blue-500',
    steel: 'from-zinc-500 to-slate-400',
    flying: 'from-sky-400 to-indigo-300',
    dark: 'from-slate-800 to-gray-700',
};

const GENERATION_NAMES: Record<number, string> = {
    1: 'Generation I — Kanto',
    2: 'Generation II — Johto',
    3: 'Generation III — Hoenn',
    4: 'Generation IV — Sinnoh',
    5: 'Generation V — Unova',
    6: 'Generation VI — Kalos',
    7: 'Generation VII — Alola',
    8: 'Generation VIII — Galar',
    9: 'Generation IX — Paldea',
};

export const CollectionPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());
    const [view, setView] = useState<'gen' | 'type'>('gen');

    // Load pokemon catalogue and captures
    useEffect(() => {
        const load = async () => {
            setError(null);
            setLoading(true);
            try {
                const [poke, captures] = await Promise.all([
                    pokemonService.getAllRaw(),
                    (async () => {
                        try {
                            const ids = await captureService.getCaptures();
                            localStorage.setItem('capturedPokemon', JSON.stringify(ids));
                            return new Set(ids);
                        } catch {
                            const cached = localStorage.getItem('capturedPokemon');
                            return cached ? new Set<number>(JSON.parse(cached)) : new Set<number>();
                        }
                    })(),
                ]);
                setAllPokemon(poke);
                setCapturedIds(captures);
            } catch (e: any) {
                setError(e?.message || 'Failed to load collection data.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const genStats = useMemo(() => {
        const grouped = allPokemon.reduce<Record<number, Pokemon[]>>((acc, p) => {
            const g = p.generation ?? 1;
            if (!acc[g]) acc[g] = [];
            acc[g].push(p);
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([gen, list]) => ({
                gen: Number(gen),
                name: GENERATION_NAMES[Number(gen)] ?? `Generation ${gen}`,
                total: list.length,
                captured: list.filter((p) => capturedIds.has(p.id)).length,
            }))
            .sort((a, b) => a.gen - b.gen);
    }, [allPokemon, capturedIds]);

    const typeStats = useMemo(() => {
        const types = Object.keys(typeColors);
        return types
            .map((type) => {
                const list = allPokemon.filter((p) => p.types.some((t) => t.toLowerCase() === type));
                return {
                    type,
                    total: list.length,
                    captured: list.filter((p) => capturedIds.has(p.id)).length,
                };
            })
            .filter((s) => s.total > 0);
    }, [allPokemon, capturedIds]);

    const totalCaptured = capturedIds.size;
    const overallPercent = allPokemon.length > 0 ? (totalCaptured / allPokemon.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <button onClick={() => navigate('/pokedex')} className="p-2 hover:bg-red-700 rounded-full" aria-label="Back to Pokedex">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold">My Collection</h1>
                    </div>
                    <div className="flex bg-red-700 rounded-lg p-1 text-white text-xs font-bold">
                        <button onClick={() => setView('gen')} className={`px-3 py-1 rounded-md transition ${view === 'gen' ? 'bg-white text-red-600' : ''}`}>
                            BY GEN
                        </button>
                        <button onClick={() => setView('type')} className={`px-3 py-1 rounded-md transition ${view === 'type' ? 'bg-white text-red-600' : ''}`}>
                            BY TYPE
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center py-24 gap-4 text-slate-600">
                        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                        <p>Syncing Pokedex...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        <span className="flex-1">{error}</span>
                        <button className="underline font-semibold" onClick={() => window.location.reload()}>Retry</button>
                    </div>
                ) : (
                    <>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-2"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-red-600" /> Overall Progress</h2>
                                <div className="px-4 py-1 bg-red-50 text-red-700 rounded-full font-bold text-sm">{totalCaptured} / {allPokemon.length}</div>
                            </div>
                            <ProgressBar percent={overallPercent} colorClass="from-red-600 to-red-400" />
                        </motion.div>

                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <ListFilter className="w-4 h-4" />
                            <span>{view === 'gen' ? 'Progress by generation' : 'Progress by primary type'}</span>
                        </div>

                        <AnimatePresence mode="wait">
                            {view === 'gen' ? (
                                <motion.div 
                                    key="gen"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid gap-4"
                                >
                                    {genStats.map((s, idx) => {
                                        const percent = s.total ? (s.captured / s.total) * 100 : 0;
                                        return (
                                            <motion.div 
                                                key={s.gen} 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-white rounded-xl border border-slate-200 p-5"
                                            >
                                                <div className="flex justify-between mb-2">
                                                    <span className="font-bold text-slate-700">{s.name}</span>
                                                    <span className="text-sm font-medium text-slate-500">{s.captured}/{s.total}</span>
                                                </div>
                                                <ProgressBar percent={percent} colorClass="from-red-500 to-orange-400" />
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="type"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {typeStats.map((s, idx) => {
                                    const percent = s.total ? (s.captured / s.total) * 100 : 0;
                                    const color = typeColors[s.type] || 'from-slate-400 to-slate-300';
                                    return (
                                        <motion.div 
                                            key={s.type} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="bg-white rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex justify-between mb-2 items-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white uppercase bg-gradient-to-r ${color}`}>
                                                    {s.type}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">{s.captured}/{s.total}</span>
                                            </div>
                                            <ProgressBar percent={percent} colorClass={color} />
                                        </motion.div>
                                    );
                                })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </main>
        </div>
    );
};