'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useSubscription } from '@/hooks/useSubscription';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Globe,
  FileText,
  Calculator,
  Settings,
  Heart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const navItems = [
  {
    title: '仪表盘',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '商机监控',
    href: '/dashboard/opportunities',
    icon: TrendingUp,
  },
  {
    title: '风险预警',
    href: '/dashboard/risks',
    icon: AlertTriangle,
  },
  {
    title: '市场洞察',
    href: '/dashboard/market',
    icon: Globe,
  },
  {
    title: '政策解读',
    href: '/dashboard/policies',
    icon: FileText,
  },
  {
    title: '工具箱',
    href: '/dashboard/tools/cost-calculator',
    icon: Calculator,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { status, isLoading } = useSubscription();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/30">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-bold">ZenConsult</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name || '用户'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              {!isLoading && status && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {status.plan === 'free' ? '免费版' : status.plan === 'pro' ? '专业版' : '企业版'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                          ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 pt-6 border-t">
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/favorites"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Heart className="h-5 w-5" />
                      <span className="font-medium">我的收藏</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/settings"
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${pathname === '/dashboard/settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">设置</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Bar (Mobile) */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold">ZenConsult</span>
          </div>

          {/* Page Content */}
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
