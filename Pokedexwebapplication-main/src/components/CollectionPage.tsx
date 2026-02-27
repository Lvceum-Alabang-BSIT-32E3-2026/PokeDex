import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle, BarChart3, Layers } from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

// --- Constants ---
const TYPE_COLORS: Record<string, string> = {
    grass: 'bg-green-500', fire: 'bg-orange-500', water: 'bg-blue-500',
    bug: 'bg-lime-600', normal: 'bg-slate-400', poison: 'bg-purple-500',
    electric: 'bg-yellow-400', ground: 'bg-amber-600', fairy: 'bg-pink-400',
    fighting: 'bg-red-700', psychic: 'bg-pink-600', rock: 'bg-stone-500',
    ghost: 'bg-indigo-700', ice: 'bg-cyan-300', dragon: 'bg-indigo-600',
    steel: 'bg-zinc-400', flying: 'bg-sky-400', dark: 'bg-slate-800'
};

const GENERATION_NAMES: Record<number, string> = {
    1: 'Gen I (Kanto)', 2: 'Gen II (Johto)', 3: 'Gen III (Hoenn)',
    4: 'Gen IV (Sinnoh)', 5: 'Gen V (Unova)', 6: 'Gen VI (Kalos)',
    7: 'Gen VII (Alola)', 8: 'Gen VIII (Galar)', 9: 'Gen IX (Paldea)',
};

// --- Sub-Components ---
const ProgressBar: React.FC<{ percent: number; colorClass: string }> = ({ percent, colorClass }) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setWidth(percent), 100);
        return () => clearTimeout(timer);
    }, [percent]);

    return (
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                style={{ width: `${width}%` }}
            />
        </div>
    );
};

// --- Main Component ---
interface CollectionPageProps {
    onBack: () => void;
    capturedIds: Set<number>; // Passed from App.tsx state
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack, capturedIds }) => {
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'gen' | 'type'>('gen');

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await pokemonService.getAllRaw();
                setAllPokemon(data);
            } catch (err) {
                console.error("Failed to load collection data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 1. Generation Stats Logic
    const genStats = useMemo(() => {
        const byGen: Record<number, { total: number; captured: number }> = {};
        allPokemon.forEach(p => {
            const g = p.generation || 1;
            if (!byGen[g]) byGen[g] = { total: 0, captured: 0 };
            byGen[g].total++;
            if (capturedIds.has(p.id)) byGen[g].captured++;
        });
        return Object.entries(byGen).map(([gen, stats]) => ({
            gen: Number(gen),
            name: GENERATION_NAMES[Number(gen)] || `Gen ${gen}`,
            ...stats
        })).sort((a, b) => a.gen - b.gen);
    }, [allPokemon, capturedIds]);

    // 2. Type Stats Logic (from task-234)
    const typeStats = useMemo(() => {
        return Object.keys(TYPE_COLORS).map(type => {
            const inType = allPokemon.filter(p => p.types.some(t => t.toLowerCase() === type));
            const captured = inType.filter(p => capturedIds.has(p.id));
            return { type, total: inType.length, captured: captured.length };
        }).filter(s => s.total > 0);
    }, [allPokemon, capturedIds]);

    const totalCaptured = capturedIds.size;
    const overallPercent = allPokemon.length > 0 ? (totalCaptured / allPokemon.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center text-slate-600 hover:text-red-600 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-1" /> Pokedex
                    </button>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('gen')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'gen' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
                        > Generations </button>
                        <button 
                            onClick={() => setActiveTab('type')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'type' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
                        > Types </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Overall Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">COLLECTION PROGRESS</h2>
                            <p className="text-slate-500">Master Trainer Status: {overallPercent === 100 ? 'Living Dex Complete!' : 'In Progress'}</p>
                        </div>
                        <div className="bg-red-50 text-red-700 px-6 py-3 rounded-2xl border border-red-100 flex items-center gap-3">
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-xl font-bold">{totalCaptured} / {allPokemon.length}</span>
                        </div>
                    </div>
                    <ProgressBar percent={overallPercent} colorClass="bg-red-600" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent animate-spin rounded-full" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTab === 'gen' ? (
                            genStats.map(s => (
                                <StatCard key={s.gen} label={s.name} captured={s.captured} total={s.total} color="bg-blue-500" />
                            ))
                        ) : (
                            typeStats.map(s => (
                                <StatCard key={s.type} label={s.type} captured={s.captured} total={s.total} color={TYPE_COLORS[s.type]} isType />
                            ))
                        )}
                    </div>
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