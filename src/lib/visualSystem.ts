// src/lib/visualSystem.ts
// Centralized mapping for colors based on mood or red flag category.
// These colors must match the variables in index.css (bg, ink, accent, positive, brand, purple, blue)

export const MOOD_COLORS: Record<string, string> = {
  sad: '#00B4D8', // blue
  angry: '#FF3366', // accent
  relieved: '#00E676', // positive
  numb: '#888888', // greyish
  nostalgic: '#9D4EDD', // purple
  hopeful: '#FFDF00', // brand
  spiraling: '#FF3366', // accent
  default: '#FFDF00', // brand
};

export const MOOD_TAILWIND: Record<string, string> = {
  sad: 'bg-blue text-white',
  angry: 'bg-accent text-white',
  relieved: 'bg-positive text-ink',
  numb: 'bg-ink/20 text-ink',
  nostalgic: 'bg-purple text-ink',
  hopeful: 'bg-brand text-ink',
  spiraling: 'bg-accent text-white',
  default: 'bg-brand text-ink',
};

export const FLAG_COLORS: Record<string, string> = {
  'love bombing': '#FF3366',
  'gaslighting': '#9D4EDD',
  'inconsistency': '#FFDF00',
  'disrespect': '#FF3366',
  'breadcrumbing': '#00B4D8',
  'avoidance': '#888888',
  'manipulation': '#9D4EDD',
  default: '#9D4EDD',
};

export function getMoodColor(mood: string): string {
  return MOOD_COLORS[mood.toLowerCase()] || MOOD_COLORS.default;
}

export function getMoodTailwind(mood: string): string {
  return MOOD_TAILWIND[mood.toLowerCase()] || MOOD_TAILWIND.default;
}

export function getFlagColor(category: string): string {
  return FLAG_COLORS[category.toLowerCase()] || FLAG_COLORS.default;
}
