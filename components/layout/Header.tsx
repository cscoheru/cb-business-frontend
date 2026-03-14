'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/contexts/favorites-context';
import { Heart } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { favoriteCount } = useFavorites();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span>ZenConsult</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-blue-600">商机卡片</Link>
          <Link href="/cards" className="hover:text-primary text-sm">历史卡片</Link>
          <Link href="/favorites" className="hover:text-primary flex items-center gap-1">
            <Heart className="h-4 w-4" />
            收藏
            {favoriteCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {favoriteCount}
              </span>
            )}
          </Link>
          <Link href="/pricing" className="hover:text-primary text-sm">定价</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                退出
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  免费注册
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
