import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { pokemonService, EvolutionNode } from '../services/pokemonService';
import { StatBar } from './StatBar';

interface PokemonDetailProps {
    pokemon: Pokemon;
    onClose: () => void;
    isCaptured: boolean;
    onToggleCapture: (id: number) => void;
}

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose, isCaptured, onToggleCapture }) => {
    const [evolutionChain, setEvolutionChain] = useState<EvolutionNode[]>([]);
    const [loadingEvo, setLoadingEvo] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoadingEvo(true);
        pokemonService
            .getEvolutionChain(pokemon.id)
            .then((data) => {
                if (!cancelled) setEvolutionChain(data);
            })
            .catch(() => {
                if (!cancelled) setEvolutionChain([]);
            })
            .finally(() => {
                if (!cancelled) setLoadingEvo(false);
            });
        return () => {
            cancelled = true;
        };
    }, [pokemon.id]);

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
                className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/20 hover:bg-black/10 rounded-full transition-colors"
                    aria-label="Close"
                >
                    <X className="w-6 h-6 text-slate-800" />
                </button>

                {/* Left Visual Section */}
                <div className={`w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative ${isCaptured ? 'bg-yellow-50' : 'bg-slate-100'}`}>
                    <div className="absolute top-6 left-6">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-4xl font-bold text-slate-800 capitalize tracking-tight">{pokemon.name}</h2>
                            {(pokemon.isLegendary || pokemon.isMythical) && (
                                <div className="flex gap-2">
                                    {pokemon.isLegendary && (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-yellow-400 text-yellow-900 border border-yellow-500 shadow-sm animate-pulse">
                                            Legendary
                                        </span>
                                    )}
                                    {pokemon.isMythical && (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500 text-white border border-purple-600 shadow-sm animate-pulse">
                                            Mythical
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {pokemon.types.map((t) => (
                                <span key={t} className="bg-slate-800 text-white px-3 py-1 rounded-full text-sm uppercase font-bold">
                                    {t}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Dex #{String(pokemon.id).padStart(3, '0')} &bull; Gen {pokemon.generation ?? '—'}</p>
                        <p className="text-xs text-slate-500">Height: {pokemon.height ?? '—'} m &bull; Weight: {pokemon.weight ?? '—'} kg</p>
                    </div>

                    <motion.img
                        layoutId={`image-${pokemon.id}`}
                        src={pokemon.imageUrl}
                        alt={pokemon.name}
                        className="w-64 h-64 object-contain z-10 my-8"
                    />

                    <button
                        onClick={() => onToggleCapture(pokemon.id)}
                        className={`mt-4 px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${isCaptured ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-slate-800 text-white hover:bg-slate-700'
                            }`}
                    >
                        {isCaptured ? 'Captured!' : 'Mark as Captured'}
                    </button>
                </div>

                {/* Right Info Section */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Base Stats</h3>
                    <div className="space-y-2 mb-6">
                        <StatBar label="HP" value={pokemon.hp ?? 0} />
                        <StatBar label="Attack" value={pokemon.attack ?? 0} />
                        <StatBar label="Defense" value={pokemon.defense ?? 0} />
                        <StatBar label="Sp. Atk" value={pokemon.specialAttack ?? 0} />
                        <StatBar label="Sp. Def" value={pokemon.specialDefense ?? 0} />
                        <StatBar label="Speed" value={pokemon.speed ?? 0} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-4">Evolution Chain</h3>
                    {loadingEvo ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : evolutionChain.length === 0 ? (
                        <p className="text-sm text-slate-500">No evolution data available.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {evolutionChain.map((node, idx) => (
                                <div key={`${node.species_name}-${idx}`} className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-20 h-20 bg-slate-50 rounded-lg p-2 border border-slate-100">
                                        <img src={node.image} alt={node.species_name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold capitalize text-slate-700">{node.species_name}</h4>
                                        {idx > 0 && (
                                            <p className="text-xs text-slate-500">{node.min_level ? `Level ${node.min_level}` : node.trigger_name || 'Evolution'}</p>
                                        )}
                                    </div>
                                    {idx < evolutionChain.length - 1 && <ArrowRight className="w-5 h-5 text-slate-300" />}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 text-sm text-slate-500">Data Source: API</div>
                </div>
            </motion.div>
        </motion.div>
    );
};
