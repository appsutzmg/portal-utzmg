'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Lock, 
  GraduationCap, 
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const { user, login, demoUsers, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor introduce tu correo institucional');
      return;
    }

    if (!email.toLowerCase().endsWith('@utzmg.edu.mx')) {
      setError('Acceso restringido: El correo debe terminar en @utzmg.edu.mx');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await login(email);
    if (!result.ok) {
      setError(result.message || 'Error al iniciar sesión');
    }
    setIsSubmitting(false);
  };

  const handleDemoSelect = async (demoEmail: string) => {
    setIsSubmitting(true);
    setError(null);
    const result = await login(demoEmail);
    if (!result.ok) {
      setError(result.message || 'Error al iniciar sesión');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-utzmg-subtle">
      <div className="max-w-md w-full">
        
        {/* Main Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
          
          {/* Top Decorative Green Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-utzmg-gradient" />

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4">
              <img
                src="/logo.png"
                alt="Logo Institucional UTZMG"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              PORTAL UTZMG
            </h1>
            <p className="text-sm font-semibold text-utzmg-darkgreen mt-1">
              Universidad Tecnológica de la Zona Metropolitana de Guadalajara
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Punto de acceso institucional único a aplicaciones y servicios
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Workspace Button */}
          <button
            onClick={() => {
              if (!email) {
                setEmail('apps@utzmg.edu.mx');
                login('apps@utzmg.edu.mx');
              } else {
                login(email);
              }
            }}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-2xl text-sm font-semibold flex items-center justify-center space-x-3 shadow-sm hover:shadow transition-all mb-6 group"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Ingresar con Google Workspace</span>
          </button>

          {/* Institutional Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              o con tu correo @utzmg.edu.mx
            </span>
          </div>

          {/* Email Direct Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Correo Electrónico Institucional
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@utzmg.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green focus:border-transparent transition-all placeholder:text-gray-400"
                  required
                />
                <span className="absolute right-3 top-3 text-xs text-gray-400 font-mono">
                  @utzmg.edu.mx
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-utzmg-green hover:bg-utzmg-darkgreen text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continuar al Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher (Simulación de Roles para pruebas) */}
          {demoUsers.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Cuentas de Demostración</span>
                </span>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                  Selección Rápida
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {demoUsers.map((du) => (
                  <button
                    key={du.id}
                    onClick={() => handleDemoSelect(du.email)}
                    disabled={isSubmitting}
                    className="w-full text-left p-2.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs group"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-utzmg-green">
                        {du.name}
                      </p>
                      <p className="text-[11px] text-gray-400">{du.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {du.roleKeys.map((r) => (
                        <span
                          key={r}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 font-medium capitalize"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-gray-400 text-center">
            <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Acceso seguro protegido por OpenID Connect institucional</span>
          </div>

        </div>

      </div>
    </div>
  );
}
