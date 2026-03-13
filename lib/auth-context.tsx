'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/api';

const TOKEN_KEY = 'auth_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

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

    // 登录后停留在当前页面，但如果当前是login/register页，则跳转到cards
    if (pathname === '/login' || pathname === '/register') {
      router.push('/cards');
    }
  };

  const register = async (email: string, password: string, name: string) => {
    // 检查是否已登录
    if (user) {
      throw new Error('您已登录，请先退出当前账户后再注册新账户');
    }

    const { authApi } = await import('@/lib/api');
    const response = await authApi.register(email, password, name);

    // 保存token和用户信息
    setToken(response.access_token);
    setUser(response.user);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

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
