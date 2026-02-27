import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, ArrowRight, Crown, Sparkles, Fingerprint, 
    Ruler, Weight, Heart 
} from 'lucide-react';
import { pokemonService, EvolutionNode } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

interface PokemonDetailProps {
    pokemon: Pokemon;
    onClose: () => void;
    isCaptured: boolean;
    onToggleCapture: (id: number) => void | Promise<void>;
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
                    transition={{ duration: 0.8, ease: "easeOut" }}
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
        const loadEvolution = async () => {
            setLoadingEvo(true);
            try {
                const chain = await pokemonService.getEvolutionChain(pokemon.id);
                setEvolutionChain(chain);
            } catch (err) {
                console.error("Evolution load failed", err);
            } finally {
                setLoadingEvo(false);
            }
        };
        loadEvolution();
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
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg z-20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* LEFT PANEL: Visuals */}
                <div className={`w-full md:w-1/2 p-10 flex flex-col items-center justify-center relative overflow-hidden ${isCaptured ? 'bg-yellow-50' : 'bg-slate-100'}`}>
                    {/* Background Decoration */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[40px] border-slate-900 rounded-full"/>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-slate-900"/>
                    </div>

                    {pokemon.generation && (
                        <div className="absolute top-6 left-6 text-xs font-bold text-slate-400 flex gap-1 items-center">
                            <Fingerprint className="w-3 h-3"/>
                            Gen {roman[pokemon.generation-1] || pokemon.generation}
                        </div>
                    )}

                    <motion.img
                        layoutId={`pokemon-img-${pokemon.id}`}
                        src={pokemon.imageUrl}
                        alt={pokemon.name}
                        className="w-64 h-64 object-contain z-10 drop-shadow-2xl"
                    />

                    <button
                        onClick={() => onToggleCapture(pokemon.id)}
                        className={`mt-8 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 z-10
                        ${isCaptured
                            ? 'bg-red-500 text-white shadow-red-200 shadow-lg'
                            : 'bg-slate-800 text-white hover:bg-slate-700 shadow-xl'
                        }`}
                    >
                        <Heart className={`w-5 h-5 ${isCaptured ? 'fill-current' : ''}`} />
                        {isCaptured ? 'Captured' : 'Capture'}
                    </button>
                </div>

                {/* RIGHT PANEL: Info & Stats */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white">
                    <div className="mb-6">
                        <span className="text-sm font-mono font-bold text-slate-400">
                            #{String(pokemon.id).padStart(3,'0')}
                        </span>

                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h2 className="text-4xl font-black capitalize text-slate-800">{pokemon.name}</h2>
                            {pokemon.isLegendary && (
                                <span className="bg-amber-100 text-amber-700 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    <Crown className="w-3 h-3"/> Legendary
                                </span>
                            )}
                            {pokemon.isMythical && (
                                <span className="bg-purple-100 text-purple-700 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    <Sparkles className="w-3 h-3"/> Mythical
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {pokemon.types.map(t => (
                                <span key={t} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest border border-slate-200">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex gap-1 items-center mb-1">
                                <Weight className="w-3 h-3"/> Weight
                            </div>
                            <p className="font-bold text-slate-700">{pokemon.weight ?? '--'} kg</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex gap-1 items-center mb-1">
                                <Ruler className="w-3 h-3"/> Height
                            </div>
                            <p className="font-bold text-slate-700">{pokemon.height ?? '--'} m</p>
                        </div>
                    </div>

                    {/* EVOLUTION CHAIN */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Evolution Chain</h3>
                        {loadingEvo ? (
                            <div className="flex justify-center py-4">
                                <div className="h-6 w-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"/>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {evolutionChain.map((node, i) => (
                                    <div key={node.species_name} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                        <img src={node.image} alt={node.species_name} className="w-12 h-12 object-contain bg-white rounded-lg border shadow-sm"/>
                                        <div className="flex-1">
                                            <p className="font-bold capitalize text-slate-700 text-sm">{node.species_name}</p>
                                            {i > 0 && (
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {node.min_level ? `Level ${node.min_level}` : node.trigger_name ?? 'Special condition'}
                                                </p>
                                            )}
                                        </div>
                                        {i < evolutionChain.length - 1 && (
                                            <ArrowRight className="text-slate-300 w-4 h-4"/>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BASE STATS */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Base Stats</h3>
                        {pokemon.stats?.map(s => (
                            <StatBar key={s.name} label={s.name} value={s.value}/>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};