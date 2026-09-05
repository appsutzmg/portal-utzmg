'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  APP_REQUEST_EMAIL_TEMPLATE,
  APP_CATEGORIES,
  AUTH_TYPE_OPTIONS,
  PORTAL_ROLES,
} from '@/lib/app-request-template';
import { PORTAL_ADMIN_EMAIL } from '@/lib/mailto-requests';
import {
  ArrowLeft,
  Check,
  ClipboardCopy,
  FileText,
  Mail,
  Shield,
  Info,
} from 'lucide-react';

export default function SolicitudAppPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!authLoading && (!user || !user.isAdmin)) {
    router.replace('/dashboard');
    return null;
  }

  if (authLoading) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APP_REQUEST_EMAIL_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/admin/apps"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-utzmg-green hover:text-utzmg-darkgreen dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Gestión de Aplicaciones
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-utzmg-green uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Administración</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Solicitud de nueva aplicación
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">
            Comparte esta guía con quien quiera dar de alta un sistema en el portal. Recopila la
            información y regístrala en{' '}
            <Link href="/admin/apps" className="text-utzmg-green font-semibold hover:underline">
              Gestión de Aplicaciones
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Link
            href="/solicitar-acceso?nueva=1"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-utzmg-green hover:bg-utzmg-darkgreen text-white shadow-sm transition-all"
          >
            <Mail className="w-4 h-4" />
            Abrir formulario
          </Link>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <ClipboardCopy className="w-4 h-4" />
                Copiar plantilla
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mínimo indispensable */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-utzmg-green" />
          Datos obligatorios
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4 font-semibold">Campo</th>
                <th className="py-2 pr-4 font-semibold">Qué pedir</th>
                <th className="py-2 font-semibold">Ejemplo</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 pr-4 font-medium">Nombre</td>
                <td className="py-3 pr-4">Título visible en la tarjeta</td>
                <td className="py-3 text-gray-500">Sistema de Control Escolar</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 pr-4 font-medium">Código (slug)</td>
                <td className="py-3 pr-4">Minúsculas, sin espacios; no se cambia después</td>
                <td className="py-3 font-mono text-xs text-gray-500">control-escolar</td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 pr-4 font-medium">URL</td>
                <td className="py-3 pr-4">Enlace completo https://...</td>
                <td className="py-3 text-gray-500">https://control.utzmg.edu.mx</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Descripción</td>
                <td className="py-3 pr-4">2–4 oraciones para la tarjeta</td>
                <td className="py-3 text-gray-500">Consulta de calificaciones...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Recomendado */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
          Identidad visual (recomendado)
        </h2>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5">
          <li>
            <strong className="text-gray-800 dark:text-gray-200">Logo:</strong> PNG, JPG, WebP o
            SVG — máx. 300 KB, fondo claro, formato cuadrado preferible.
          </li>
          <li>
            <strong className="text-gray-800 dark:text-gray-200">Icono de respaldo:</strong> si no
            hay logo, se elige uno en el panel al registrar la app.
          </li>
          <li>
            <strong className="text-gray-800 dark:text-gray-200">Categoría:</strong>{' '}
            {APP_CATEGORIES.join(', ')}.
          </li>
        </ul>
      </section>

      {/* Roles */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">
          ¿Quién puede ver la tarjeta?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Pide al solicitante que indique perfiles concretos. Tú asignas los roles en{' '}
          <Link href="/admin/users" className="text-utzmg-green hover:underline">
            Usuarios
          </Link>{' '}
          y en la ficha de la aplicación.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4 text-left font-semibold">Rol</th>
                <th className="py-2 pr-4 text-left font-semibold">Código</th>
                <th className="py-2 text-left font-semibold">Uso típico</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-300">
              {PORTAL_ROLES.map((role) => (
                <tr key={role.code} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2.5 pr-4 font-medium">{role.label}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs">{role.code}</td>
                  <td className="py-2.5 text-gray-500 dark:text-gray-400">{role.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Auth types */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">
          Tipo de acceso (coordinar con TI)
        </h2>
        <div className="space-y-3">
          {AUTH_TYPE_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-950/50"
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{opt.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opt.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Email template preview */}
      <section className="portal-panel rounded-2xl border p-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-utzmg-green" />
          Plantilla de correo para solicitantes
        </h2>
        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 rounded-xl p-4 border border-gray-200 dark:border-gray-800 max-h-96 overflow-y-auto">
          {APP_REQUEST_EMAIL_TEMPLATE}
        </pre>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Destino:{' '}
          <span className="text-utzmg-green font-semibold">{PORTAL_ADMIN_EMAIL}</span>
          . Los usuarios envían desde{' '}
          <Link href="/solicitar-acceso" className="text-utzmg-green font-semibold hover:underline">
            Solicitar acceso
          </Link>{' '}
          y el portal entrega el correo directamente.
        </p>
      </section>

      {/* Nota admin */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 flex gap-3 text-sm text-gray-700 dark:text-gray-300">
        <Info className="w-5 h-5 text-utzmg-green shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Con nombre, código, URL, descripción, roles y logo (opcional) puedes registrar la app en
          minutos. Los cambios hechos desde el panel <strong>no se pierden</strong> en redeploys si
          MongoDB Atlas está configurado y el build de Render <strong>no</strong> ejecuta{' '}
          <code className="text-xs bg-white/80 dark:bg-gray-900 px-1 py-0.5 rounded">db:seed</code>.
        </p>
      </div>
    </div>
  );
}
