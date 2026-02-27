import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Weight, Ruler, ArrowRight, Crown, Sparkles, Fingerprint } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { pokemonService, EvolutionNode } from '../services/pokemonService';

interface PokemonDetailProps {
    pokemon: Pokemon;
    onClose: () => void;
    isCaptured: boolean;
    onToggleCapture: (id: number) => void | Promise<void>;
}

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose, isCaptured, onToggleCapture }) => {
    const [evolutionChain, setEvolutionChain] = useState<EvolutionNode[]>([]);
    const [loadingEvo, setLoadingEvo] = useState(true);

    // Helper for Generation Roman Numerals
    const getGenLabel = (gen: number) => {
        const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
        return `Gen ${roman[gen - 1] || gen}`;
    };

    useEffect(() => {
        const fetchEvolution = async () => {
            setLoadingEvo(true);
            try {
                const chain = await pokemonService.getEvolutionChain(pokemon.id);
                setEvolutionChain(chain);
            } catch (error) {
                console.error("Failed to load evolution", error);
            } finally {
                setLoadingEvo(false);
            }
        };

        if (pokemon) fetchEvolution();
    }, [pokemon]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-slate-100/80 hover:bg-white rounded-full text-slate-500 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Visuals (Merged UI) */}
                <div className={`w-full md:w-1/2 p-10 flex flex-col items-center justify-center relative ${isCaptured ? 'bg-yellow-50/50' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
                    {/* Pokeball Background Decoration */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[40px] border-slate-900 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-slate-900"></div>
                    </div>

                    <motion.img
                        layoutId={`pokemon-img-${pokemon.id}`}
                        src={pokemon.imageUrl || pokemon.image}
                        alt={pokemon.name}
                        className="w-64 h-64 object-contain drop-shadow-2xl z-10"
                    />

                    {/* Status Badges */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2 z-10">
                        {pokemon.isLegendary && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <Crown className="w-3 h-3" /> Legendary
                            </span>
                        )}
                        {pokemon.isMythical && (
                            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                <Sparkles className="w-3 h-3" /> Mythical
                            </span>
                        )}
                    </div>
                </div>

                {/* Right Side: Info & Evolutions */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            {pokemon.generation && (
                                <div className="flex items-center gap-1 text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">
                                    <Fingerprint className="w-3 h-3" />
                                    {getGenLabel(pokemon.generation)}
                                </div>
                            )}
                            <span className="text-sm font-bold text-slate-400 tracking-widest">#{String(pokemon.id).padStart(3, '0')}</span>
                            <h2 className="text-4xl font-black text-slate-900 capitalize leading-none">{pokemon.name}</h2>
                        </div>
                        <button
                            onClick={() => onToggleCapture(pokemon.id)}
                            className={`p-4 rounded-2xl shadow-lg transition-all ${isCaptured ? 'bg-red-500 text-white scale-110' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400'}`}
                        >
                            <Heart className={`w-6 h-6 ${isCaptured ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    <div className="flex gap-2 mb-8">
                        {pokemon.types.map((type: string) => (
                            <span key={type} className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-800 text-white">
                                {type}
                            </span>
                        ))}
                    </div>

                    {/* Physical Attributes */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Weight className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
                            </div>
                            <p className="text-lg font-bold text-slate-700">
                                {pokemon.weight != null ? `${(pokemon.weight / 10).toFixed(1)} kg` : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Ruler className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Height</span>
                            </div>
                            <p className="text-lg font-bold text-slate-700">
                                {pokemon.height != null ? `${(pokemon.height / 10).toFixed(1)} m` : 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Evolution Chain Section */}
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Evolution Chain</h3>
                    {loadingEvo ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {evolutionChain.map((node, idx) => (
                                <div key={node.species_name} className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-16 h-16 bg-slate-50 rounded-xl p-2 border border-slate-100">
                                        <img src={node.image} alt={node.species_name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold capitalize text-slate-700 text-sm">{node.species_name}</h4>
                                        {idx > 0 && (
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                {node.min_level ? `Level ${node.min_level}` : node.trigger_name || 'Evolution'}
                                            </p>
                                        )}
                                    </div>
                                    {idx < evolutionChain.length - 1 && (
                                        <ArrowRight className="w-4 h-4 text-slate-300" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};