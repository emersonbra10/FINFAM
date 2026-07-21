import React from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface AvatarProps {
  src: string;
  alt: string;
  size?: AvatarSize;
  className?: string;
  border?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export default function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
  border = true,
}: AvatarProps) {
  return (
    <img
      className={`
        ${sizeClasses[size]} rounded-full object-cover
        ${border ? 'border border-white/10' : ''}
        ${className}
      `.trim()}
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
    />
  );
}
