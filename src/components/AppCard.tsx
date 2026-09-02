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
  status: string; // 'ACTIVE', 'MAINTENANCE', 'INACTIVE'
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
      const res = await fetch(`/api/applications/${app.id}/launch`, {
        method: 'POST',
      });

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

  const cardBorderClass = isMaintenance
    ? 'border-amber-200/80'
    : isInactive
    ? 'border-gray-200 opacity-60'
    : `border-gray-200/90 ${theme.borderHover} hover:shadow-lg`;

  const headerClass = isMaintenance
    ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600'
    : isInactive
    ? 'bg-gradient-to-br from-gray-400 to-gray-500'
    : theme.header;

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden shadow-sm ${cardBorderClass}`}
    >
      {/* Cabecera con color distintivo por aplicación */}
      <div className={`relative h-28 ${headerClass} px-5 pt-4 pb-14`}>
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-white/20 text-white border border-white/25 backdrop-blur-sm">
            {app.category}
          </span>

          {isMaintenance ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-medium bg-white/90 text-amber-800 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              <span>Mantenimiento</span>
            </span>
          ) : isInactive ? (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-white/90 text-gray-600 rounded-full">
              Inactiva
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-medium bg-white/90 text-gray-700 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Operativa</span>
            </span>
          )}
        </div>

        {/* Logo grande — sobresale hacia el cuerpo de la tarjeta */}
        <div className="absolute left-5 -bottom-10">
          <ApplicationIcon
            icon={app.icon}
            logoUrl={app.logoUrl}
            className="w-20 h-20 rounded-2xl shadow-lg ring-4 ring-white"
            imgClassName="w-full h-full object-contain p-1.5"
            fallbackClassName={`w-20 h-20 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg ring-4 ring-white ${theme.fallbackIcon}`}
            iconClassName="w-9 h-9"
          />
        </div>
      </div>

      {/* Contenido */}
      <div className="px-5 pt-12 pb-5 flex flex-col flex-1">
        <h3
          className={`font-bold text-gray-900 text-lg leading-snug mb-2 transition-colors ${!isInactive && !isMaintenance ? theme.titleHover : ''}`}
        >
          {app.name}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1">
          {app.description}
        </p>

        {requiredRolesList.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            <span className="text-[11px] text-gray-400 flex items-center mr-1">
              <Shield className="w-3 h-3 mr-0.5" /> Roles:
            </span>
            {requiredRolesList.map((role) => (
              <span
                key={role}
                className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded capitalize"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          onClick={handleLaunch}
          disabled={isLaunching || (!hasRoleAccess && !isAdmin)}
          className={`w-full mt-4 py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm ${
            !hasRoleAccess && !isAdmin
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isMaintenance && !isAdmin
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : isInactive
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : `${theme.button} group-hover:shadow-md`
          }`}
        >
          {isLaunching ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : !hasRoleAccess && !isAdmin ? (
            <>
              <Lock className="w-4 h-4" />
              <span>Sin Acceso</span>
            </>
          ) : (
            <>
              <span>Ingresar</span>
              {app.openIn === '_blank' ? (
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
