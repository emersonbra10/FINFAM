import { CategoryType } from '../types';

/**
 * Maps a CategoryType to its corresponding Material Symbols icon name.
 */
export function getCategoryIcon(category: CategoryType | string): string {
  switch (category) {
    case 'Moradia': return 'home';
    case 'Alimentação': return 'restaurant';
    case 'Lazer': return 'sports_esports';
    case 'Assinaturas': return 'subscriptions';
    case 'Transporte': return 'directions_car';
    case 'Outros': return 'more_horiz';
    default: return 'category';
  }
}

/**
 * Maps a CategoryType to its Tailwind color classes.
 */
export function getCategoryColor(category: CategoryType | string): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Moradia':
      return { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/20' };
    case 'Alimentação':
      return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/20' };
    case 'Lazer':
      return { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', border: 'border-fuchsia-500/20' };
    case 'Assinaturas':
      return { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/20' };
    case 'Transporte':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/20' };
    case 'Outros':
    default:
      return { bg: 'bg-slate-500/15', text: 'text-slate-300', border: 'border-slate-500/20' };
  }
}

/**
 * All available transaction/bill categories.
 */
export const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: 'Moradia', label: 'Moradia' },
  { value: 'Alimentação', label: 'Alimentação' },
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Assinaturas', label: 'Assinaturas' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Outros', label: 'Outros' },
];
