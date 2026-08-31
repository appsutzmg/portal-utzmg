'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex items-center justify-center animate-pulse">
          <img
            src="/logo.png"
            alt="Logo UTZMG"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-sm font-medium text-gray-500">Cargando Portal UTZMG...</p>
      </div>
    </div>
  );
}
