import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: any) => void;
  title?: string;
  id?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/35 border border-indigo-500/30',
  secondary:
    'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 border border-rose-500/30',
  ghost:
    'bg-transparent hover:bg-white/5 text-slate-300 border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[11px] rounded-lg gap-1',
  md: 'px-4 py-2 text-xs rounded-xl gap-1.5',
  lg: 'px-5 py-2.5 text-xs rounded-xl gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  const iconEl = icon ? (
    <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
      {loading ? 'progress_activity' : icon}
    </span>
  ) : loading ? (
    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
  ) : null;

  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center font-bold tracking-wide uppercase
        active:scale-[0.97] transition-all select-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === 'left' && iconEl}
      {children}
      {iconPosition === 'right' && iconEl}
    </button>
  );
}
