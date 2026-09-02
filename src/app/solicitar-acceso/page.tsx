'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ApplicationIcon } from '@/components/ApplicationIcon';
import { PORTAL_ADMIN_EMAIL } from '@/lib/access-request-messages';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  PlusCircle,
  Send,
  AlertCircle,
} from 'lucide-react';

interface CatalogApp {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  logoUrl?: string | null;
  category: string;
  canAccess: boolean;
}

type RequestType = 'app_access' | 'general_access' | 'new_app';

export default function SolicitarAccesoPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<CatalogApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [customAppName, setCustomAppName] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/applications?accessCatalog=true');
        const data = await res.json();
        if (data.ok) {
          setApps(data.applications || []);
        }
      } catch (err) {
        console.error('Error loading access catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const withoutAccess = useMemo(
    () => apps.filter((app) => !app.canAccess),
    [apps]
  );

  const withAccess = useMemo(() => apps.filter((app) => app.canAccess), [apps]);

  const sendRequest = async (
    payload: {
      type: RequestType;
      appCode?: string;
      appName?: string;
      comment?: string;
    },
    key: string
  ) => {
    setSubmittingKey(key);
    setFeedback(null);

    try {
      const res = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setFeedback({ type: 'success', message: data.message });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'No se pudo enviar la solicitud.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Error de conexión. Verifica tu red e inténtalo de nuevo.',
      });
    } finally {
      setSubmittingKey(null);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-utzmg-green hover:text-utzmg-darkgreen dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al dashboard
        </Link>
      </div>

      {feedback && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p>{feedback.message}</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Solicitar acceso
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
          Envía tu solicitud directamente a{' '}
          <span className="text-utzmg-green font-semibold">{PORTAL_ADMIN_EMAIL}</span>. No necesitas
          abrir tu cliente de correo: el portal envía el mensaje por ti.
        </p>
      </div>

      {/* Apps sin acceso */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-1">
          <Lock className="w-5 h-5 text-amber-600" />
          Aplicaciones del portal a las que aún no tienes acceso
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Elige la aplicación y pulsa enviar solicitud. El administrador recibirá tu correo al
          instante.
        </p>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando catálogo...</p>
        ) : withoutAccess.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 text-sm text-emerald-800 dark:text-emerald-200">
            Tienes acceso a todas las aplicaciones visibles en el portal, o no hay más sistemas
            registrados. Si necesitas otra app, usa el formulario de abajo.
          </div>
        ) : (
          <ul className="space-y-3">
            {withoutAccess.map((app) => {
              const key = `app-${app.code}`;
              const isSubmitting = submittingKey === key;

              return (
                <li
                  key={app.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ApplicationIcon
                      icon={app.icon}
                      logoUrl={app.logoUrl}
                      className="w-12 h-12 rounded-xl shrink-0"
                      imgClassName="w-full h-full object-contain p-1"
                      fallbackClassName="w-12 h-12 rounded-xl bg-utzmg-green/10 flex items-center justify-center"
                      iconClassName="w-6 h-6"
                      iconColor="#006837"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {app.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{app.category}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSubmitting || submittingKey !== null}
                    onClick={() =>
                      sendRequest(
                        { type: 'app_access', appCode: app.code },
                        key
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-utzmg-green hover:bg-utzmg-darkgreen text-white shadow-sm transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Otra aplicación */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
          ¿Buscas otra aplicación?
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la aplicación o sistema
            </label>
            <input
              type="text"
              value={customAppName}
              onChange={(e) => setCustomAppName(e.target.value)}
              placeholder="Ej. Sistema de Control Escolar"
              className="portal-input w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Comentario (opcional)
            </label>
            <textarea
              rows={3}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Indica por qué necesitas acceso..."
              className="portal-input w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-utzmg-green"
            />
          </div>
          <button
            type="button"
            disabled={
              !customAppName.trim() ||
              submittingKey === 'general' ||
              submittingKey !== null
            }
            onClick={() =>
              sendRequest(
                {
                  type: 'general_access',
                  appName: customAppName.trim(),
                  comment: customComment,
                },
                'general'
              )
            }
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              customAppName.trim()
                ? 'bg-utzmg-green hover:bg-utzmg-darkgreen text-white shadow-sm disabled:opacity-60'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submittingKey === 'general' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Mail className="w-3.5 h-3.5" />
            )}
            {submittingKey === 'general' ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </section>

      {/* Nueva app en el portal */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
          <PlusCircle className="w-5 h-5 text-utzmg-green" />
          Registrar un sistema nuevo en el portal
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Si tu área necesita dar de alta una aplicación institucional (no solo acceso a una
          existente), envía la solicitud completa al administrador.
        </p>
        <button
          type="button"
          disabled={submittingKey === 'new_app' || submittingKey !== null}
          onClick={() => sendRequest({ type: 'new_app' }, 'new_app')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 text-utzmg-darkgreen dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all disabled:opacity-60"
        >
          {submittingKey === 'new_app' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Mail className="w-3.5 h-3.5" />
          )}
          {submittingKey === 'new_app' ? 'Enviando...' : 'Solicitar alta de nueva aplicación'}
        </button>
        {user.isAdmin && (
          <p className="text-xs text-gray-500 mt-3">
            Como administrador puedes ver la{' '}
            <Link href="/admin/solicitud-app" className="text-utzmg-green font-semibold hover:underline">
              guía interna
            </Link>{' '}
            o registrar directamente en{' '}
            <Link href="/admin/apps" className="text-utzmg-green font-semibold hover:underline">
              Gestión de Aplicaciones
            </Link>
            .
          </p>
        )}
      </section>

      {/* Ya tienes acceso */}
      {withAccess.length > 0 && (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Ya tienes acceso a
          </h3>
          <ul className="flex flex-wrap gap-2">
            {withAccess.map((app) => (
              <li
                key={app.id}
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-utzmg-darkgreen dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-900/50"
              >
                {app.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
