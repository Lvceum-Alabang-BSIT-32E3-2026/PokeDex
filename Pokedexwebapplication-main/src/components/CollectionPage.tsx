import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { pokemonService } from '../services/pokemonService';
import { Pokemon } from '../types/pokemon';

interface CollectionPageProps {
  onBack: () => void;
}

interface GenStats {
  gen: number;
  name: string;
  total: number;
  captured: number;
}

const GENERATION_NAMES: Record<number, string> = {
  1: 'Generation I — Kanto',
  2: 'Generation II — Johto',
  3: 'Generation III — Hoenn',
  4: 'Generation IV — Sinnoh',
  5: 'Generation V — Unova',
  6: 'Generation VI — Kalos',
  7: 'Generation VII — Alola',
  8: 'Generation VIII — Galar',
  9: 'Generation IX — Paldea',
};

// Color gradient per generation
const GEN_COLORS: Record<number, { bar: string; badge: string }> = {
  1: { bar: 'from-red-500 to-red-400',       badge: 'bg-red-100 text-red-700' },
  2: { bar: 'from-yellow-500 to-yellow-400',  badge: 'bg-yellow-100 text-yellow-700' },
  3: { bar: 'from-emerald-500 to-emerald-400',badge: 'bg-emerald-100 text-emerald-700' },
  4: { bar: 'from-blue-500 to-blue-400',      badge: 'bg-blue-100 text-blue-700' },
  5: { bar: 'from-slate-600 to-slate-500',    badge: 'bg-slate-100 text-slate-700' },
  6: { bar: 'from-pink-500 to-pink-400',      badge: 'bg-pink-100 text-pink-700' },
  7: { bar: 'from-orange-500 to-orange-400',  badge: 'bg-orange-100 text-orange-700' },
  8: { bar: 'from-violet-500 to-violet-400',  badge: 'bg-violet-100 text-violet-700' },
  9: { bar: 'from-teal-500 to-teal-400',      badge: 'bg-teal-100 text-teal-700' },
};

interface ProgressBarProps {
  percent: number;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent, colorClass }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate on mount
    const timer = setTimeout(() => setWidth(percent), 80);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div
      className="w-full h-3 bg-slate-200 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

export const CollectionPage: React.FC<CollectionPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genStats, setGenStats] = useState<GenStats[]>([]);
  const [totalCaptured, setTotalCaptured] = useState(0);
  const [totalPokemon, setTotalPokemon] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Read captured IDs from localStorage
        const saved = localStorage.getItem('capturedPokemon');
        const capturedIds = new Set<number>(saved ? JSON.parse(saved) : []);

        // Fetch all Pokemon — large page size to get everything at once
        // We fetch per-generation so the service's generation filter is used correctly
        const allPokemon: Pokemon[] = [];
        const FETCH_LIMIT = 2000;
        const response = await pokemonService.getList(0, FETCH_LIMIT);
        allPokemon.push(...response.items);

        if (allPokemon.length === 0) {
          setGenStats([]);
          setTotalPokemon(0);
          setTotalCaptured(0);
          setLoading(false);
          return;
        }

        // Group by generation
        const byGen: Record<number, Pokemon[]> = {};
        for (const p of allPokemon) {
          const g = p.generation ?? 1;
          if (!byGen[g]) byGen[g] = [];
          byGen[g].push(p);
        }

        // Build stats — only include gens that actually have Pokemon
        const stats: GenStats[] = Object.entries(byGen)
          .map(([gen, list]) => {
            const g = Number(gen);
            const captured = list.filter(p => capturedIds.has(p.id)).length;
            return {
              gen: g,
              name: GENERATION_NAMES[g] ?? `Generation ${g}`,
              total: list.length,
              captured,
            };
          })
          .filter(s => s.total > 0)
          .sort((a, b) => a.gen - b.gen);

        setGenStats(stats);
        setTotalPokemon(allPokemon.length);
        setTotalCaptured(stats.reduce((sum, s) => sum + s.captured, 0));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const overallPercent = totalPokemon > 0 ? (totalCaptured / totalPokemon) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="bg-red-600 shadow-lg sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={onBack}
              className="p-2 text-white hover:bg-red-700 rounded-full transition-colors"
              title="Back to Pokedex"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">My Collection</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
            <p className="text-slate-500 text-sm">Loading your collection…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* OVERALL SUMMARY CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Overall Progress</h2>
                  <p className="text-sm text-slate-500">Across all generations</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  {totalCaptured} / {totalPokemon} Captured
                </div>
              </div>
              <ProgressBar percent={overallPercent} colorClass="from-red-600 to-red-400" />
              <p className="text-right text-xs text-slate-400 mt-1">{overallPercent.toFixed(1)}%</p>
            </div>

            {/* PER-GENERATION CARDS */}
            {genStats.length === 0 ? (
              <div className="text-center py-16 text-slate-400">No Pokemon data found.</div>
            ) : (
              <div className="grid gap-4">
                {genStats.map(({ gen, name, total, captured }) => {
                  const pct = total > 0 ? (captured / total) * 100 : 0;
                  const colors = GEN_COLORS[gen] ?? { bar: 'from-slate-500 to-slate-400', badge: 'bg-slate-100 text-slate-700' };
                  const isComplete = captured === total && total > 0;

                  return (
                    <div
                      key={gen}
                      className={`bg-white rounded-2xl shadow-sm border p-5 transition-all hover:shadow-md ${
                        isComplete ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {isComplete && (
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-800">{name}</h3>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colors.badge}`}>
                          {captured} / {total}
                        </span>
                      </div>

                      <ProgressBar percent={pct} colorClass={colors.bar} />

                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-slate-400">
                          {pct.toFixed(1)}% complete
                        </p>
                        {isComplete && (
                          <span className="text-xs font-semibold text-emerald-600">✓ Complete!</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
