/**
 * Material icon options for bill categories.
 */
export const ICON_OPTIONS = [
  'home', 'bolt', 'wifi', 'apartment', 'water_drop', 'local_gas_station',
  'school', 'medical_services', 'fitness_center', 'pets', 'phone_android',
  'credit_card', 'savings', 'shopping_cart', 'restaurant', 'directions_car',
  'flight', 'local_hospital', 'child_care', 'work', 'build', 'brush',
  'music_note', 'sports_esports', 'movie', 'book',
];

/**
 * Credit card color classes for card rendering.
 */
export const CARD_COLOR_CLASSES: Record<string, { gradient: string; accent: string }> = {
  purple: {
    gradient: 'from-violet-700 via-purple-600 to-indigo-800',
    accent: 'bg-purple-400/20',
  },
  orange: {
    gradient: 'from-orange-600 via-amber-500 to-yellow-600',
    accent: 'bg-amber-400/20',
  },
  blue: {
    gradient: 'from-blue-700 via-cyan-600 to-sky-600',
    accent: 'bg-cyan-400/20',
  },
  emerald: {
    gradient: 'from-emerald-700 via-teal-600 to-green-600',
    accent: 'bg-emerald-400/20',
  },
  rose: {
    gradient: 'from-rose-700 via-pink-600 to-fuchsia-700',
    accent: 'bg-rose-400/20',
  },
  dark: {
    gradient: 'from-slate-800 via-gray-700 to-zinc-800',
    accent: 'bg-slate-400/20',
  },
};

/**
 * Achievement badge color classes.
 */
export const ACHIEVEMENT_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  indigo: {
    bg: 'bg-indigo-500/15',
    border: 'border-indigo-500/30',
    text: 'text-indigo-300',
    glow: 'shadow-indigo-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/10',
  },
  amber: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/10',
  },
  rose: {
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/30',
    text: 'text-rose-300',
    glow: 'shadow-rose-500/10',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500/15',
    border: 'border-fuchsia-500/30',
    text: 'text-fuchsia-300',
    glow: 'shadow-fuchsia-500/10',
  },
};

/**
 * Preset images for savings goals.
 */
export const GOAL_IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1575986767340-5d17ae767ab0?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=200&fit=crop',
];

/**
 * Available avatar URLs for user registration.
 */
export const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Helena&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bia&backgroundColor=d1f4d9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=ffefd5',
];

/**
 * Credit card brand options.
 */
export const CARD_BRANDS = [
  { value: 'Visa', label: 'Visa' },
  { value: 'Mastercard', label: 'Mastercard' },
  { value: 'Elo', label: 'Elo' },
  { value: 'Amex', label: 'American Express' },
  { value: 'Outros', label: 'Outros' },
];

/**
 * Credit card color options.
 */
export const CARD_COLORS = [
  { value: 'purple', label: 'Roxo' },
  { value: 'orange', label: 'Laranja' },
  { value: 'blue', label: 'Azul' },
  { value: 'emerald', label: 'Verde' },
  { value: 'rose', label: 'Rosa' },
  { value: 'dark', label: 'Escuro' },
];
