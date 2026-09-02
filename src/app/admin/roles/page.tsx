'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Lock,
  Users,
} from 'lucide-react';

interface RoleItem {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  userCount: number;
}

export default function AdminRolesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchRoles();
    }
  }, [user]);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormDisplayName('');
    setFormName('');
    setFormDescription('');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setFormDisplayName(role.displayName);
    setFormName(role.name);
    setFormDescription(role.description || '');
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDisplayName.trim()) {
      setFeedback({ type: 'error', text: 'El nombre visible es obligatorio.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const url = editingRole ? `/api/admin/roles/${editingRole.id}` : '/api/admin/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const payload = editingRole
        ? { displayName: formDisplayName, description: formDescription }
        : {
            displayName: formDisplayName,
            name: formName || undefined,
            description: formDescription,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setIsModalOpen(false);
        fetchRoles();
      } else {
        setFeedback({ type: 'error', text: data.message || 'Error al guardar el rol' });
      }
    } catch (err) {
      console.error('Error saving role:', err);
      setFeedback({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role: RoleItem) => {
    if (role.isSystem) {
      alert('Los roles del sistema no pueden eliminarse.');
      return;
    }

    if (
      !confirm(
        `¿Eliminar el rol "${role.displayName}"?\n\nEsta acción se registrará en la auditoría.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/roles/${role.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.ok) {
        fetchRoles();
      } else {
        alert(data.message || 'Error al eliminar el rol');
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Error de conexión al eliminar el rol');
    }
  };

  const filteredRoles = roles.filter((role) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      role.name.toLowerCase().includes(q) ||
      role.displayName.toLowerCase().includes(q) ||
      (role.description || '').toLowerCase().includes(q)
    );
  });

  if (authLoading || !user?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-utzmg-green uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Control de Acceso Institucional</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Gestión de Roles Institucionales
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Crea y administra los perfiles de acceso del portal. Los roles nuevos estarán disponibles
            al asignar permisos a usuarios y aplicaciones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-utzmg-green hover:bg-utzmg-darkgreen text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nuevo Rol</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar rol por nombre o clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-xs text-gray-500">
          Cargando roles institucionales...
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Rol</th>
                  <th className="py-3.5 px-4">Clave Técnica</th>
                  <th className="py-3.5 px-4">Descripción</th>
                  <th className="py-3.5 px-4">Usuarios</th>
                  <th className="py-3.5 px-4">Tipo</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-gray-100">{role.displayName}</td>
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{role.name}</td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400 text-xs max-w-xs">
                      {role.description || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:text-gray-300 text-xs font-medium">
                        <Users className="w-3 h-3" />
                        <span>{role.userCount}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {role.isSystem ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                          <Lock className="w-3 h-3" />
                          <span>Sistema</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                          Personalizado
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-utzmg-green hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Editar rol"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!role.isSystem && (
                          <button
                            onClick={() => handleDelete(role)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar rol"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {editingRole ? 'Editar Rol Institucional' : 'Agregar Nuevo Rol'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingRole
                    ? 'Puedes modificar el nombre visible y la descripción.'
                    : 'El rol estará disponible para usuarios y aplicaciones.'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  feedback.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nombre Visible *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Coordinador de Carrera"
                  value={formDisplayName}
                  onChange={(e) => setFormDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                />
              </div>

              {!editingRole && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Clave Técnica (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="coordinador_carrera (se genera automáticamente si se deja vacío)"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Identificador interno usado en permisos. Solo letras minúsculas, números y
                    guiones bajos.
                  </p>
                </div>
              )}

              {editingRole && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Clave Técnica
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formName}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm font-mono text-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe las funciones o accesos de este perfil..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-utzmg-green hover:bg-utzmg-darkgreen text-white shadow-sm flex items-center space-x-1.5"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingRole ? 'Guardar Cambios' : 'Crear Rol'}</span>
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
