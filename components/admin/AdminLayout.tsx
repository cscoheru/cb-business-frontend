'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:bottom-0">
          {/* Sidebar will be rendered by AdminSidebar component */}
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
