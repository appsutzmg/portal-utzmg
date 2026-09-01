'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  ShieldCheck, 
  LayoutGrid, 
  UserCheck, 
  ChevronDown, 
  Sparkles,
  ExternalLink,
  Layers,
  History,
  Users
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, demoUsers, login } = useAuth();
  const pathname = usePathname();
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (!user) return null;

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

            {/* Navigation tabs */}
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

              {user.isAdmin && (
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
              )}
            </nav>
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-utzmg-green to-emerald-400 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-semibold text-gray-900 leading-tight truncate max-w-[140px]">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-tight truncate max-w-[140px]">
                    {user.email}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
