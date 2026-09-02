/** Paleta de acentos por aplicación para distinguir tarjetas en el dashboard. */

export interface AppCardTheme {
  id: string;
  header: string;
  button: string;
  buttonDisabled?: string;
  titleHover: string;
  borderHover: string;
  fallbackIcon: string;
}

export const APP_CARD_THEMES: AppCardTheme[] = [
  {
    id: 'forest',
    header: 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700',
    button: 'bg-teal-700 hover:bg-teal-800 text-white',
    titleHover: 'group-hover:text-teal-700',
    borderHover: 'hover:border-teal-300/80',
    fallbackIcon: 'text-emerald-700',
  },
  {
    id: 'ocean',
    header: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800',
    button: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    titleHover: 'group-hover:text-indigo-700',
    borderHover: 'hover:border-indigo-300/80',
    fallbackIcon: 'text-indigo-700',
  },
  {
    id: 'violet',
    header: 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700',
    button: 'bg-violet-700 hover:bg-violet-800 text-white',
    titleHover: 'group-hover:text-violet-700',
    borderHover: 'hover:border-violet-300/80',
    fallbackIcon: 'text-violet-700',
  },
  {
    id: 'amber',
    header: 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    titleHover: 'group-hover:text-amber-700',
    borderHover: 'hover:border-amber-300/80',
    fallbackIcon: 'text-amber-700',
  },
  {
    id: 'rose',
    header: 'bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
    titleHover: 'group-hover:text-rose-700',
    borderHover: 'hover:border-rose-300/80',
    fallbackIcon: 'text-rose-700',
  },
  {
    id: 'cyan',
    header: 'bg-gradient-to-br from-cyan-600 via-sky-600 to-blue-700',
    button: 'bg-sky-700 hover:bg-sky-800 text-white',
    titleHover: 'group-hover:text-sky-700',
    borderHover: 'hover:border-sky-300/80',
    fallbackIcon: 'text-sky-700',
  },
];

/** Temas fijos para apps institucionales conocidas (consistencia visual). */
const KNOWN_APP_THEMES: Record<string, number> = {
  'proyectos-integradores': 1, // ocean — azul
  tutorias: 0, // forest — verde institucional
};

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getAppCardTheme(code: string): AppCardTheme {
  const index =
    KNOWN_APP_THEMES[code] ?? hashCode(code) % APP_CARD_THEMES.length;
  return APP_CARD_THEMES[index];
}
