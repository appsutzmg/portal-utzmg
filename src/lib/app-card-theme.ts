/** Colores por aplicación — valores hex para marco, botón e icono (no dependen de Tailwind purge). */

export interface AppCardTheme {
  id: string;
  label: string;
  border: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  title: string;
}

export const APP_CARD_THEMES: AppCardTheme[] = [
  {
    id: 'forest',
    label: 'Verde',
    border: '#059669',
    accent: '#059669',
    accentDark: '#047857',
    accentLight: '#ecfdf5',
    title: '#065f46',
  },
  {
    id: 'ocean',
    label: 'Azul',
    border: '#4f46e5',
    accent: '#4f46e5',
    accentDark: '#4338ca',
    accentLight: '#eef2ff',
    title: '#3730a3',
  },
  {
    id: 'violet',
    label: 'Violeta',
    border: '#7c3aed',
    accent: '#7c3aed',
    accentDark: '#6d28d9',
    accentLight: '#f5f3ff',
    title: '#5b21b6',
  },
  {
    id: 'amber',
    label: 'Ámbar',
    border: '#d97706',
    accent: '#d97706',
    accentDark: '#b45309',
    accentLight: '#fffbeb',
    title: '#92400e',
  },
  {
    id: 'rose',
    label: 'Rosa',
    border: '#e11d48',
    accent: '#e11d48',
    accentDark: '#be123c',
    accentLight: '#fff1f2',
    title: '#9f1239',
  },
  {
    id: 'cyan',
    label: 'Cielo',
    border: '#0284c7',
    accent: '#0284c7',
    accentDark: '#0369a1',
    accentLight: '#f0f9ff',
    title: '#075985',
  },
];

const KNOWN_APP_THEMES: Record<string, number> = {
  'proyectos-integradores': 1, // azul
  tutorias: 0, // verde
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
