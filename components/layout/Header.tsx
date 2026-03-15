'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/contexts/favorites-context';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { favoriteCount } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    // Redirect to home page after logout
    window.location.href = '/';
  };

  const navLinks = (
    <>
      <Link
        href="/"
        className="font-semibold text-blue-600 hover:text-blue-700"
        onClick={() => setMobileMenuOpen(false)}
      >
        商机卡片
      </Link>
      <Link
        href="/cards"
        className="hover:text-primary text-sm"
        onClick={() => setMobileMenuOpen(false)}
      >
        历史卡片
      </Link>
      <Link
        href="/products"
        className="hover:text-primary text-sm"
        onClick={() => setMobileMenuOpen(false)}
      >
        产品库
      </Link>
      <Link
        href="/opportunities"
        className="hover:text-primary text-sm"
        onClick={() => setMobileMenuOpen(false)}
      >
        机会发现
      </Link>
      <Link
        href="/search"
        className="hover:text-primary text-sm"
        onClick={() => setMobileMenuOpen(false)}
      >
        搜索
      </Link>
      <Link
        href="/favorites"
        className="hover:text-primary flex items-center gap-1"
        onClick={() => setMobileMenuOpen(false)}
      >
        <Heart className="h-4 w-4" />
        收藏
        {favoriteCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {favoriteCount}
          </span>
        )}
      </Link>
      <Link
        href="/pricing"
        className="hover:text-primary text-sm"
        onClick={() => setMobileMenuOpen(false)}
      >
        定价
      </Link>
    </>
  );

  const authLinks = isAuthenticated ? (
    <>
      <Link
        href="/dashboard"
        className="hover:text-primary"
        onClick={() => setMobileMenuOpen(false)}
      >
        Dashboard
      </Link>
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {user?.name || user?.email}
      </span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        退出
      </Button>
    </>
  ) : (
    <>
      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="outline" size="sm">
          登录
        </Button>
      </Link>
      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
        <Button size="sm">
          免费注册
        </Button>
      </Link>
    </>
  );

  return (
    <header className="border-b sticky top-0 bg-background z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="hidden sm:inline">ZenConsult</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks}
            {authLinks}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t mt-4">
            <div className="flex flex-col gap-4">
              {navLinks}
              <div className="border-t pt-4">
                <div className="mb-2 text-sm text-muted-foreground">
                  {isAuthenticated && (
                    <span>{user?.name || user?.email}</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {authLinks}
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
