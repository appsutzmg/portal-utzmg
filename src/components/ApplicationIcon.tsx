'use client';

import React, { useState, useEffect } from 'react';
import { DynamicIcon } from './DynamicIcon';

interface ApplicationIconProps {
  icon: string;
  logoUrl?: string | null;
  className?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  iconClassName?: string;
  logoContainerStyle?: React.CSSProperties;
  fallbackStyle?: React.CSSProperties;
  iconColor?: string;
}

function normalizeLogoUrl(logoUrl?: string | null): string | null {
  if (!logoUrl || typeof logoUrl !== 'string') return null;
  const trimmed = logoUrl.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Muestra el logo de la app si existe; si no, el icono Lucide sobre fondo claro institucional. */
export function ApplicationIcon({
  icon,
  logoUrl,
  className = 'w-12 h-12 rounded-xl shrink-0',
  imgClassName = 'w-full h-full object-contain p-1',
  fallbackClassName = 'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
  iconClassName = 'w-6 h-6',
  logoContainerStyle,
  fallbackStyle,
  iconColor = '#006837',
}: ApplicationIconProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const resolvedLogo = normalizeLogoUrl(logoUrl);

  useEffect(() => {
    setLogoFailed(false);
  }, [resolvedLogo]);

  if (resolvedLogo && !logoFailed) {
    return (
      <div
        className={`${className} overflow-hidden flex items-center justify-center`}
        style={logoContainerStyle}
      >
        <img
          src={resolvedLogo}
          alt=""
          className={imgClassName}
          onError={() => setLogoFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={fallbackClassName} style={fallbackStyle}>
      <DynamicIcon
        name={icon}
        className={iconClassName}
        color={iconColor}
        strokeWidth={2}
        aria-hidden
      />
    </div>
  );
}
