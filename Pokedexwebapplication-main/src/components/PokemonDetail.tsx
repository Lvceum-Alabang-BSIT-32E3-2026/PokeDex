import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Crown, Sparkles, Fingerprint } from 'lucide-react'; // Nagdagdag ng Fingerprint icon para sa Gen
import { pokemonService, EvolutionNode } from '../services/pokemonService';

interface PokemonDetailProps {
    pokemon: any;
    onClose: () => void;
    isCaptured: boolean;
    onToggleCapture: (id: number) => void;
}

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose, isCaptured, onToggleCapture }) => {
    const [evolutionChain, setEvolutionChain] = useState<EvolutionNode[]>([]);
    const [loadingEvo, setLoadingEvo] = useState(true);

    // Helper function para sa Roman Numerals ng Generation
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

        if (pokemon) {
            fetchEvolution();
        }
    }, [pokemon]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                layoutId={`card-${pokemon.id}`}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-black/10 rounded-full transition-colors"
                >
                    <X className="w-6 h-6 text-slate-800" />
                </button>

                {/* Left Side: Visuals */}
                <div className={`w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative ${isCaptured ? 'bg-yellow-50' : 'bg-slate-100'}`}>
                    <div className="absolute top-6 left-6 w-full pr-12">

                        {/* --- TASK 2.3.4: GENERATION BADGE --- */}
                        {pokemon.generation && (
                            <div className="flex items-center gap-1 text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">
                                <Fingerprint className="w-3 h-3" />
                                {getGenLabel(pokemon.generation)}
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h2 className="text-4xl font-bold text-slate-800 capitalize tracking-tight">{pokemon.name}</h2>

                            {pokemon.isLegendary && (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-sm">
                                    <Crown className="w-3 h-3" /> Legendary
                                </span>
                            )}

                            {pokemon.isMythical && (
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-sm">
                                    <Sparkles className="w-3 h-3" /> Mythical
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {pokemon.types.map((t: string) => (
                                <span key={t} className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm uppercase font-bold">{t}</span>
                            ))}
                        </div>
                    </div>

                    <motion.img
                        layoutId={`image-${pokemon.id}`}
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-64 h-64 object-contain z-10 my-12"
                    />

                    <button
                        onClick={() => onToggleCapture(pokemon.id)}
                        className={`mt-4 px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${isCaptured
                            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-lg shadow-yellow-200'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                            }`}
                    >
                        {isCaptured ? 'Captured!' : 'Mark as Captured'}
                    </button>
                </div>

                {/* Right Side: Stats & Evolutions */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Evolution Chain</h3>

                    {loadingEvo ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {evolutionChain.map((node, idx) => (
                                <div key={node.species_name} className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                        <img src={node.image} alt={node.species_name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold capitalize text-slate-700">{node.species_name}</h4>
                                        {idx > 0 && (
                                            <p className="text-xs text-slate-500">
                                                {node.min_level ? `Level ${node.min_level}` : node.trigger_name || 'Evolution'}
                                            </p>
                                        )}
                                    </div>
                                    {idx < evolutionChain.length - 1 && (
                                        <ArrowRight className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                            ))}
                            {evolutionChain.length <= 1 && (
                                <p className="text-slate-400 text-sm italic">This Pokémon does not evolve or evolution data is unavailable.</p>
                            )}
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">System Status</h3>
                        <p className="text-xs text-slate-400">
                            Mode: {import.meta.env.VITE_USE_LIVE_API === 'true' ? 'Live Production API' : 'Local Mock Environment'}
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};