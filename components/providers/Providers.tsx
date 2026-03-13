'use client';

import { AuthProvider } from '@/lib/auth-context';
import { FavoritesProvider } from '@/lib/contexts/favorites-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        {children}
      </FavoritesProvider>
    </AuthProvider>
  );
}
