import React from 'react';

export interface ProgressBarProps {
    value: number;
    max?: number;
    color?: string;
    height?: string;
    showLabel?: boolean;
    className?: string;
    ariaLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    max = 100,
    color = 'bg-blue-500',
    height = 'h-2',
    showLabel = false,
    className = '',
    ariaLabel = 'Progress'
}) => {
    // Clamp value between 0 and max
    const safeValue = Math.min(Math.max(value, 0), max);
    const percentage = Math.round((safeValue / max) * 100);

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-slate-700">{ariaLabel}</span>
                    <span className="text-sm font-medium text-slate-700">{percentage}%</span>
                </div>
            )}
            <div
                className={`w-full bg-slate-200 rounded-full overflow-hidden ${height}`}
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={ariaLabel}
            >
                <div
                    className={`${height} ${color} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
