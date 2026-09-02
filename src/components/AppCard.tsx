'use client';

import React, { useState } from 'react';
import { ApplicationIcon } from './ApplicationIcon';
import { ExternalLink, ArrowRight, Shield, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { getAppCardTheme } from '@/lib/app-card-theme';

export interface ApplicationItem {
  id: string;
  code: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  logoUrl?: string | null;
  category: string;
  authType: string;
  openIn: string;
  orderIndex: number;
  status: string;
  isVisible: boolean;
  requiredRoles: string;
}

interface AppCardProps {
  app: ApplicationItem;
  userRoles?: string[];
  isAdmin?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ app, userRoles = [], isAdmin = false }) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const theme = getAppCardTheme(app.code);
  const isMaintenance = app.status === 'MAINTENANCE';
  const isInactive = app.status === 'INACTIVE';

  const frameColor = isMaintenance ? '#d97706' : isInactive ? '#9ca3af' : theme.border;
  const accentColor = isMaintenance ? '#d97706' : isInactive ? '#6b7280' : theme.accent;
  const accentDark = isMaintenance ? '#b45309' : isInactive ? '#4b5563' : theme.accentDark;
  const accentLight = isMaintenance ? '#fffbeb' : isInactive ? '#f3f4f6' : theme.accentLight;
  const titleColor = isMaintenance ? '#92400e' : isInactive ? '#374151' : theme.title;

  const requiredRolesList = app.requiredRoles
    ? app.requiredRoles.split(',').map((r) => r.trim().toLowerCase())
    : [];

  const hasRoleAccess =
    isAdmin ||
    requiredRolesList.length === 0 ||
    userRoles.some((r) => requiredRolesList.includes(r.toLowerCase()));

  const handleLaunch = async () => {
    if (isMaintenance && !isAdmin) {
      setErrorMessage('Esta aplicación se encuentra en mantenimiento programado.');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setIsLaunching(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/launch`, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.ok) {
        const target = app.openIn === '_self' ? '_self' : '_blank';
        window.open(data.launchUrl, target, 'noopener,noreferrer');
      } else {
        setErrorMessage(data.message || 'Error al iniciar la aplicación');
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } catch (err) {
      console.error('Error launching app:', err);
      setErrorMessage('Error de conexión al abrir la aplicación');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg ${isInactive ? 'opacity-65' : ''}`}
      style={{
        borderWidth: 3,
        borderStyle: 'solid',
        borderColor: frameColor,
      }}
    >
      {/* Franja superior del color de la app */}
      <div className="h-2 w-full shrink-0" style={{ backgroundColor: accentColor }} />

      <div className="flex flex-1 flex-col p-5">
        {/* Encabezado: icono + badges */}
        <div className="mb-4 flex items-start gap-4">
          <ApplicationIcon
            icon={app.icon}
            logoUrl={app.logoUrl}
            className="h-[72px] w-[72px] shrink-0 rounded-2xl shadow-md"
            imgClassName="h-full w-full object-contain p-1.5"
            logoContainerStyle={{
              backgroundColor: '#ffffff',
              border: `2px solid ${frameColor}`,
            }}
            fallbackClassName="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl shadow-md text-white"
            fallbackStyle={{ backgroundColor: accentColor }}
            iconClassName="h-9 w-9"
          />

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: accentLight, color: titleColor }}
              >
                {app.category}
              </span>

              {isMaintenance ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  <AlertTriangle className="h-3 w-3" />
                  Mantenimiento
                </span>
              ) : isInactive ? (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                  Inactiva
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Operativa
                </span>
              )}
            </div>

            <h3
              className="text-lg font-bold leading-snug"
              style={{ color: titleColor }}
            >
              {app.name}
            </h3>
          </div>
        </div>

        <p className="flex-1 text-sm leading-relaxed text-gray-700 line-clamp-3">
          {app.description}
        </p>

        {requiredRolesList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            <span className="mr-1 flex items-center text-[11px] text-gray-500">
              <Shield className="mr-0.5 h-3 w-3" /> Roles:
            </span>
            {requiredRolesList.map((role) => (
              <span
                key={role}
                className="rounded px-1.5 py-0.5 text-[10px] font-medium capitalize"
                style={{ backgroundColor: accentLight, color: titleColor }}
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 flex items-center space-x-1.5 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          onClick={handleLaunch}
          disabled={isLaunching || (!hasRoleAccess && !isAdmin)}
          className={`mt-4 flex w-full items-center justify-center space-x-2 rounded-xl py-2.5 px-4 text-sm font-semibold transition-all shadow-sm ${
            !hasRoleAccess && !isAdmin
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : isMaintenance && !isAdmin
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : isInactive
              ? 'cursor-not-allowed bg-gray-200 text-gray-500'
              : 'text-white group-hover:shadow-md'
          }`}
          style={
            !hasRoleAccess && !isAdmin
              ? undefined
              : isMaintenance && !isAdmin
              ? undefined
              : isInactive
              ? undefined
              : { backgroundColor: accentColor }
          }
          onMouseEnter={(e) => {
            if (!isLaunching && hasRoleAccess && !isInactive && !(isMaintenance && !isAdmin)) {
              e.currentTarget.style.backgroundColor = accentDark;
            }
          }}
          onMouseLeave={(e) => {
            if (!isLaunching && hasRoleAccess && !isInactive && !(isMaintenance && !isAdmin)) {
              e.currentTarget.style.backgroundColor = accentColor;
            }
          }}
        >
          {isLaunching ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : !hasRoleAccess && !isAdmin ? (
            <>
              <Lock className="h-4 w-4" />
              <span>Sin Acceso</span>
            </>
          ) : (
            <>
              <span>Ingresar</span>
              {app.openIn === '_blank' ? (
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              ) : (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
