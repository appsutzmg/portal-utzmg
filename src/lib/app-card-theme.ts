/** Paleta institucional UTZMG — verde, gris y rojo en tonalidades suaves. */

export interface AppCardTheme {
  id: string;
  label: string;
  border: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  title: string;
  iconColor: string;
}

export const APP_CARD_THEMES: AppCardTheme[] = [
  {
    id: 'green',
    label: 'Verde UTZMG',
    border: '#7cb899',
    accent: '#006837',
    accentDark: '#004d28',
    accentLight: '#E8F5E9',
    title: '#004d28',
    iconColor: '#006837',
  },
  {
    id: 'gray',
    label: 'Gris UTZMG',
    border: '#cbd5e1',
    accent: '#64748b',
    accentDark: '#475569',
    accentLight: '#f1f5f9',
    title: '#334155',
    iconColor: '#475569',
  },
  {
    id: 'red',
    label: 'Rojo UTZMG',
    border: '#e8a8a8',
    accent: '#c53030',
    accentDark: '#9b2c2c',
    accentLight: '#fef2f2',
    title: '#742a2a',
    iconColor: '#c53030',
  },
];

const KNOWN_APP_THEMES: Record<string, number> = {
  tutorias: 0, // verde
  'proyectos-integradores': 1, // gris
};

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAppCardTheme(code: string): AppCardTheme {
  const index = KNOWN_APP_THEMES[code] ?? hashCode(code) % APP_CARD_THEMES.length;
  return APP_CARD_THEMES[index];
}
