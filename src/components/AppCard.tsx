'use client';

import React, { useState } from 'react';
import { ApplicationIcon } from './ApplicationIcon';
import { ExternalLink, ArrowRight, Shield, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';

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

  const isMaintenance = app.status === 'MAINTENANCE';
  const isInactive = app.status === 'INACTIVE';

  // Role permissions check
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

  // Color theme by category
  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'académica':
      case 'academica':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'gestión':
      case 'gestion':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'servicios':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'administración':
      case 'administracion':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className={`group relative bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
      isMaintenance
        ? 'border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white'
        : isInactive
        ? 'border-gray-200 opacity-60'
        : 'border-gray-200/90 hover:border-utzmg-green/40 hover:shadow-utzmg-hover'
    }`}>
      
      {/* Top Banner / Category & Status */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getCategoryBadgeClass(app.category)}`}>
            {app.category}
          </span>

          {isMaintenance ? (
            <span className="flex items-center space-x-1 px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full border border-amber-200">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>Mantenimiento</span>
            </span>
          ) : isInactive ? (
            <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              Inactiva
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Operativa</span>
            </span>
          )}
        </div>

        {/* Icon & Title */}
        <div className="flex items-start space-x-4 mb-3">
          <ApplicationIcon
            icon={app.icon}
            logoUrl={app.logoUrl}
            fallbackClassName="w-12 h-12 rounded-xl bg-gradient-to-br from-utzmg-green to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-snug group-hover:text-utzmg-green transition-colors">
              {app.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              ID: {app.code}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mt-2">
          {app.description}
        </p>
      </div>

      {/* Bottom Section / Roles & Action Button */}
      <div className="p-6 pt-0 mt-auto">
        {/* Roles list tags (if restricted) */}
        {requiredRolesList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
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

        {/* Error message notice */}
        {errorMessage && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Launch Button */}
        <button
          onClick={handleLaunch}
          disabled={isLaunching || (!hasRoleAccess && !isAdmin)}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm ${
            !hasRoleAccess && !isAdmin
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isMaintenance && !isAdmin
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              : 'bg-utzmg-green hover:bg-utzmg-darkgreen text-white group-hover:shadow-md'
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
