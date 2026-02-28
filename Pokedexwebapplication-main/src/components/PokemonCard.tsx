import React from 'react';
import { motion } from 'motion/react';
import { Pokemon } from '../types/pokemon';
import { Check, Star } from 'lucide-react';

interface PokemonCardProps extends Pokemon {
    isCaptured: boolean;
    onToggleCapture: (id: number) => void | Promise<void>;
    onClick: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ id, name, types, imageUrl, isCaptured, onToggleCapture, onClick, isLegendary, isMythical }) => {
    const typeColor = (type: string) => {
        const colors: Record<string, string> = {
            fire: 'bg-orange-500', water: 'bg-blue-500', grass: 'bg-green-500', electric: 'bg-yellow-500',
            psychic: 'bg-pink-500', ice: 'bg-cyan-400', dragon: 'bg-indigo-600', dark: 'bg-slate-700',
            fairy: 'bg-pink-300', normal: 'bg-slate-400', fighting: 'bg-red-700', flying: 'bg-sky-400',
            poison: 'bg-purple-500', ground: 'bg-amber-600', rock: 'bg-stone-600', bug: 'bg-lime-500',
            ghost: 'bg-violet-700', steel: 'bg-slate-500',
        };
        return colors[type] || 'bg-slate-500';
    };

    return (
        <motion.div
            layoutId={`card-${id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={onClick}
            className={`relative bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all duration-300 cursor-pointer ${isCaptured ? 'border-yellow-400 shadow-yellow-200' : 'border-slate-200 hover:shadow-xl'
                }`}
        >
            <div className="absolute top-2 right-2 z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleCapture(id);
                    }}
                    className={`p-2 rounded-full shadow-sm transition-all ${isCaptured
                        ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                        : 'bg-white/80 text-slate-300 hover:text-slate-500 hover:bg-white'
                        }`}
                    title={isCaptured ? 'Release' : 'Capture'}
                >
                    {isCaptured ? <Check className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}
                </button>
            </div>

            <div className={`p-6 flex justify-center relative ${isCaptured ? 'bg-yellow-50/50' : 'bg-slate-100'}`}>
                <span className="absolute top-3 left-3 text-slate-400 font-bold text-lg font-mono">#{String(id).padStart(3, '0')}</span>
                <motion.img
                    layoutId={`image-${id}`}
                    src={imageUrl}
                    alt={name}
                    className={`w-32 h-32 object-contain drop-shadow-md z-10 ${isCaptured ? '' : 'grayscale-[0.2]'}`}
                />
            </div>

            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold text-slate-800 capitalize truncate">{name}</h2>
                        <div className="flex gap-1 mt-1">
                            {isLegendary && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-yellow-400 text-yellow-900 border border-yellow-500 shadow-sm">
                                    Legendary
                                </span>
                            )}
                            {isMythical && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-purple-500 text-white border border-purple-600 shadow-sm">
                                    Mythical
                                </span>
                            )}
                        </div>
                    </div>
                    {isCaptured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {types.map((type) => (
                        <span
                            key={type}
                            className={`${typeColor(type)} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider`}
                        >
                            {type}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
