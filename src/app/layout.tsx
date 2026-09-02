import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeScript } from '@/components/ThemeScript';
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
    <html lang="es" className="h-full" suppressHydrationWarning>
      <body className="flex flex-col min-h-full bg-utzmg-surface dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-emerald-100 dark:selection:bg-emerald-900/50 selection:text-utzmg-darkgreen dark:selection:text-emerald-100">
        <ThemeScript />
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
