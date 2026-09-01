'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  roles: string[];
  roleLabels?: string[];
  isAdmin: boolean;
}

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  roleKeys: string[];
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  demoUsers: DemoUser[];
  login: (email: string, name?: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAvatar: (avatarData: string) => Promise<{ ok: boolean; message?: string }>;
  removeAvatar: () => Promise<{ ok: boolean; message?: string }>;
  updateName: (name: string) => Promise<{ ok: boolean; message?: string }>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDemoUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setDemoUsers(data.users || []);
        }
      }
    } catch (err) {
      console.error('Error fetching demo users:', err);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    fetchDemoUsers();
  }, [fetchCurrentUser, fetchDemoUsers]);

  const login = async (email: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setUser(data.user);
        router.push('/dashboard');
        return { ok: true, message: data.message };
      } else {
        return { ok: false, message: data.message || 'Error al iniciar sesión' };
      }
    } catch (err) {
      console.error('Error during login:', err);
      return { ok: false, message: 'Error de conexión con el servidor institucional' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateAvatar = async (avatarData: string) => {
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarData }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setUser(data.user);
        return { ok: true, message: data.message };
      }

      return { ok: false, message: data.message || 'Error al actualizar la foto' };
    } catch (err) {
      console.error('Error updating avatar:', err);
      return { ok: false, message: 'Error de conexión al guardar la foto' };
    }
  };

  const removeAvatar = async () => {
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' });
      const data = await res.json();

      if (res.ok && data.ok) {
        setUser(data.user);
        return { ok: true, message: data.message };
      }

      return { ok: false, message: data.message || 'Error al eliminar la foto' };
    } catch (err) {
      console.error('Error removing avatar:', err);
      return { ok: false, message: 'Error de conexión al eliminar la foto' };
    }
  };

  const updateName = async (name: string) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setUser(data.user);
        return { ok: true, message: data.message };
      }

      return { ok: false, message: data.message || 'Error al actualizar el nombre' };
    } catch (err) {
      console.error('Error updating name:', err);
      return { ok: false, message: 'Error de conexión al guardar el nombre' };
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true;
    return user.roles.map((r) => r.toLowerCase()).includes(role.toLowerCase());
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (!roles || roles.length === 0) return true;
    const userRoles = user.roles.map((r) => r.toLowerCase());
    return roles.some((r) => userRoles.includes(r.toLowerCase()));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        demoUsers,
        login,
        logout,
        refreshUser,
        updateAvatar,
        removeAvatar,
        updateName,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
