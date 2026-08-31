import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Portal UTZMG — Universidad Tecnológica de la Zona Metropolitana de Guadalajara',
  description: 'Punto de acceso institucional centralizado a las aplicaciones y servicios de la UTZMG.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="flex flex-col min-h-full bg-utzmg-surface text-gray-900 selection:bg-emerald-100 selection:text-utzmg-darkgreen">
        <AuthProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
