import React from 'react';

interface ProgressBarProps {
  value: number; // 0–100
  height?: string;
  gradient?: boolean | string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  height = 'h-3',
  gradient = true,
  showLabel = false,
  label,
  className = '',
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  const gradientClass = typeof gradient === 'string'
    ? gradient
    : gradient
    ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'
    : 'bg-indigo-500';

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>{label || ''}</span>
          {showLabel && <span className="font-bold">{Math.round(clampedValue)}%</span>}
        </div>
      )}
      <div className={`w-full bg-white/5 ${height} rounded-full overflow-hidden border border-white/5`}>
        <div
          className={`${gradientClass} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
