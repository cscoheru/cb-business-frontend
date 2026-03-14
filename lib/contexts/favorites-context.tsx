'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { favoritesApi, FavoriteItem } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface FavoritesContextType {
  favorites: Set<string>;
  favoriteItems: FavoriteItem[];
  toggleFavorite: (cardId: string) => Promise<void>;
  isFavorite: (cardId: string) => boolean;
  favoriteCount: number;
  isLoading: boolean;
  error: string | null;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Load favorites from API when user is authenticated
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        // Not authenticated, clear favorites
        setFavorites(new Set());
        setFavoriteItems([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const items = await favoritesApi.getFavorites();
        // Extract both card IDs and opportunity IDs, filtering out null values
        const favIds = new Set(
          items
            .map(item => item.card_id || item.opportunity_id)
            .filter((id): id is string => id !== null)
        );
        setFavorites(favIds);
        setFavoriteItems(items);
      } catch (err: any) {
        console.error('Failed to load favorites:', err);
        setError(err.message || '加载收藏失败');
        // Don't clear existing favorites on error, just show error
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated]);

  const toggleFavorite = async (cardId: string) => {
    if (!isAuthenticated) {
      setError('请先登录后再收藏');
      return;
    }

    setError(null);
    const isCurrentlyFavorite = favorites.has(cardId);

    // Optimistic update
    const newFavorites = new Set(favorites);
    if (isCurrentlyFavorite) {
      newFavorites.delete(cardId);
    } else {
      newFavorites.add(cardId);
    }
    setFavorites(newFavorites);

    try {
      if (isCurrentlyFavorite) {
        // Remove from API
        await favoritesApi.removeFavoriteByCard(cardId);
        // Update favoriteItems
        setFavoriteItems(prev => prev.filter(item => item.card_id !== cardId));
      } else {
        // Add to API
        await favoritesApi.addFavorite(cardId);
        // Fetch all favorites to get the complete item with card data
        const items = await favoritesApi.getFavorites();
        setFavoriteItems(items);
        // Update favorites set with actual server state (include both cards and opportunities)
        setFavorites(new Set(
          items
            .map(item => item.card_id || item.opportunity_id)
            .filter((id): id is string => id !== null)
        ));
      }
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
      setError(err.message || '操作失败');
      // Revert optimistic update on error
      setFavorites(favorites);
    }
  };

  const isFavorite = (cardId: string) => favorites.has(cardId);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteItems,
        toggleFavorite,
        isFavorite,
        favoriteCount: favorites.size,
        isLoading,
        error,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
