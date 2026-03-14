'use client';

import { AuthProvider } from '@/lib/auth-context';
import { FavoritesProvider } from '@/lib/contexts/favorites-context';
import { ForceHttpsProvider } from './force-https';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ForceHttpsProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </ForceHttpsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
