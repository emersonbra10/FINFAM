import React from 'react';

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  id?: string;
  padding?: string;
  style?: React.CSSProperties;
  onClick?: (e: any) => void;
  [key: string]: any;
}

export default function Card({
  children,
  className = '',
  interactive = false,
  id,
  padding = 'p-6',
  ...props
}: CardProps) {
  return (
    <div
      id={id}
      className={`
        glass-card rounded-2xl ${padding} shadow-2xl border border-white/10
        ${interactive ? 'hover:border-white/20 hover:shadow-indigo-500/5 cursor-pointer' : ''}
        transition-all
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
