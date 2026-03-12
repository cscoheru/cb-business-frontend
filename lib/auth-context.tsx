'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

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

  // 从localStorage恢复登录状态
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (e) {
          // 清除无效数据
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { authApi } = await import('@/lib/api');
    const response = await authApi.login(email, password);

    // 保存token和用户信息
    setToken(response.token);
    setUser(response.user);

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    router.push('/dashboard');
  };

  const register = async (email: string, password: string, name: string) => {
    const { authApi } = await import('@/lib/api');
    const response = await authApi.register(email, password, name);

    // 保存token和用户信息
    setToken(response.token);
    setUser(response.user);

    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    router.push('/');
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
