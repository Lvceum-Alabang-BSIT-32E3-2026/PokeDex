import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, ArrowRight } from 'lucide-react';
import { pokemonService, EvolutionNode, BaseStat } from '../services/pokemonService';

interface PokemonDetailProps {
  pokemon: any;
  onClose: () => void;
  isCaptured: boolean;
  onToggleCapture: (id: number) => void;
}

const STAT_COLORS: Record<string, string> = {
  'HP': '#ff5959',
  'Attack': '#f5ac78',
  'Defense': '#fae078',
  'Sp. Atk': '#9db7f5',
  'Sp. Def': '#a7db8d',
  'Speed': '#fa92b2',
};

const MAX_STAT = 255;

export const PokemonDetail: React.FC<PokemonDetailProps> = ({ pokemon, onClose, isCaptured, onToggleCapture }) => {
  const [evolutionChain, setEvolutionChain] = useState<EvolutionNode[]>([]);
  const [loadingEvo, setLoadingEvo] = useState(true);
  const [baseStats, setBaseStats] = useState<BaseStat[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!pokemon) return;

    const fetchEvolution = async () => {
      setLoadingEvo(true);
      try {
        const chain = await pokemonService.getEvolutionChain(pokemon.id);
        setEvolutionChain(chain);
      } catch (error) {
        console.error('Failed to load evolution', error);
      } finally {
        setLoadingEvo(false);
      }
    };

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const stats = await pokemonService.getBaseStats(pokemon.id);
        setBaseStats(stats);
      } catch (error) {
        console.error('Failed to load base stats', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchEvolution();
    fetchStats();
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
          <div className="absolute top-6 left-6">
            <h2 className="text-4xl font-bold text-slate-800 capitalize tracking-tight mb-2">{pokemon.name}</h2>
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
            className="w-64 h-64 object-contain z-10 my-8"
          />

          <button
            onClick={() => onToggleCapture(pokemon.id)}
            className={`mt-4 px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${isCaptured
                ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
          >
            {isCaptured ? 'Captured!' : 'Mark as Captured'}
          </button>
        </div>

        {/* Right Side: Base Stats & Evolutions */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">

          {/* Base Stats */}
          <h3 className="text-xl font-bold text-slate-800 mb-4">Base Stats</h3>
          {loadingStats ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {baseStats.map((stat) => (
                <div key={stat.name} className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold w-16 text-right shrink-0"
                    style={{ color: STAT_COLORS[stat.name] ?? '#94a3b8' }}
                  >
                    {stat.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 w-8 text-right shrink-0">
                    {stat.value}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: STAT_COLORS[stat.name] ?? '#94a3b8' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stat.value / MAX_STAT) * 100, 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Evolution Chain */}
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

          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Data Source</h3>
            <p className="text-sm text-slate-500">
              {import.meta.env.VITE_USE_LIVE_API === 'true' ? 'Live data from PokeAPI' : 'Offline Mock Data'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
