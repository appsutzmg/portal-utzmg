import React from 'react';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  Compass,
  Database,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Grid,
  Laptop,
  Layers,
  LucideProps,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';

/** Mapa estático — evita que el tree-shaking de producción elimine iconos usados por nombre. */
const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ClipboardList,
  Compass,
  Database,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  Grid,
  Laptop,
  Layers,
  ShieldCheck,
  Users,
};

export const APP_ICON_NAMES = Object.keys(ICON_MAP).sort();

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const cleanName = name?.trim();
  const IconComponent = (cleanName && ICON_MAP[cleanName]) || Grid;

  return <IconComponent {...props} />;
};
