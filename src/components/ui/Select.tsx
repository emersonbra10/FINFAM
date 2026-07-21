import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function Select({
  label,
  options,
  placeholder,
  error,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full bg-white/5 border rounded-xl px-3 py-2.5 text-sm text-white
          focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
          outline-none transition-all cursor-pointer appearance-none
          ${error ? 'border-rose-500/50' : 'border-white/10'}
          ${className}
        `.trim()}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-slate-900 text-slate-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[10px] text-rose-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
