'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: '概览',
    href: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: '用户管理',
    href: '/admin/users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: '订阅管理',
    href: '/admin/subscriptions',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: '内容管理',
    href: '/admin/content',
    icon: <FileText className="h-5 w-5" />,
    children: [
      { title: '卡片管理', href: '/admin/content/cards', icon: null },
      { title: '文章管理', href: '/admin/content/articles', icon: null },
    ],
  },
  {
    title: '数据分析',
    href: '/admin/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: '设置',
    href: '/admin/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-950 border-r
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className || ''}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Z</span>
              </div>
              <span className="font-semibold">管理后台</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hidden lg:block"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors
                  ${isActive(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {!collapsed && <span>{item.title}</span>}
              </Link>

              {/* Children */}
              {item.children && !collapsed && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                        transition-colors
                        ${isActive(child.href)
                          ? 'bg-gray-100 dark:bg-gray-800 text-primary'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                        }
                      `}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.icon}
                      <span>{child.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          {!collapsed && (
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span>返回前台</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
