import { useState, useEffect } from 'react';
import { pokemonService } from '../services/pokemonService';
import type { CollectionStats } from '../types/pokemon';
import { ProgressBar } from './ProgressBar';
import { typeColors } from '../utils/pokemon';

export function CollectionPage() {
    const [stats, setStats] = useState<CollectionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = () => {
            pokemonService.getStats()
                .then(setStats)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        };

        fetchStats();

        // Real-time updates via interval polling every 3 seconds
        const intervalId = setInterval(fetchStats, 3000);

        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div className="loading-spinner"><div className="pokeball-spinner" /></div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!stats) return null;

    const percentage = stats.totalPokemon > 0
        ? ((stats.capturedCount / stats.totalPokemon) * 100).toFixed(1)
        : "0.0";

    return (
        <div className="collection-page">
            <h2>My Collection</h2>

            {/* Overall Progress */}
            <p className="overall-stats" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                {stats.capturedCount} / {stats.totalPokemon} Captured ({percentage}%)
            </p>

            <div className="stats-grid">
                {/* Generation Breakdown */}
                <div className="stats-card">
                    <h3>By Generation</h3>
                    <div className="stats-list">
                        {Object.entries(stats.capturedByGeneration || {}).map(([gen, count]) => (
                            <div key={gen} className="stat-item">
                                <span className="stat-name">Gen {gen}</span>
                                <ProgressBar
                                    current={count}
                                    total={getGenTotal(gen)}
                                    color="#2196F3"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Type Breakdown */}
                <div className="stats-card">
                    <h3>By Type</h3>
                    <div className="stats-list">
                        {Object.entries(stats.capturedByType || {}).map(([type, count]) => (
                            <div key={type} className="stat-item">
                                <span className="stat-name" style={{ color: typeColors[type] || 'black' }}>{type}</span>
                                <ProgressBar
                                    current={count}
                                    total={50}
                                    color={typeColors[type] || '#ccc'}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getGenTotal(gen: string): number {
    const totals: Record<string, number> = {
        '1': 151, '2': 100, '3': 135, '4': 107, '5': 156,
        '6': 72, '7': 88, '8': 96, '9': 120 // Approx
    };
    return totals[gen] || 100;
}
