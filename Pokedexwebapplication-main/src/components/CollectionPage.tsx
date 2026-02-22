import React, { useState, useEffect } from 'react';
import { ChevronLeft, BarChart3 } from 'lucide-react';
import { pokemonService, Pokemon } from '../services/pokemonService';

// Define standard Pokemon types and their colors for Task 3.2.5
const typeColors: Record<string, string> = {
    grass: 'bg-green-500', fire: 'bg-orange-500', water: 'bg-blue-500',
    bug: 'bg-lime-600', normal: 'bg-slate-400', poison: 'bg-purple-500',
    electric: 'bg-yellow-400', ground: 'bg-amber-600', fairy: 'bg-pink-400',
    fighting: 'bg-red-700', psychic: 'bg-pink-600', rock: 'bg-stone-500',
    ghost: 'bg-indigo-700', ice: 'bg-cyan-300', dragon: 'bg-indigo-600',
    steel: 'bg-zinc-400', flying: 'bg-sky-400', dark: 'bg-slate-800'
};

interface CollectionPageProps {
    onBack: () => void;
    capturedIds: Set<number>;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack, capturedIds }) => {
    // 1. Create a state to hold the actual list of pokemon
    const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);

    // 2. Fetch data when the component loads
    useEffect(() => {
        const loadPokemon = async () => {
            const data = await pokemonService.getAllRaw();
            setAllPokemon(data);
        };
        loadPokemon();
    }, []);

    // 3. Logic to calculate breakdown per type using the state
    const typeStats = Object.keys(typeColors).map(type => {
        // filter now works because allPokemon is an Array, not a Promise
        const totalInType = allPokemon.filter(p =>
            p.types.some(t => t.toLowerCase() === type.toLowerCase())
        ).length;

        const capturedInType = allPokemon.filter(p =>
            p.types.some(t => t.toLowerCase() === type.toLowerCase()) &&
            capturedIds.has(p.id)
        ).length;

        return { type, total: totalInType, captured: capturedInType };
    });

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            {/* Header with Back Button */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center text-slate-600 hover:text-red-600 font-medium transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Pokedex
                </button>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-red-600" /> Type Breakdown
                </h2>
            </div>

            {/* Type Progress Cards */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {typeStats.map(({ type, total, captured }) => (
                    <div key={type} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase ${typeColors[type]}`}>
                                {type}
                            </span>
                            <span className="text-sm font-medium text-slate-500">{captured} / {total}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${typeColors[type]} transition-all duration-500`}
                                style={{ width: `${total > 0 ? (captured / total) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};