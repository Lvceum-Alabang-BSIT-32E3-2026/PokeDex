import React from 'react';
import { motion } from 'framer-motion';
import { Pokemon } from '../types/pokemon';
import { Heart } from 'lucide-react';

interface PokemonCardProps extends Pokemon {
    isCaptured: boolean;
    onToggleCapture: (id: number) => void | Promise<void>;
    onClick: () => void;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({ id, name, types, imageUrl, isCaptured, onToggleCapture, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer border border-slate-200 hover:shadow-xl transition-all relative group"
        >
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleCapture(id);
                    }}
                    className={`p-2 rounded-full shadow-sm transition-all ${isCaptured ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-400'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isCaptured ? 'fill-current' : ''}`} />
                </button>
            </div>

            <div className="aspect-square bg-slate-50 flex items-center justify-center p-6 bg-gradient-to-b from-slate-100 to-white">
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                />
            </div>

            <div className="p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400 tracking-wider">#{String(id).padStart(3, '0')}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 capitalize truncate mb-3">{name}</h3>
                <div className="flex flex-wrap gap-1.5">
                    {types.map((type) => (
                        <span
                            key={type}
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200"
                        >
                            {type}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
