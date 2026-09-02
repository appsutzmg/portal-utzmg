'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFirstName } from '@/lib/user-profile';
import { AppCard, ApplicationItem } from '@/components/AppCard';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Search,
  LayoutGrid,
  PlusCircle,
  Info,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { PORTAL_ADMIN_EMAIL } from '@/lib/access-request-messages';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const fetchApplications = async () => {
    setIsLoadingApps(true);
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setApplications(data.applications || []);
        }
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((app) => {
      if (app.category) set.add(app.category);
    });
    return ['TODAS', ...Array.from(set)];
  }, [applications]);

  // Filtered applications based on category and search query
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesCategory =
        selectedCategory === 'TODAS' ||
        app.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.code.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [applications, selectedCategory, searchQuery]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-utzmg-green border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Cargando aplicaciones autorizadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Banner compacto institucional */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-emerald-100/80 dark:border-emerald-900/50 bg-white dark:bg-gray-900 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,104,55,0.08)_0%,_transparent_55%),linear-gradient(135deg,#f0fdf4_0%,#ffffff_45%,#f8fafc_100%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(0,104,55,0.15)_0%,_transparent_55%),linear-gradient(135deg,#052e16_0%,#111827_45%,#030712_100%)]" />
        <div className="absolute -right-6 -top-10 h-28 w-28 rounded-full bg-utzmg-green/10 blur-2xl" />
        <div className="absolute -bottom-8 left-1/3 h-24 w-24 rounded-full bg-emerald-200/20 blur-2xl" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-utzmg-gradient" />

        <div className="relative flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <UserAvatar
              name={user.name}
              avatarUrl={user.avatarUrl}
              size="lg"
              className="ring-2 ring-white shadow-md shrink-0"
            />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">
                Hola, {getFirstName(user.name)}
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                {filteredApps.length}{' '}
                {filteredApps.length === 1 ? 'aplicación disponible' : 'aplicaciones disponibles'}{' '}
                para tu perfil
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end sm:max-w-[50%]">
            <span className="mr-1 hidden text-[10px] font-semibold uppercase tracking-wide text-gray-400 sm:inline">
              Perfiles
            </span>
            {(user.roleLabels?.length ? user.roleLabels : user.roles).map((label) => (
              <span
                key={label}
                className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-utzmg-darkgreen"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Categories */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-utzmg-green focus:border-transparent transition-all shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-utzmg-darkgreen text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}

          {/* Admin shortcut button */}
          {user.isAdmin && (
            <Link
              href="/admin/apps"
              className="ml-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-utzmg-darkgreen border border-emerald-200 hover:bg-emerald-100 transition-all shrink-0 flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-utzmg-green" />
              <span>Administrar</span>
            </Link>
          )}
        </div>

      </div>

      {/* Applications Grid Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <LayoutGrid className="w-5 h-5 text-utzmg-green" />
          <span>Aplicaciones Disponibles</span>
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {filteredApps.length} {filteredApps.length === 1 ? 'módulo' : 'módulos'}
        </span>
      </div>

      {/* Applications Grid */}
      {isLoadingApps ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start md:items-stretch">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-pulse space-y-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
            No se encontraron aplicaciones
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {searchQuery
              ? `No hay aplicaciones que coincidan con "${searchQuery}". Intenta con otros términos.`
              : 'No cuentas con aplicaciones asignadas a tu rol actual o la categoría seleccionada no tiene elementos.'}
          </p>
          {!searchQuery && (
            <Link
              href="/solicitar-acceso"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-utzmg-green hover:bg-utzmg-darkgreen rounded-xl transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Solicitar acceso por correo
            </Link>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-semibold text-utzmg-green bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start md:items-stretch">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              userRoles={user.roles}
              isAdmin={user.isAdmin}
            />
          ))}
        </div>
      )}

      {/* Institutional Notice Footer */}
      <div className="mt-12 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 flex items-start space-x-3 text-xs text-gray-600 dark:text-gray-400">
        <Info className="w-4 h-4 text-utzmg-green shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Nota Institucional:</span>{' '}
          Las aplicaciones mostradas están vinculadas a tu cuenta institucional.{' '}
          <Link href="/solicitar-acceso" className="text-utzmg-green font-semibold underline hover:text-utzmg-darkgreen dark:hover:text-emerald-400">
            Solicita acceso
          </Link>{' '}
          a otra aplicación; el portal envía el correo directamente a{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{PORTAL_ADMIN_EMAIL}</span>.
        </div>
      </div>

    </div>
  );
}
