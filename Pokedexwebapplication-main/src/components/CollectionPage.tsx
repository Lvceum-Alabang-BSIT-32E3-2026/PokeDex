import React, { useState, useEffect, useMemo } from 'react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';
import { ArrowLeft, Trophy, Target, PieChart } from 'lucide-react';

interface CollectionPageProps {
  onBack?: () => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack }) => {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Fallback if no props are passed for routing
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '#/pokedex';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Load captures: In current setup, captures are kept in localStorage
        const saved = localStorage.getItem('capturedPokemon');
        if (saved) {
          setCapturedIds(new Set(JSON.parse(saved)));
        }

        // Fetch all Pokemon to calculate stats
        const response = await pokemonService.getList(0, 2000);
        setAllPokemon(response.items);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!allPokemon.length) return null;

    const total = allPokemon.length;
    const captured = allPokemon.filter(p => capturedIds.has(p.id)).length;
    
    // Generation breakdown
    const genStats = allPokemon.reduce((acc, p) => {
      const gen = p.generation || 1;
      if (!acc[gen]) acc[gen] = { total: 0, captured: 0 };
      acc[gen].total++;
      if (capturedIds.has(p.id)) acc[gen].captured++;
      return acc;
    }, {} as Record<number, { total: number; captured: number; }>);

    // Type breakdown
    const typeStats = allPokemon.reduce((acc, p) => {
      p.types.forEach(type => {
        if (!acc[type]) acc[type] = { total: 0, captured: 0 };
        acc[type].total++;
        if (capturedIds.has(p.id)) acc[type].captured++;
      });
      return acc;
    }, {} as Record<string, { total: number; captured: number; }>);

    return {
      total,
      captured,
      percentage: Math.round((captured / total) * 100) || 0,
      genStats,
      typeStats
    };
  }, [allPokemon, capturedIds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
              aria-label="Go back to Pokedex"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Collection Stats</h1>
              <p className="text-slate-500">Track your Pokedex progress</p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Overall Progress
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {stats.percentage}%
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <p className="text-slate-500 text-sm">
            You have captured {stats.captured} out of {stats.total} known Pokémon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Generation Breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <Target className="w-5 h-5 text-blue-500" />
              By Generation
            </div>
            <div className="space-y-4">
              {Object.entries(stats.genStats)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([gen, data]) => {
                const percentage = Math.round((data.captured / data.total) * 100) || 0;
                return (
                  <div key={gen} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">Generation {gen}</span>
                      <span className="text-slate-500">{data.captured} / {data.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Type Breakdown */}
          <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <PieChart className="w-5 h-5 text-green-500" />
              By Type
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(stats.typeStats)
                .sort((a, b) => b[1].captured - a[1].captured)
                .map(([type, data]) => {
                const percentage = Math.round((data.captured / data.total) * 100) || 0;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700 capitalize">{type}</span>
                      <span className="text-slate-500">{data.captured} / {data.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
