import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, BarChart3, Layers } from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

// Type Colors from task/232
const typeColors: Record<string, string> = {
    grass: 'bg-green-500', fire: 'bg-orange-500', water: 'bg-blue-500',
    bug: 'bg-lime-600', normal: 'bg-slate-400', poison: 'bg-purple-500',
    electric: 'bg-yellow-400', ground: 'bg-amber-600', fairy: 'bg-pink-400',
    fighting: 'bg-red-700', psychic: 'bg-pink-600', rock: 'bg-stone-500',
    ghost: 'bg-indigo-700', ice: 'bg-cyan-300', dragon: 'bg-indigo-600',
    steel: 'bg-zinc-400', flying: 'bg-sky-400', dark: 'bg-slate-800'
};

const GENERATION_NAMES: Record<number, string> = {
    1: 'Generation I — Kanto', 2: 'Generation II — Johto', 3: 'Generation III — Hoenn',
    4: 'Generation IV — Sinnoh', 5: 'Generation V — Unova', 6: 'Generation VI — Kalos',
    7: 'Generation VII — Alola', 8: 'Generation VIII — Galar', 9: 'Generation IX — Paldea',
};

const GEN_COLORS: Record<number, { bar: string; badge: string }> = {
    1: { bar: 'from-red-500 to-red-400', badge: 'bg-red-100 text-red-700' },
    2: { bar: 'from-yellow-500 to-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
    3: { bar: 'from-emerald-500 to-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
    4: { bar: 'from-blue-500 to-blue-400', badge: 'bg-blue-100 text-blue-700' },
    5: { bar: 'from-slate-600 to-slate-500', badge: 'bg-slate-100 text-slate-700' },
    6: { bar: 'from-pink-500 to-pink-400', badge: 'bg-pink-100 text-pink-700' },
    7: { bar: 'from-orange-500 to-orange-400', badge: 'bg-orange-100 text-orange-700' },
    8: { bar: 'from-violet-500 to-violet-400', badge: 'bg-violet-100 text-violet-700' },
    9: { bar: 'from-teal-500 to-teal-400', badge: 'bg-teal-100 text-teal-700' },
};

interface CollectionPageProps {
    onBack: () => void;
    capturedIds: Set<number>; // Passed from App.tsx
}

const ProgressBar: React.FC<{ percent: number; colorClass: string }> = ({ percent, colorClass }) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setWidth(percent), 80);
        return () => clearTimeout(timer);
    }, [percent]);

    return (
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full bg-gradient-to-r ${colorClass.includes('from-') ? colorClass : ''} ${!colorClass.includes('from-') ? colorClass : ''} transition-all duration-700 ease-out`}
                style={{ width: `${width}%` }}
            />
        </div>
    );
};

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack, capturedIds }) => {
    const [loading, setLoading] = useState(true);
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [view, setView] = useState<'gen' | 'type'>('gen');

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await pokemonService.getAllRaw();
                setAllPokemon(data);
            } catch (err) {
                console.error("Failed to load Pokemon", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Logic for Generation Stats
    const genStats = Object.entries(
        allPokemon.reduce((acc, p) => {
            const g = p.generation ?? 1;
            if (!acc[g]) acc[g] = [];
            acc[g].push(p);
            return acc;
        }, {} as Record<number, Pokemon[]>)
    ).map(([gen, list]) => ({
        gen: Number(gen),
        name: GENERATION_NAMES[Number(gen)] ?? `Generation ${gen}`,
        total: list.length,
        captured: list.filter(p => capturedIds.has(p.id)).length
    })).sort((a, b) => a.gen - b.gen);

    // Logic for Type Stats
    const typeStats = Object.keys(typeColors).map(type => {
        const list = allPokemon.filter(p => p.types.some(t => t.toLowerCase() === type));
        return {
            type,
            total: list.length,
            captured: list.filter(p => capturedIds.has(p.id)).length
        };
    }).filter(s => s.total > 0);

    const totalCaptured = capturedIds.size;
    const overallPercent = allPokemon.length > 0 ? (totalCaptured / allPokemon.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-white">My Collection</h1>
                    </div>
                    {/* View Switcher */}
                    <div className="flex bg-red-700 rounded-lg p-1">
                        <button 
                            onClick={() => setView('gen')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition ${view === 'gen' ? 'bg-white text-red-600' : 'text-white'}`}
                        >
                            BY GEN
                        </button>
                        <button 
                            onClick={() => setView('type')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition ${view === 'type' ? 'bg-white text-red-600' : 'text-white'}`}
                        >
                            BY TYPE
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center py-24 gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
                        <p className="text-slate-500">Syncing Pokedex...</p>
                    </div>
                ) : (
                    <>
                        {/* Overall Progress */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-bold text-slate-800">Overall Progress</h2>
                                <div className="px-4 py-1 bg-red-50 text-red-700 rounded-full font-bold text-sm">
                                    {totalCaptured} / {allPokemon.length}
                                </div>
                            </div>
                            <ProgressBar percent={overallPercent} colorClass="from-red-600 to-red-400" />
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-1">
                            {view === 'gen' ? (
                                genStats.map((s) => (
                                    <div key={s.gen} className="bg-white rounded-xl border border-slate-200 p-5">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-slate-700">{s.name}</span>
                                            <span className="text-sm font-medium">{s.captured}/{s.total}</span>
                                        </div>
                                        <ProgressBar 
                                            percent={(s.captured / s.total) * 100} 
                                            colorClass={GEN_COLORS[s.gen]?.bar || 'bg-slate-500'} 
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {typeStats.map((s) => (
                                        <div key={s.type} className="bg-white rounded-xl border border-slate-200 p-4">
                                            <div className="flex justify-between mb-2 items-center">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white uppercase ${typeColors[s.type]}`}>
                                                    {s.type}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">{s.captured}/{s.total}</span>
                                            </div>
                                            <ProgressBar 
                                                percent={(s.captured / s.total) * 100} 
                                                colorClass={typeColors[s.type]} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

const StatCard = ({ label, captured, total, color, isType }: any) => {
    const pct = total > 0 ? (captured / total) * 100 : 0;
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
                <span className={`px-3 py-1 rounded-full text-white text-xs font-black uppercase ${color}`}>
                    {label}
                </span>
                <span className="text-sm font-bold text-slate-400">{captured} <span className="text-slate-300">/</span> {total}</span>
            </div>
            <ProgressBar percent={pct} colorClass={color} />
        </div>
    );
};