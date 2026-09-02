'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { getUserSubtitle } from '@/lib/user-profile';
import { 
  LogOut, 
  ShieldCheck, 
  LayoutGrid, 
  ChevronDown, 
  Sparkles,
  Layers,
  History,
  Users,
  Camera,
  Trash2,
  Loader2,
  Pencil
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, demoUsers, login, updateAvatar, removeAvatar, updateName } = useAuth();
  const pathname = usePathname();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setAvatarMessage('Formato no válido. Use JPG, PNG o WebP.');
      return;
    }

    if (file.size > 200 * 1024) {
      setAvatarMessage('La imagen es muy grande. Máximo 200 KB.');
      return;
    }

    setAvatarLoading(true);
    setAvatarMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const result = await updateAvatar(reader.result as string);
      setAvatarLoading(false);
      setAvatarMessage(result.ok ? 'Foto actualizada' : result.message || 'Error al subir');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setAvatarLoading(false);
      setAvatarMessage('No se pudo leer la imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    setAvatarMessage(null);
    const result = await removeAvatar();
    setAvatarLoading(false);
    setAvatarMessage(result.ok ? 'Foto eliminada' : result.message || 'Error al eliminar');
  };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return;
    setNameLoading(true);
    setNameMessage(null);
    const result = await updateName(nameDraft.trim());
    setNameLoading(false);
    if (result.ok) {
      setEditingName(false);
      setNameMessage('Nombre actualizado');
    } else {
      setNameMessage(result.message || 'Error al guardar');
    }
  };

  if (!user) return null;

  const userSubtitle = getUserSubtitle({
    roleLabels: user.roleLabels || [],
    email: user.email,
  });

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-white p-1 border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Logo UTZMG"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900 text-lg tracking-tight group-hover:text-utzmg-green transition-colors">
                    PORTAL UTZMG
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                    Institucional
                  </span>
                </div>
                <p className="text-xs text-gray-500 hidden md:block">
                  Universidad Tecnológica de la Zona Metropolitana de Guadalajara
                </p>
              </div>
            </Link>

            {/* Navegación — solo administradores (varias secciones); el resto usa el dashboard como inicio */}
            {user.isAdmin && (
            <nav className="hidden md:flex space-x-1 pl-6">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  pathname === '/dashboard'
                    ? 'bg-utzmg-mint text-utzmg-darkgreen'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Aplicaciones</span>
              </Link>

              <div className="flex space-x-1">
                  <Link
                    href="/admin/apps"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      pathname.startsWith('/admin/apps')
                        ? 'bg-utzmg-mint text-utzmg-darkgreen'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-utzmg-green" />
                    <span>Gestión de Apps</span>
                  </Link>

                  <Link
                    href="/admin/users"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      pathname.startsWith('/admin/users')
                        ? 'bg-utzmg-mint text-utzmg-darkgreen'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-utzmg-green" />
                    <span>Usuarios</span>
                  </Link>

                  <Link
                    href="/admin/roles"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      pathname.startsWith('/admin/roles')
                        ? 'bg-utzmg-mint text-utzmg-darkgreen'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-utzmg-green" />
                    <span>Roles</span>
                  </Link>

                  <Link
                    href="/admin/audit"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                      pathname.startsWith('/admin/audit')
                        ? 'bg-utzmg-mint text-utzmg-darkgreen'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <History className="w-4 h-4 text-utzmg-green" />
                    <span>Auditoría</span>
                  </Link>
              </div>
            </nav>
            )}
          </div>

          {/* Right side: User Profile & Demo Switcher */}
          <div className="flex items-center space-x-3">
            
            {/* Demo Quick Switcher Button (if available) */}
            {demoUsers.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDemoDropdown(!showDemoDropdown)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center space-x-1"
                  title="Cambiar de perfil para probar permisos"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Simular Perfil</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showDemoDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Cambiar usuario institucional
                    </div>
                    {demoUsers.map((du) => (
                      <button
                        key={du.id}
                        onClick={async () => {
                          setShowDemoDropdown(false);
                          await login(du.email);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between text-xs ${
                          user.email === du.email ? 'bg-emerald-50 text-utzmg-darkgreen font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium text-gray-900 truncate">{du.name}</p>
                          <p className="text-gray-400 text-[11px] truncate">{du.email}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {du.roleKeys.slice(0, 2).map((r) => (
                            <span
                              key={r}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 capitalize"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2.5 p-1.5 rounded-full sm:rounded-xl hover:bg-gray-100 transition-colors"
              >
                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
                <div className="hidden lg:block text-left pr-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[160px]">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-tight truncate max-w-[160px]">
                    {userSubtitle}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
                      <div className="min-w-0 flex-1">
                        {editingName ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={nameDraft}
                              onChange={(e) => setNameDraft(e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-utzmg-green"
                              placeholder="Tu nombre completo"
                              maxLength={120}
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={nameLoading || !nameDraft.trim()}
                                onClick={handleSaveName}
                                className="px-2 py-1 text-[11px] font-medium text-white bg-utzmg-green rounded-md disabled:opacity-60"
                              >
                                {nameLoading ? 'Guardando…' : 'Guardar'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingName(false);
                                  setNameMessage(null);
                                }}
                                className="px-2 py-1 text-[11px] font-medium text-gray-600 bg-gray-100 rounded-md"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-1.5 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate flex-1">{user.name}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setNameDraft(user.name);
                                setEditingName(true);
                                setNameMessage(null);
                              }}
                              className="shrink-0 p-1 text-gray-400 hover:text-utzmg-green rounded"
                              title="Editar nombre"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 truncate mt-0.5">{userSubtitle}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 text-[11px] font-medium bg-emerald-50 text-utzmg-darkgreen rounded-full border border-emerald-200 uppercase tracking-wider"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleAvatarSelect}
                      />
                      <button
                        type="button"
                        disabled={avatarLoading}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-utzmg-darkgreen bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors disabled:opacity-60"
                      >
                        {avatarLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Camera className="w-3.5 h-3.5" />
                        )}
                        <span>{user.avatarUrl ? 'Cambiar foto' : 'Agregar foto'}</span>
                      </button>
                      {user.avatarUrl && (
                        <button
                          type="button"
                          disabled={avatarLoading}
                          onClick={handleRemoveAvatar}
                          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Quitar foto</span>
                        </button>
                      )}
                    </div>
                    {avatarMessage && (
                      <p className="mt-2 text-[11px] text-gray-500">{avatarMessage}</p>
                    )}
                    {nameMessage && (
                      <p className="mt-2 text-[11px] text-gray-500">{nameMessage}</p>
                    )}
                    {!user.avatarUrl && (
                      <p className="mt-2 text-[10px] text-gray-400 leading-snug">
                        Inicia sesión con Google para usar tu nombre y foto de Workspace, o edítalos aquí manualmente.
                      </p>
                    )}
                  </div>

                  {user.isAdmin && (
                    <div className="py-1 border-b border-gray-100 md:hidden">
                      <Link
                        href="/admin/apps"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Gestión de Aplicaciones
                      </Link>
                      <Link
                        href="/admin/users"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Usuarios
                      </Link>
                      <Link
                        href="/admin/roles"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Roles
                      </Link>
                      <Link
                        href="/admin/audit"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Bitácora de Auditoría
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
