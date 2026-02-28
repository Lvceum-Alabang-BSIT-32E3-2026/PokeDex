import React from 'react';
import { motion } from 'motion/react';

interface StatBarProps {
    /** Stat name, e.g. "hp", "attack", "special-attack" */
    label: string;
    /** Raw stat value (0–255) */
    value: number;
    /** Maximum possible stat value for scaling (default 255) */
    max?: number;
}

/** Maps a stat name to a Tailwind background colour class. */
const statColor = (name: string): string => {
    const colorMap: Record<string, string> = {
        hp: 'bg-green-500',
        attack: 'bg-red-500',
        defense: 'bg-blue-500',
        'special-attack': 'bg-purple-500',
        'special-defense': 'bg-indigo-500',
        speed: 'bg-pink-500',
    };
    return colorMap[name.toLowerCase()] ?? 'bg-slate-400';
};

/** Human-readable display label for a stat key. */
const statLabel = (name: string): string => {
    const labelMap: Record<string, string> = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def',
        speed: 'Speed',
    };
    return labelMap[name.toLowerCase()] ?? name.replace('-', ' ');
};

export const StatBar: React.FC<StatBarProps> = ({ label, value, max = 255 }) => {
    const safeValue = Math.min(Math.max(value, 0), max);
    const percent = (safeValue / max) * 100;
    const displayLabel = statLabel(label);
    const color = statColor(label);

    return (
        <div className="mb-3 last:mb-0">
            {/* Label row */}
            <div className="flex justify-between items-center mb-1">
                <span
                    className="text-xs font-bold text-slate-500 uppercase tracking-wider w-20"
                    aria-hidden="true"
                >
                    {displayLabel}
                </span>
                <span
                    className="text-xs font-bold text-slate-700 w-8 text-right tabular-nums"
                    aria-hidden="true"
                >
                    {value}
                </span>
            </div>

            {/* Progress bar */}
            <div
                role="progressbar"
                aria-label={`${displayLabel}: ${value} out of ${max}`}
                aria-valuenow={safeValue}
                aria-valuemin={0}
                aria-valuemax={max}
                className="h-2.5 bg-slate-100 rounded-full overflow-hidden"
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
};

export default StatBar;
