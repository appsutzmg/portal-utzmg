'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Search, 
  Shield, 
  Check, 
  X, 
  Edit, 
  UserCheck, 
  Lock,
  AlertCircle 
} from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  roles: string[];
  roleDisplayNames: string[];
}

interface RoleItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit user modal
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/roles'),
      ]);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsersList(uData.users || []);
      }

      if (rolesRes.ok) {
        const rData = await rolesRes.json();
        setAvailableRoles(rData.roles || []);
      }
    } catch (err) {
      console.error('Error fetching admin users data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  const openEditModal = (target: AdminUser) => {
    setSelectedUser(target);
    setSelectedRoles([...target.roles]);
    setSelectedStatus(target.status);
    setFeedback(null);
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          roleNames: selectedRoles,
          status: selectedStatus,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setSelectedUser(null);
        fetchData();
      } else {
        setFeedback(data.message || 'Error al actualizar roles');
      }
    } catch (err) {
      console.error('Error saving user roles:', err);
      setFeedback('Error de conexión con el servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.roles.some((r) => r.toLowerCase().includes(q))
    );
  });

  if (authLoading || !user?.isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-xs font-semibold text-utzmg-green uppercase tracking-wider mb-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Control de Acceso Institucional</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Gestión de Usuarios y Roles (RBAC)
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Asigna o revoca perfiles institucionales a las cuentas @utzmg.edu.mx.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo institucional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Usuarios registrados: <span className="font-bold text-gray-900">{usersList.length}</span>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xs text-gray-500">
          Cargando usuarios institucionales...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Roles Asignados</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Último Acceso</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    
                    {/* User profile */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-utzmg-darkgreen flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Roles tags */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${
                              r === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : r === 'coordinador'
                                ? 'bg-blue-100 text-blue-800'
                                : r === 'tutor'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>

                    {/* Last login */}
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString('es-MX', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : 'Nunca'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-utzmg-green bg-emerald-50 hover:bg-emerald-100 transition-colors inline-flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar Roles</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Roles Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 sm:p-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Modificar Roles Institucionales
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedUser.name} ({selectedUser.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoles} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Seleccionar Roles para este usuario:
                </label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <label
                      key={role.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        selectedRoles.includes(role.name)
                          ? 'bg-emerald-50 border-emerald-300 text-utzmg-darkgreen font-semibold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-gray-900">{role.displayName}</p>
                        <p className="text-[11px] text-gray-500 font-normal">{role.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.name)}
                        onChange={() => handleRoleToggle(role.name)}
                        className="rounded border-gray-300 text-utzmg-green focus:ring-utzmg-green ml-2"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estado de la Cuenta
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green bg-white"
                >
                  <option value="ACTIVE">Activo (Acceso permitido)</option>
                  <option value="SUSPENDED">Suspendido (Bloqueado)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
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
                      <span>Actualizar Roles</span>
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
