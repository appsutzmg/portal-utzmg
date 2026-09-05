'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DynamicIcon, APP_ICON_NAMES } from '@/components/DynamicIcon';
import { ApplicationIcon } from '@/components/ApplicationIcon';
import { ApplicationItem } from '@/components/AppCard';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Layers, 
  ExternalLink, 
  Shield, 
  Check, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown,
  Search,
  Settings,
  Sparkles,
  ImagePlus,
  FileText,
  Clock,
  Send,
} from 'lucide-react';
import Link from 'next/link';

const AVAILABLE_ICONS = APP_ICON_NAMES;

const AUTH_TYPES = [
  { value: 'SSO_JWT_TOKEN', label: 'SSO Portal (sin doble login)' },
  { value: 'GOOGLE_SESSION', label: 'Sesión Google del navegador' },
  { value: 'DIRECT_LINK', label: 'Enlace directo' },
];

const CATEGORIES = ['Académica', 'Gestión', 'Servicios', 'Administración'];

interface RoleOption {
  id: string;
  label: string;
}

export default function AdminAppsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [apps, setApps] = useState<ApplicationItem[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('Layers');
  const [formCategory, setFormCategory] = useState('Académica');
  const [formAuthType, setFormAuthType] = useState('GOOGLE_SESSION');
  const [formOpenIn, setFormOpenIn] = useState('_blank');
  const [formOrderIndex, setFormOrderIndex] = useState(1);
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [formIsVisible, setFormIsVisible] = useState(true);
  const [formRoles, setFormRoles] = useState<string[]>([]);
  const [allCommunityAccess, setAllCommunityAccess] = useState(false);
  const [formLogoUrl, setFormLogoUrl] = useState<string | null>(null);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const [appsRes, rolesRes] = await Promise.all([
        fetch('/api/applications?adminView=true'),
        fetch('/api/admin/roles'),
      ]);

      if (appsRes.ok) {
        const data = await appsRes.json();
        if (data.ok) {
          setApps(data.applications || []);
        }
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        if (rolesData.ok) {
          setAvailableRoles(
            (rolesData.roles || []).map((r: { name: string; displayName: string }) => ({
              id: r.name,
              label: r.displayName,
            }))
          );
        }
      }
    } catch (err) {
      console.error('Error fetching admin apps:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchApps();
    }
  }, [user]);

  const openCreateModal = () => {
    setEditingApp(null);
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormUrl('');
    setFormIcon('Layers');
    setFormCategory('Académica');
    setFormAuthType('GOOGLE_SESSION');
    setFormOpenIn('_blank');
    setFormOrderIndex(apps.length + 1);
    setFormStatus('ACTIVE');
    setFormIsVisible(true);
    setFormRoles([]);
    setAllCommunityAccess(true);
    setFormLogoUrl(null);
    setLogoMessage(null);
    setIsModalOpen(true);
    setFeedbackMsg(null);
  };

  const openEditModal = (app: ApplicationItem) => {
    setEditingApp(app);
    setFormName(app.name);
    setFormCode(app.code);
    setFormDescription(app.description);
    setFormUrl(app.url);
    setFormIcon(app.icon || 'Layers');
    setFormCategory(app.category || 'Académica');
    setFormAuthType(app.authType || 'GOOGLE_SESSION');
    setFormOpenIn(app.openIn || '_blank');
    setFormOrderIndex(app.orderIndex || 1);
    setFormStatus(app.status || 'ACTIVE');
    setFormIsVisible(app.isVisible !== undefined ? app.isVisible : true);

    const roles = app.requiredRoles ? app.requiredRoles.split(',').map((r) => r.trim()).filter(Boolean) : [];
    setFormRoles(roles);
    setAllCommunityAccess(roles.length === 0);
    setFormLogoUrl(app.logoUrl || null);
    setLogoMessage(null);
    setIsModalOpen(true);
    setFeedbackMsg(null);
  };

  const handleRoleToggle = (roleId: string) => {
    if (allCommunityAccess) setAllCommunityAccess(false);
    setFormRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleAllCommunityToggle = () => {
    if (!allCommunityAccess) {
      setAllCommunityAccess(true);
      setFormRoles([]);
    } else {
      setAllCommunityAccess(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|svg\+xml)$/)) {
      setLogoMessage('Formato no válido. Use JPG, PNG, WebP o SVG.');
      return;
    }

    if (file.size > 300 * 1024) {
      setLogoMessage('La imagen es muy grande. Máximo 300 KB.');
      return;
    }

    setLogoMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setFormLogoUrl(reader.result as string);
    };
    reader.onerror = () => {
      setLogoMessage('No se pudo leer la imagen.');
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleRemoveLogo = () => {
    setFormLogoUrl(null);
    setLogoMessage(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCode || !formUrl) {
      setFeedbackMsg({ type: 'error', text: 'Nombre, código y URL son campos obligatorios.' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    const payload = {
      name: formName,
      code: formCode,
      description: formDescription,
      url: formUrl,
      icon: formIcon,
      logoUrl: formLogoUrl,
      category: formCategory,
      authType: formAuthType,
      openIn: formOpenIn,
      orderIndex: Number(formOrderIndex),
      status: formStatus,
      isVisible:
        formStatus === 'PENDING_PUBLISH'
          ? false
          : formStatus === 'ACTIVE'
            ? formIsVisible
            : formIsVisible,
      requiredRoles: allCommunityAccess ? '' : formRoles.join(','),
    };

    try {
      const url = editingApp ? `/api/applications/${editingApp.id}` : '/api/applications';
      const method = editingApp ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setIsModalOpen(false);
        fetchApps();
      } else {
        setFeedbackMsg({ type: 'error', text: data.message || 'Error al guardar la aplicación' });
      }
    } catch (err) {
      console.error('Error saving app:', err);
      setFeedbackMsg({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (app: ApplicationItem) => {
    if (!confirm(`¿Estás seguro de eliminar la aplicación '${app.name}'? Esta acción se registrará en la auditoría.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/applications/${app.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.ok) {
        fetchApps();
      } else {
        alert(data.message || 'Error al eliminar');
      }
    } catch (err) {
      console.error('Error deleting app:', err);
    }
  };

  const handlePublish = async (app: ApplicationItem) => {
    if (
      !confirm(
        `¿Publicar "${app.name}" en el portal?\nQuedará visible para los usuarios según los roles configurados.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/applications/${app.id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        fetchApps();
      } else {
        alert(data.message || 'Error al publicar');
      }
    } catch (err) {
      console.error('Error publishing app:', err);
      alert('Error de conexión al publicar');
    }
  };

  const parseRequestNotes = (notes?: string | null) => {
    if (!notes) return null;
    try {
      return JSON.parse(notes) as {
        responsible?: string;
        department?: string | null;
        supportEmail?: string | null;
        desiredDate?: string | null;
        comment?: string | null;
      };
    } catch {
      return null;
    }
  };

  const filteredApps = apps.filter((app) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      app.name.toLowerCase().includes(q) ||
      app.code.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q) ||
      (app.requestedByEmail || '').toLowerCase().includes(q) ||
      (app.requestedByName || '').toLowerCase().includes(q)
    );
  });

  const pendingApps = filteredApps.filter((app) => app.status === 'PENDING_PUBLISH');
  const catalogApps = filteredApps.filter((app) => app.status !== 'PENDING_PUBLISH');

  if (authLoading || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-utzmg-green uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Panel de Administración Institucional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Gestión del Catálogo de Aplicaciones
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Agrega o modifica aplicaciones institucionales y sus roles autorizados sin tocar código fuente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Link
            href="/admin/solicitud-app"
            className="px-4 py-2.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-utzmg-darkgreen dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Guía de solicitud</span>
          </Link>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-utzmg-green hover:bg-utzmg-darkgreen text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-sm hover:shadow transition-all"
          >
          <Plus className="w-4 h-4" />
          <span>Registrar Nueva Aplicación</span>
        </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filtrar por nombre o clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Total: <span className="font-bold text-gray-900 dark:text-gray-100">{apps.length}</span>
          {pendingApps.length > 0 && (
            <>
              {' · '}
              Pendientes:{' '}
              <span className="font-bold text-amber-700">{pendingApps.length}</span>
            </>
          )}
        </div>
      </div>

      {/* Pendientes de publicar */}
      {!isLoading && pendingApps.length > 0 && (
        <section className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-200/80 dark:border-amber-900/40 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Pendientes de publicar ({pendingApps.length})
            </h2>
          </div>
          <ul className="divide-y divide-amber-100 dark:divide-amber-900/40">
            {pendingApps.map((app) => {
              const notes = parseRequestNotes(app.requestNotes);
              return (
                <li
                  key={app.id}
                  className="p-4 flex flex-col lg:flex-row lg:items-center gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <ApplicationIcon
                      icon={app.icon}
                      logoUrl={app.logoUrl}
                      className="w-11 h-11 rounded-xl shrink-0"
                      imgClassName="w-full h-full object-contain p-0.5"
                      fallbackClassName="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{app.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{app.code}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {app.description}
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-2">
                        Solicitada por{' '}
                        <span className="font-semibold">
                          {app.requestedByName || 'Usuario'}
                        </span>
                        {app.requestedByEmail ? ` (${app.requestedByEmail})` : ''}
                        {notes?.responsible ? ` · Responsable: ${notes.responsible}` : ''}
                        {notes?.desiredDate ? ` · Fecha deseada: ${notes.desiredDate}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Revisar
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePublish(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-utzmg-green hover:bg-utzmg-darkgreen text-white"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Publicar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(app)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                      title="Rechazar / eliminar solicitud"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Applications Table / Cards */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-xs text-gray-500">
          Cargando catálogo institucional...
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Orden</th>
                  <th className="py-3.5 px-4">Aplicación</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Roles Autorizados</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {catalogApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    
                    {/* Order */}
                    <td className="py-4 px-4 font-mono text-xs text-gray-400 font-bold">
                      #{app.orderIndex}
                    </td>

                    {/* App info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <ApplicationIcon
                          icon={app.icon}
                          logoUrl={app.logoUrl}
                          className="w-10 h-10 rounded-xl shrink-0"
                          imgClassName="w-full h-full object-contain p-0.5"
                          fallbackClassName="w-10 h-10 rounded-xl bg-emerald-50 text-utzmg-green flex items-center justify-center shrink-0 border border-emerald-100"
                        />
                        <div className="max-w-xs">
                          <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">{app.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{app.code}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 dark:text-gray-300">
                        {app.category}
                      </span>
                    </td>

                    {/* Roles */}
                    <td className="py-4 px-4">
                      {!app.requiredRoles || app.requiredRoles.trim() === '' ? (
                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Toda la Comunidad
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.requiredRoles.split(',').map((r) => (
                            <span
                              key={r}
                              className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-700 dark:text-gray-300 rounded capitalize"
                            >
                              {r.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {app.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                          Operativa
                        </span>
                      ) : app.status === 'MAINTENANCE' ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                          Mantenimiento
                        </span>
                      ) : app.status === 'PENDING_PUBLISH' ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                          Pendiente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:text-gray-400 rounded-full">
                          Inactiva
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-utzmg-green hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar aplicación"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar aplicación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingApp ? 'Editar Aplicación Institucional' : 'Registrar Nueva Aplicación'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Los cambios se reflejarán inmediatamente en el Dashboard de los usuarios.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Feedback */}
            {feedbackMsg && (
              <div
                className={`mb-6 p-3.5 rounded-2xl text-xs flex items-center space-x-2 ${
                  feedbackMsg.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nombre Visible de la Aplicación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sistema de Control Escolar"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                  />
                </div>

                {/* Code (Slug) */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Código Único (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingApp}
                    placeholder="control-escolar"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green font-mono disabled:bg-gray-100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green bg-white dark:bg-gray-900"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URL */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    URL de la Aplicación *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://sistema.utzmg.edu.mx"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                  />
                </div>

                {/* Auth Type — required for SSO */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de autenticación
                  </label>
                  <select
                    value={formAuthType}
                    onChange={(e) => setFormAuthType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green bg-white dark:bg-gray-900"
                  >
                    {AUTH_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Use <strong>SSO Portal</strong> para Proyectos y Tutorías (evita pedir login otra vez).
                  </p>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Descripción Breve
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Resumen funcional para las tarjetas del dashboard..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                  />
                </div>

                {/* Logo de la aplicación */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Logo de la aplicación
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <ApplicationIcon
                      icon={formIcon}
                      logoUrl={formLogoUrl}
                      className="w-16 h-16 rounded-2xl shrink-0 mx-auto sm:mx-0"
                      imgClassName="w-full h-full object-contain p-1"
                      fallbackClassName="w-16 h-16 rounded-2xl bg-gradient-to-br from-utzmg-green to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md"
                    />
                    <div className="flex-1 space-y-2">
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Se muestra en la tarjeta del dashboard. Si no subes logo, se usa el icono seleccionado abajo.
                        JPG, PNG, WebP o SVG — máx. 300 KB.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-1.5"
                        >
                          <ImagePlus className="w-4 h-4" />
                          <span>{formLogoUrl ? 'Cambiar logo' : 'Subir logo'}</span>
                        </button>
                        {formLogoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="px-3 py-2 text-xs font-semibold rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                          >
                            Quitar logo
                          </button>
                        )}
                      </div>
                      {logoMessage && (
                        <p className="text-[11px] text-red-600">{logoMessage}</p>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoFileChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Icon Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Icono de respaldo
                  </label>
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIcon(iconName)}
                        className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                          formIcon === iconName
                            ? 'bg-utzmg-green text-white shadow-md scale-105'
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                        }`}
                        title={iconName}
                      >
                        <DynamicIcon name={iconName} className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roles Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Roles Autorizados
                  </label>
                  
                  <div className="mb-2">
                    <label className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allCommunityAccess}
                        onChange={handleAllCommunityToggle}
                        className="rounded border-gray-300 text-utzmg-green focus:ring-utzmg-green"
                      />
                      <span>Disponible para toda la comunidad institucional</span>
                    </label>
                  </div>

                  {!allCommunityAccess && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {availableRoles.map((role) => (
                        <label
                          key={role.id}
                          className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-2 cursor-pointer transition-all ${
                            formRoles.includes(role.id)
                              ? 'bg-emerald-50 border-emerald-300 text-utzmg-darkgreen font-semibold'
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formRoles.includes(role.id)}
                            onChange={() => handleRoleToggle(role.id)}
                            className="rounded border-gray-300 text-utzmg-green focus:ring-utzmg-green"
                          />
                          <span>{role.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status & Open in */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Estado Operativo
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green bg-white dark:bg-gray-900"
                  >
                    <option value="ACTIVE">Operativa (Activa)</option>
                    <option value="PENDING_PUBLISH">Pendiente de publicar</option>
                    <option value="MAINTENANCE">En Mantenimiento</option>
                    <option value="INACTIVE">Inactiva (Oculta)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formOrderIndex}
                    onChange={(e) => setFormOrderIndex(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                  />
                </div>

              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-utzmg-green hover:bg-utzmg-darkgreen text-white shadow-sm hover:shadow transition-all flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingApp ? 'Guardar Cambios' : 'Registrar Aplicación'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
