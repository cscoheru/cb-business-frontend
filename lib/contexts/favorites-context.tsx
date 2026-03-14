'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { favoritesApi, FavoriteItem } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';

// LocalStorage key for anonymous favorites
const LOCAL_FAVORITES_KEY = 'zen_favorites';

interface FavoritesContextType {
  favorites: Set<string>;
  favoriteItems: FavoriteItem[];
  toggleFavorite: (cardId: string) => Promise<void>;
  isFavorite: (cardId: string) => boolean;
  favoriteCount: number;
  isLoading: boolean;
  error: string | null;
  anonymousFavoriteCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

/**
 * Load local favorites from localStorage
 */
const loadLocalFavorites = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load local favorites:', error);
    return [];
  }
};

/**
 * Save favorites to localStorage
 */
const saveLocalFavorites = (favorites: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save local favorites:', error);
  }
};

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anonymousFavoriteCount, setAnonymousFavoriteCount] = useState(0);
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  // Load favorites from API when user is authenticated, or localStorage when not
  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        // Not authenticated, load from localStorage
        const localFavorites = loadLocalFavorites();
        setFavorites(new Set(localFavorites));
        setAnonymousFavoriteCount(localFavorites.length);
        setFavoriteItems([]); // Don't load items when not authenticated
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
        setAnonymousFavoriteCount(0); // Reset local count after login
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
      // Anonymous user: save to localStorage
      const localFavorites = loadLocalFavorites();
      const isCurrentlyFavorite = localFavorites.includes(cardId);

      if (isCurrentlyFavorite) {
        // Remove from local favorites
        const index = localFavorites.indexOf(cardId);
        localFavorites.splice(index, 1);
        saveLocalFavorites(localFavorites);
        setFavorites(new Set(localFavorites));
        setAnonymousFavoriteCount(localFavorites.length);
      } else {
        // Add to local favorites
        localFavorites.push(cardId);
        saveLocalFavorites(localFavorites);
        const newCount = localFavorites.length;
        setFavorites(new Set(localFavorites));
        setAnonymousFavoriteCount(newCount);

        // Show appropriate feedback based on count
        if (newCount === 1) {
          toast.showInfo('💾 已保存到本地', '登录后可跨设备访问');
        } else if (newCount === 3) {
          // Smart registration prompt on 3rd favorite
          setTimeout(() => {
            toast.showInfo(
              '💡 提示：注册账户，收藏永不丢失',
              `已为您保存了${newCount}个收藏，注册后可随时随地访问`
            );
          }, 1000);
        } else {
          toast.showSuccess('💾 已保存到本地');
        }
      }

      return;
    }

    // Authenticated user: use API
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
        // Show AI monitoring message
        toast.showAIAnalyzing(
          '✅ 已加入AI智能监控',
          '🤖 正在分析市场变化，预计5分钟完成'
        );

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
        anonymousFavoriteCount,
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
