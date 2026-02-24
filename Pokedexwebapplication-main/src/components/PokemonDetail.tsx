import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, Crown, Sparkles, Fingerprint, Ruler, Weight, Heart } from 'lucide-react';
import { pokemonService, EvolutionNode, Pokemon } from '../services/pokemonService';

interface PokemonDetailProps {
    pokemon: Pokemon;
    onClose: () => void;
    isCaptured: boolean;
    onToggleCapture: (id: number) => void;
}

/* ---------- STAT BAR COMPONENT ---------- */
const StatBar = ({ label, value }: { label: string; value: number }) => {
    const getColor = (name: string) => {
        const map: Record<string, string> = {
            hp: 'bg-green-500',
            attack: 'bg-red-500',
            defense: 'bg-blue-500',
            'special-attack': 'bg-purple-500',
            'special-defense': 'bg-indigo-500',
            speed: 'bg-pink-500',
        };
        return map[name.toLowerCase()] || 'bg-slate-400';
    };

    const percent = Math.min((value / 255) * 100, 100);

    return (
        <div className="mb-3">
            <div className="flex justify-between text-xs font-bold">
                <span className="uppercase text-slate-500">{label.replace('-', ' ')}</span>
                <span className="text-slate-700">{value}</span>
            </div>

            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full ${getColor(label)}`}
                />
            </div>
        </div>
    );
};

/* ---------- MAIN COMPONENT ---------- */

export const PokemonDetail: React.FC<PokemonDetailProps> = ({
    pokemon,
    onClose,
    isCaptured,
    onToggleCapture
}) => {

    const [evolutionChain, setEvolutionChain] = useState<EvolutionNode[]>([]);
    const [loadingEvo, setLoadingEvo] = useState(true);

    const roman = ['I','II','III','IV','V','VI','VII','VIII','IX'];

    useEffect(() => {
        const load = async () => {
            setLoadingEvo(true);
            try {
                const chain = await pokemonService.getEvolutionChain(pokemon.id);
                setEvolutionChain(chain);
            } catch {
                console.error("Evolution load failed");
            } finally {
                setLoadingEvo(false);
            }
        };
        load();
    }, [pokemon.id]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                layoutId={`pokemon-card-${pokemon.id}`}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >

                {/* CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* LEFT PANEL */}
                <div className={`w-full md:w-1/2 p-10 flex flex-col items-center justify-center relative ${isCaptured ? 'bg-yellow-50' : 'bg-slate-100'}`}>

                    {/* BG POKEBALL */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[40px] border-slate-900 rounded-full"/>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-slate-900"/>
                    </div>

                    {/* GEN */}
                    {pokemon.generation && (
                        <div className="absolute top-6 left-6 text-xs font-bold text-slate-400 flex gap-1 items-center">
                            <Fingerprint className="w-3 h-3"/>
                            Gen {roman[pokemon.generation-1] || pokemon.generation}
                        </div>
                    )}

                    {/* IMAGE */}
                    <motion.img
                        layoutId={`pokemon-img-${pokemon.id}`}
                        src={pokemon.image}
                        alt={pokemon.name}
                        className="w-64 h-64 object-contain z-10"
                    />

                    {/* CAPTURE BTN */}
                    <button
                        onClick={() => onToggleCapture(pokemon.id)}
                        className={`mt-6 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition
                        ${isCaptured
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-800 text-white hover:bg-slate-700'
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${isCaptured ? 'fill-current' : ''}`} />
                        {isCaptured ? 'Captured' : 'Capture'}
                    </button>

                </div>

                {/* RIGHT PANEL */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto">

                    {/* HEADER */}
                    <div className="mb-6">
                        <span className="text-xs font-bold text-slate-400">
                            #{String(pokemon.id).padStart(3,'0')}
                        </span>

                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-4xl font-black capitalize">{pokemon.name}</h2>

                            {pokemon.isLegendary && (
                                <span className="badge bg-amber-100 text-amber-700 flex items-center gap-1 px-2 py-1 rounded text-xs">
                                    <Crown className="w-3 h-3"/> Legendary
                                </span>
                            )}

                            {pokemon.isMythical && (
                                <span className="badge bg-purple-100 text-purple-700 flex items-center gap-1 px-2 py-1 rounded text-xs">
                                    <Sparkles className="w-3 h-3"/> Mythical
                                </span>
                            )}
                        </div>

                        {/* TYPES */}
                        <div className="flex gap-2 mt-2">
                            {pokemon.types.map(t => (
                                <span key={t} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold uppercase">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* HEIGHT + WEIGHT */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl border">
                            <div className="text-xs text-slate-400 flex gap-1 items-center">
                                <Weight className="w-4 h-4"/> Weight
                            </div>
                            <p className="font-bold">{pokemon.weight ?? '--'} kg</p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border">
                            <div className="text-xs text-slate-400 flex gap-1 items-center">
                                <Ruler className="w-4 h-4"/> Height
                            </div>
                            <p className="font-bold">{pokemon.height ?? '--'} m</p>
                        </div>
                    </div>

                    {/* EVOLUTION */}
                    <h3 className="text-xl font-bold mb-4">Evolution Chain</h3>

                    {loadingEvo ? (
                        <div className="h-10 w-10 border-4 border-slate-300 border-t-transparent rounded-full animate-spin"/>
                    ) : (
                        <div className="flex flex-col gap-4 mb-10">
                            {evolutionChain.map((node, i) => (
                                <div key={node.species_name} className="flex items-center gap-3">

                                    <img src={node.image} className="w-16 h-16 object-contain bg-slate-50 rounded-lg border"/>

                                    <div>
                                        <p className="font-bold capitalize">{node.species_name}</p>
                                        {i>0 && (
                                            <p className="text-xs text-slate-400">
                                                {node.min_level
                                                    ? `Level ${node.min_level}`
                                                    : node.trigger_name ?? 'Evolution'}
                                            </p>
                                        )}
                                    </div>

                                    {i < evolutionChain.length-1 && (
                                        <ArrowRight className="ml-auto text-slate-300"/>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* STATS */}
                    <h3 className="text-xl font-bold mb-4">Base Stats</h3>

                    {pokemon.stats?.map(s => (
                        <StatBar key={s.name} label={s.name} value={s.value}/>
                    ))}

                </div>
            </motion.div>
        </motion.div>
    );
};