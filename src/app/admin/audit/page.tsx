'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  History, 
  Search, 
  Filter, 
  Shield, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface AuditLogItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  targetResource: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedDetails, setSelectedDetails] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/admin/audit', window.location.origin);
      if (actionFilter !== 'ALL') url.searchParams.set('action', actionFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setLogs(data.logs || []);
        }
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchLogs();
    }
  }, [user, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.startsWith('AUTH_LOGIN_SUCCESS')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.startsWith('AUTH_LOGIN_REJECTED') || action.includes('DENIED')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (action.startsWith('APP_LAUNCH')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (action.startsWith('APP_CREATE') || action.startsWith('APP_UPDATE')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
  };

  if (authLoading || !user?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-utzmg-green uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Seguridad y Cumplimiento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Bitácora de Auditoría Institucional
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Registro cronológico inmutable de accesos, inicios de sesión y modificaciones de aplicaciones.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center space-x-1.5 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-utzmg-green' : ''}`} />
          <span>Actualizar Registro</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por correo, recurso o detalle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
          />
        </form>

        {/* Action Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-utzmg-green w-full sm:w-auto"
          >
            <option value="ALL">Todas las Acciones</option>
            <option value="AUTH_LOGIN_SUCCESS">Inicios de Sesión</option>
            <option value="AUTH_LOGIN_REJECTED">Inicios Rechazados</option>
            <option value="APP_LAUNCH">Lanzamiento de Aplicaciones</option>
            <option value="APP_CREATE">Creación de Aplicaciones</option>
            <option value="APP_UPDATE">Modificación de Aplicaciones</option>
            <option value="APP_DELETE">Eliminación de Aplicaciones</option>
            <option value="ROLE_UPDATE">Modificación de Roles</option>
            <option value="ROLE_CREATE">Creación de Roles</option>
            <option value="ROLE_DELETE">Eliminación de Roles</option>
          </select>
        </div>

      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-xs text-gray-500">
          Cargando registros de auditoría...
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-xs text-gray-500">
          No hay registros que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Fecha / Hora</th>
                  <th className="py-3.5 px-4">Acción</th>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Recurso Afectado</th>
                  <th className="py-3.5 px-4">IP</th>
                  <th className="py-3.5 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4 font-sans text-gray-900 dark:text-gray-100 font-medium">
                      {log.userEmail || 'Anónimo / Sistema'}
                    </td>

                    {/* Target resource */}
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                      {log.targetResource || '—'}
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-4 text-gray-400">
                      {log.ipAddress || '—'}
                    </td>

                    {/* Details modal trigger */}
                    <td className="py-3.5 px-4 text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedDetails(log)}
                          className="p-1.5 text-utzmg-green hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center space-x-1 font-sans text-xs font-semibold"
                          title="Ver detalles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 font-sans text-xs">—</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  Detalle del Evento de Auditoría
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  ID: {selectedDetails.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs mb-6 font-sans">
              <div>
                <span className="font-semibold text-gray-500">Acción:</span>{' '}
                <span className="font-bold text-gray-900 dark:text-gray-100">{selectedDetails.action}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Usuario:</span>{' '}
                <span className="font-bold text-gray-900 dark:text-gray-100">{selectedDetails.userEmail}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Fecha/Hora:</span>{' '}
                <span>{new Date(selectedDetails.createdAt).toLocaleString('es-MX')}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Navegador / User-Agent:</span>
                <p className="font-mono text-[11px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-2 rounded-lg mt-1 break-all">
                  {selectedDetails.userAgent}
                </p>
              </div>
              <div>
                <span className="font-semibold text-gray-500">Metadatos (Payload JSON):</span>
                <pre className="font-mono text-[11px] text-emerald-900 bg-emerald-50/70 p-3 rounded-xl mt-1 overflow-x-auto border border-emerald-100">
                  {JSON.stringify(
                    typeof selectedDetails.details === 'string'
                      ? JSON.parse(selectedDetails.details)
                      : selectedDetails.details,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setSelectedDetails(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
