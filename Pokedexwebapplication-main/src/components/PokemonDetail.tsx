import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Weight, Ruler } from 'lucide-react';
import { Pokemon } from '../types/pokemon';

interface PokemonDetailProps {
    pokemon: Pokemon;
    onClose: () => void;
    isCaptured: boolean;
    onToggleCapture: (id: number) => void | Promise<void>;
}

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose, isCaptured, onToggleCapture }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100/80 hover:bg-white rounded-full text-slate-500 shadow-sm z-10 transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-10 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[40px] border-slate-900 rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-10 bg-slate-900"></div>
                    </div>
                    <motion.img
                        layoutId={`pokemon-img-${pokemon.id}`}
                        src={pokemon.imageUrl}
                        alt={pokemon.name}
                        className="w-56 h-56 object-contain drop-shadow-2xl z-10"
                    />
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">#{String(pokemon.id).padStart(3, '0')}</span>
                            <h2 className="text-4xl font-black text-slate-900 capitalize tracking-tight">{pokemon.name}</h2>
                        </div>
                        <button
                            onClick={() => onToggleCapture(pokemon.id)}
                            className={`p-4 rounded-2xl shadow-lg transition-all ${isCaptured ? 'bg-red-500 text-white scale-110' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400'
                                }`}
                        >
                            <Heart className={`w-6 h-6 ${isCaptured ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    <div className="flex gap-2 mb-8">
                        {pokemon.types.map((type) => (
                            <span
                                key={type}
                                className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200"
                            >
                                {type}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Weight className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
                            </div>
                            <p className="text-lg font-bold text-slate-700">7.0 kg</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-1">
                                <Ruler className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Height</span>
                            </div>
                            <p className="text-lg font-bold text-slate-700">0.7 m</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
