import React from 'react';
import { DynamicIcon } from './DynamicIcon';

interface ApplicationIconProps {
  icon: string;
  logoUrl?: string | null;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

/** Muestra el logo de la app si existe; si no, el icono Lucide. */
export function ApplicationIcon({
  icon,
  logoUrl,
  className = 'w-12 h-12 rounded-xl shrink-0',
  imgClassName = 'w-full h-full object-contain p-1',
  fallbackClassName = 'w-12 h-12 rounded-xl bg-gradient-to-br from-utzmg-green to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md',
}: ApplicationIconProps) {
  if (logoUrl) {
    return (
      <div
        className={`${className} bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center`}
      >
        <img src={logoUrl} alt="" className={imgClassName} />
      </div>
    );
  }

  return (
    <div className={fallbackClassName}>
      <DynamicIcon name={icon} className="w-6 h-6" />
    </div>
  );
}
