'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/api';

const TOKEN_KEY = 'auth_token';
const LOCAL_FAVORITES_KEY = 'zen_favorites';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, plan_choice?: 'trial' | 'free') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

/**
 * Sync local favorites to server after login
 */
const syncLocalFavorites = async () => {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
    if (!stored) return;

    const localFavorites: string[] = JSON.parse(stored);
    if (localFavorites.length === 0) return;

    // Sync to server
    const { favoritesApi } = await import('@/lib/api');
    let syncedCount = 0;

    for (const cardId of localFavorites) {
      try {
        await favoritesApi.addFavorite(cardId);
        syncedCount++;
      } catch (error) {
        console.error(`Failed to sync favorite ${cardId}:`, error);
      }
    }

    // Clear local storage after successful sync
    localStorage.removeItem(LOCAL_FAVORITES_KEY);

    if (syncedCount > 0) {
      // Use toast to show success message (will be implemented by caller)
      console.log(`Synced ${syncedCount} local favorites to server`);
    }
  } catch (error) {
    console.error('Failed to sync local favorites:', error);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 应用启动时验证token有效性
  useEffect(() => {
    const verifyToken = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem('user');

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      // 有token，尝试验证
      try {
        const { usersApi } = await import('@/lib/api');
        const userData = await usersApi.getMe();

        // Token有效，设置用户状态
        setUser(userData);
        setToken(savedToken);
      } catch (error) {
        // Token无效或过期，清除本地存储
        console.error('Token验证失败:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    const { authApi } = await import('@/lib/api');
    const response = await authApi.login(email, password);

    // 保存token和用户信息
    setToken(response.access_token);
    setUser(response.user);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    // Sync local favorites after login
    await syncLocalFavorites();

    // Note: Redirect is handled by the caller (login page)
  };

  const register = async (email: string, password: string, name: string, plan_choice: 'trial' | 'free' = 'trial') => {
    // 检查是否已登录
    if (user) {
      throw new Error('您已登录，请先退出当前账户后再注册新账户');
    }

    const { authApi } = await import('@/lib/api');
    const response = await authApi.register(email, password, name, plan_choice);

    // 保存token和用户信息
    setToken(response.access_token);
    setUser(response.user);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    // Sync local favorites after registration
    await syncLocalFavorites();

    // 注册后跳转到 dashboard
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
    }

    // 登出后停留在当前页面
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
