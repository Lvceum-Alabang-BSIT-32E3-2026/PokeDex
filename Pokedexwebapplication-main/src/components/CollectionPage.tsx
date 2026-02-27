import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle, BarChart3, LayoutGrid } from 'lucide-react';
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
    1: 'Gen I — Kanto', 2: 'Gen II — Johto', 3: 'Gen III — Hoenn',
    4: 'Gen IV — Sinnoh', 5: 'Gen V — Unova', 6: 'Gen VI — Kalos',
    7: 'Gen VII — Alola', 8: 'Gen VIII — Galar', 9: 'Gen IX — Paldea',
};

const GEN_GRADIENTS: Record<number, string> = {
    1: 'from-red-500 to-red-400', 2: 'from-yellow-500 to-yellow-400',
    3: 'from-emerald-500 to-emerald-400', 4: 'from-blue-500 to-blue-400',
    5: 'from-slate-600 to-slate-500', 6: 'from-pink-500 to-pink-400',
    7: 'from-orange-500 to-orange-400', 8: 'from-violet-500 to-violet-400',
    9: 'from-teal-500 to-teal-400',
};

// --- Sub-Components ---

const ProgressBar: React.FC<{ percent: number; colorClass: string }> = ({ percent, colorClass }) => {
    const [width, setWidth] = useState(0);
    useEffect(() => { setWidth(percent); }, [percent]);

    return (
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${colorClass.startsWith('bg-') ? colorClass : colorClass}`}
                style={{ width: `${width}%` }}
            />
        </div>
    );
};

// --- Main Component ---

interface CollectionPageProps {
    onBack: () => void;
    capturedIds: Set<number>; // Integrated from task-325
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack, capturedIds }) => {
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Fetching all to calculate local breakdown
                const response = await pokemonService.getList(0, 2000);
                setAllPokemon(response.items);
            } catch (err) {
                setError('Failed to sync collection data.');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 1. Generation Stats Logic (from dev-frontend)
    const genStats = useMemo(() => {
        const gens: Record<number, { captured: number; total: number }> = {};
        allPokemon.forEach(p => {
            const g = p.generation || 1;
            if (!gens[g]) gens[g] = { captured: 0, total: 0 };
            gens[g].total++;
            if (capturedIds.has(p.id)) gens[g].captured++;
        });
        return Object.entries(gens).map(([id, stats]) => ({
            id: Number(id),
            name: GEN_NAMES[Number(id)] || `Generation ${id}`,
            ...stats
        })).sort((a, b) => a.id - b.id);
    }, [allPokemon, capturedIds]);

    // 2. Type Stats Logic (from task-325)
    const typeStats = useMemo(() => {
        return Object.keys(TYPE_COLORS).map(type => {
            const filtered = allPokemon.filter(p => 
                p.types.some(t => t.toLowerCase() === type.toLowerCase())
            );
            return {
                type,
                total: filtered.length,
                captured: filtered.filter(p => capturedIds.has(p.id)).length
            };
        }).filter(s => s.total > 0);
    }, [allPokemon, capturedIds]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent animate-spin rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-red-600 shadow-md sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 text-white hover:bg-red-700 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-white">Trainer Collection</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 space-y-12">
                
                {/* section: Generation Progress */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <LayoutGrid className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-bold text-slate-800">Progress by Generation</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {genStats.map(gen => (
                            <div key={gen.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-semibold text-slate-700">{gen.name}</span>
                                    <span className="text-xs font-bold text-slate-400">{gen.captured}/{gen.total}</span>
                                </div>
                                <ProgressBar 
                                    percent={(gen.captured / gen.total) * 100} 
                                    colorClass={GEN_GRADIENTS[gen.id] || 'from-slate-400 to-slate-300'} 
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="border-slate-200" />

                {/* section: Type Breakdown (Task 3.2.5) */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-bold text-slate-800">Type Mastery</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {typeStats.map(stat => (
                            <div key={stat.type} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                                <span className={`${TYPE_COLORS[stat.type]} text-[10px] font-black text-white px-2 py-0.5 rounded uppercase text-center`}>
                                    {stat.type}
                                </span>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-slate-500 font-medium">{Math.round((stat.captured / stat.total) * 100)}%</span>
                                    <span className="text-[10px] text-slate-400">{stat.captured}/{stat.total}</span>
                                </div>
                                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${TYPE_COLORS[stat.type]}`} 
                                        style={{ width: `${(stat.captured / stat.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};