'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFirstName } from '@/lib/user-profile';
import { AppCard, ApplicationItem } from '@/components/AppCard';
import { 
  Search, 
  LayoutGrid, 
  Sparkles, 
  PlusCircle, 
  Filter, 
  SlidersHorizontal, 
  GraduationCap, 
  ShieldCheck, 
  ExternalLink,
  Info
} from 'lucide-react';
import Link from 'next/link';

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
      
      {/* Institutional Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-utzmg-gradient text-white p-8 sm:p-10 mb-8 shadow-utzmg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4 text-emerald-50">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Portal Institucional UTZMG</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hola, {getFirstName(user.name)}
          </h1>

          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Bienvenido al portal centralizado de aplicaciones y servicios de la Universidad Tecnológica de la Zona Metropolitana de Guadalajara.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs text-emerald-200">Perfiles activos:</span>
            {user.roles.map((r) => (
              <span
                key={r}
                className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm uppercase tracking-wider"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none hidden lg:block">
          <div className="w-96 h-96 rounded-full border-8 border-white" />
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
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green focus:border-transparent transition-all shadow-sm"
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
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
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
        <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <LayoutGrid className="w-5 h-5 text-utzmg-green" />
          <span>Aplicaciones Disponibles</span>
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {filteredApps.length} {filteredApps.length === 1 ? 'módulo' : 'módulos'}
        </span>
      </div>

      {/* Applications Grid */}
      {isLoadingApps ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-10 bg-gray-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No se encontraron aplicaciones
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            {searchQuery
              ? `No hay aplicaciones que coincidan con "${searchQuery}". Intenta con otros términos.`
              : 'No cuentas con aplicaciones asignadas a tu rol actual o la categoría seleccionada no tiene elementos.'}
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="mt-12 p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start space-x-3 text-xs text-gray-600">
        <Info className="w-4 h-4 text-utzmg-green shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-gray-800">Nota Institucional:</span> Las aplicaciones mostradas se encuentran vinculadas a tu cuenta institucional. Si necesitas acceso a una aplicación adicional o cambio de rol, escribe a <a href="mailto:apps@utzmg.edu.mx" className="text-utzmg-green font-semibold underline hover:text-utzmg-darkgreen">apps@utzmg.edu.mx</a>.
        </div>
      </div>

    </div>
  );
}
