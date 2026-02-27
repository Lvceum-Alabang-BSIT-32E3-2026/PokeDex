import React, { useState, useEffect } from 'react';
import { ChevronLeft, BarChart3, CheckCircle, Trophy } from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

// --- Configuration & Constants ---

const TYPE_COLORS: Record<string, string> = {
    grass: 'bg-green-500', fire: 'bg-orange-500', water: 'bg-blue-500',
    bug: 'bg-lime-600', normal: 'bg-slate-400', poison: 'bg-purple-500',
    electric: 'bg-yellow-400', ground: 'bg-amber-600', fairy: 'bg-pink-400',
    fighting: 'bg-red-700', psychic: 'bg-pink-600', rock: 'bg-stone-500',
    ghost: 'bg-indigo-700', ice: 'bg-cyan-300', dragon: 'bg-indigo-600',
    steel: 'bg-zinc-400', flying: 'bg-sky-400', dark: 'bg-slate-800'
};

const GEN_NAMES: Record<number, string> = {
    1: 'Gen I (Kanto)', 2: 'Gen II (Johto)', 3: 'Gen III (Hoenn)',
    4: 'Gen IV (Sinnoh)', 5: 'Gen V (Unova)', 6: 'Gen VI (Kalos)',
    7: 'Gen VII (Alola)', 8: 'Gen VIII (Galar)', 9: 'Gen IX (Paldea)',
};

// --- Sub-Components ---

const ProgressBar: React.FC<{ percent: number; colorClass: string }> = ({ percent, colorClass }) => (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
            className={`h-full rounded-full ${colorClass} transition-all duration-700 ease-out`}
            style={{ width: `${percent}%` }}
        />
    </div>
);

// --- Main Component ---

interface CollectionPageProps {
    onBack: () => void;
    capturedIds: Set<number>;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack, capturedIds }) => {
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Using getAllRaw from task-325 implementation
                const data = await pokemonService.getAllRaw();
                setAllPokemon(data);
            } catch (error) {
                console.error("Failed to load collection data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- Statistics Calculation ---

    const totalCount = allPokemon.length;
    const capturedCount = capturedIds.size;
    const overallPct = totalCount > 0 ? (capturedCount / totalCount) * 100 : 0;

    // 1. Generation Stats
    const genStats = Object.keys(GEN_NAMES).map(num => {
        const gen = Number(num);
        const inGen = allPokemon.filter(p => (p.generation || 1) === gen);
        const captured = inGen.filter(p => capturedIds.has(p.id)).length;
        return { gen, name: GEN_NAMES[gen], total: inGen.length, captured };
    }).filter(s => s.total > 0);

    // 2. Type Stats
    const typeStats = Object.keys(TYPE_COLORS).map(type => {
        const inType = allPokemon.filter(p => 
            p.types.some(t => t.toLowerCase() === type.toLowerCase())
        );
        const captured = inType.filter(p => capturedIds.has(p.id)).length;
        return { type, total: inType.length, captured };
    }).filter(s => s.total > 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <button onClick={onBack} className="flex items-center text-slate-600 hover:text-red-600 transition-colors font-medium">
                        <ChevronLeft className="w-5 h-5" /> Back to Pokedex
                    </button>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" /> My Collection
                    </h2>
                </div>

                {/* Overall Summary Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">National Pokedex</p>
                            <h3 className="text-4xl font-black text-slate-900">
                                {capturedCount} <span className="text-slate-300 text-2xl">/ {totalCount}</span>
                            </h3>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-red-600">{overallPct.toFixed(1)}%</span>
                        </div>
                    </div>
                    <ProgressBar percent={overallPct} colorClass="bg-red-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Generation Breakdown Column */}
                    <div className="lg:col-span-1 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> By Generation
                        </h4>
                        {genStats.map(s => (
                            <div key={s.gen} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between text-sm mb-2 font-bold">
                                    <span className="text-slate-700">{s.name}</span>
                                    <span className="text-slate-500">{s.captured}/{s.total}</span>
                                </div>
                                <ProgressBar 
                                    percent={(s.captured / s.total) * 100} 
                                    colorClass="bg-slate-700" 
                                />
                            </div>
                        ))}
                    </div>

                    {/* Type Breakdown Column */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-blue-500" /> By Type Breakdown
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {typeStats.map(s => (
                                <div key={s.type} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`${TYPE_COLORS[s.type]} text-white px-3 py-1 rounded-full text-[10px] font-black uppercase`}>
                                            {s.type}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">{s.captured} / {s.total}</span>
                                    </div>
                                    <ProgressBar 
                                        percent={(s.captured / s.total) * 100} 
                                        colorClass={TYPE_COLORS[s.type]} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};