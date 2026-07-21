import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: string;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  danger: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  info: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  neutral: 'bg-white/5 text-slate-300 border-white/10',
};

export default function Badge({
  children,
  variant = 'neutral',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
        text-[9px] font-bold tracking-wider uppercase border
        ${variantClasses[variant]}
        ${className}
      `.trim()}
    >
      {icon && (
        <span className="material-symbols-outlined text-[11px]">{icon}</span>
      )}
      {children}
    </span>
  );
}
