import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

interface CollectionPageProps {
    onBack: () => void;
    capturedIds: Set<number>;
}

const typeColors: Record<string, string> = {
    grass: 'bg-green-500', fire: 'bg-orange-500', water: 'bg-blue-500',
    bug: 'bg-lime-600', normal: 'bg-slate-400', poison: 'bg-purple-500',
    electric: 'bg-yellow-400', ground: 'bg-amber-600', fairy: 'bg-pink-400',
    fighting: 'bg-red-700', psychic: 'bg-pink-600', rock: 'bg-stone-500',
    ghost: 'bg-indigo-700', ice: 'bg-cyan-300', dragon: 'bg-indigo-600',
    steel: 'bg-zinc-400', flying: 'bg-sky-400', dark: 'bg-slate-800'
};

const GENERATION_NAMES: Record<number, string> = {
    1: 'Gen I — Kanto', 2: 'Gen II — Johto', 3: 'Gen III — Hoenn',
    4: 'Gen IV — Sinnoh', 5: 'Gen V — Unova', 6: 'Gen VI — Kalos',
    7: 'Gen VII — Alola', 8: 'Gen VIII — Galar', 9: 'Gen IX — Paldea',
};

const ProgressBar: React.FC<{ percent: number; colorClass: string }> = ({ percent, colorClass }) => (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
            className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
            style={{ width: `${percent}%` }}
        />
    </div>
);

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack, capturedIds }) => {
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'generation' | 'type'>('generation');

    useEffect(() => {
        const loadPokemon = async () => {
            try {
                const data = await pokemonService.getAllRaw();
                setAllPokemon(data);
            } catch (err) {
                console.error("Failed to load collection", err);
            } finally {
                setLoading(false);
            }
        };
        loadPokemon();
    }, []);

    // --- Stats Logic ---
    const totalCaptured = capturedIds.size;
    
    const legendaryCount = allPokemon.filter(p => 
        capturedIds.has(p.id) && (p.isLegendary || p.isMythical)
    ).length;

    const genStats = Object.keys(GENERATION_NAMES).map(genStr => {
        const gen = Number(genStr);
        const inGen = allPokemon.filter(p => (p.generation || 1) === gen);
        const captured = inGen.filter(p => capturedIds.has(p.id)).length;
        return { gen, name: GENERATION_NAMES[gen], total: inGen.length, captured };
    }).filter(s => s.total > 0);

    const typeStats = Object.keys(typeColors).map(type => {
        const inType = allPokemon.filter(p => p.types.some(t => t.toLowerCase() === type));
        const captured = inType.filter(p => capturedIds.has(p.id)).length;
        return { type, total: inType.length, captured };
    }).filter(s => s.total > 0);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-red-600 shadow-lg sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 text-white hover:bg-red-700 rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold text-white">Trainer Collection</h1>
                    </div>
                    <div className="flex bg-red-700 rounded-lg p-1">
                        <button 
                            onClick={() => setView('generation')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${view === 'generation' ? 'bg-white text-red-600' : 'text-white'}`}
                        >GENS</button>
                        <button 
                            onClick={() => setView('type')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${view === 'type' ? 'bg-white text-red-600' : 'text-white'}`}
                        >TYPES</button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Legendary Badge Section */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-yellow-400" /> Legendary Tracker
                        </h2>
                        <p className="text-indigo-100 text-sm">Rare & Mythical Pokémon captured</p>
                    </div>
                    <div className="text-3xl font-black">{legendaryCount}</div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading Stats...</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {(view === 'generation' ? genStats : typeStats).map((stat) => {
                            const isGen = 'gen' in stat;
                            const label = isGen ? (stat as any).name : (stat as any).type;
                            const pct = stat.total > 0 ? (stat.captured / stat.total) * 100 : 0;
                            
                            return (
                                <div key={label} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${isGen ? 'bg-slate-100 text-slate-600' : `${typeColors[label]} text-white`}`}>
                                            {label}
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">{stat.captured} / {stat.total}</span>
                                    </div>
                                    <ProgressBar 
                                        percent={pct} 
                                        colorClass={isGen ? 'bg-red-500' : typeColors[label]} 
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{pct.toFixed(1)}% COMPLETE</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};