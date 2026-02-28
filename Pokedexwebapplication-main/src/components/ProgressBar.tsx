import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
    percent: number;
    colorClass?: string; // accepts Tailwind bg or gradient classes
    height?: string;
    label?: string;
}

/** Reusable animated progress bar used across collection and stats views. */
export const ProgressBar: React.FC<ProgressBarProps> = ({ percent, colorClass = 'from-red-600 to-red-400', height = 'h-3', label }) => {
    const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setWidth(safePercent), 30);
        return () => clearTimeout(timer);
    }, [safePercent]);

    const isGradient = colorClass.includes('from-');
    const background = isGradient ? `bg-gradient-to-r ${colorClass}` : colorClass;

    return (
        <div className="w-full">
            {label && <div className="text-xs font-semibold text-slate-500 mb-1">{label}</div>}
            <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`} role="progressbar" aria-valuenow={safePercent} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'progress'}>
                <div
                    className={`${height} ${background} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;