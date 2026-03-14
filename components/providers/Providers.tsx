'use client';

import { AuthProvider } from '@/lib/auth-context';
import { FavoritesProvider } from '@/lib/contexts/favorites-context';
import { ForceHttpsProvider } from './force-https';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ForceHttpsProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </ForceHttpsProvider>
    </AuthProvider>
  );
}
