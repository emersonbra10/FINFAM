import React from 'react';

export interface InputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  className?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: any;
  onChange?: (e: any) => void;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  name?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  className = '',
  id,
  type = 'text',
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className={`
            w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white
            placeholder:text-slate-500
            focus:bg-white/10 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
            outline-none transition-all
            ${error ? 'border-rose-500/50' : 'border-white/10'}
            ${icon ? 'pl-10' : ''}
            ${className}
          `.trim()}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] text-rose-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-slate-500">{hint}</p>
      )}
    </div>
  );
}
