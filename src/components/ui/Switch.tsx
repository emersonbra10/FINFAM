import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: SwitchProps) {
  const switchId = id || (label ? `switch-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <label
      htmlFor={switchId}
      className={`flex items-center justify-between gap-3 group ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
    >
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <p className="text-xs font-semibold text-white group-hover:text-indigo-200 transition-colors">
              {label}
            </p>
          )}
          {description && (
            <p className="text-[10px] text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          w-10 h-6 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer shrink-0
          ${checked ? 'bg-indigo-600' : 'bg-white/10'}
        `}
      >
        <div
          className={`
            w-5 h-5 rounded-full bg-white shadow-md transform duration-200
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  );
}
