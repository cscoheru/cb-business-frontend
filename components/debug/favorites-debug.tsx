'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/contexts/favorites-context';

export function FavoritesDebug() {
  const { isAuthenticated } = useAuth();
  const { favoriteItems, favoriteCount, isFavorite } = useFavorites();
  const [localStorageData, setLocalStorageData] = useState<string | null>(null);
  const [testCardId] = useState('test-card-id');

  useEffect(() => {
    // Check localStorage
    const LOCAL_FAVORITES_KEY = 'zen_favorites';
    try {
      const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
      setLocalStorageData(stored || 'null');
    } catch (error) {
      setLocalStorageData(`Error: ${error}`);
    }
  }, [favoriteItems]);

  const testLocalStorage = () => {
    const LOCAL_FAVORITES_KEY = 'zen_favorites';
    try {
      const existing = localStorage.getItem(LOCAL_FAVORITES_KEY);
      const current = existing ? JSON.parse(existing) : [];
      const updated = [...current, testCardId];
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(updated));
      alert(`成功写入localStorage: ${JSON.stringify(updated)}`);
      // Refresh
      window.location.reload();
    } catch (error) {
      alert(`localStorage写入失败: ${error}`);
    }
  };

  const clearLocalStorage = () => {
    const LOCAL_FAVORITES_KEY = 'zen_favorites';
    try {
      localStorage.removeItem(LOCAL_FAVORITES_KEY);
      alert('localStorage已清除');
      window.location.reload();
    } catch (error) {
      alert(`清除失败: ${error}`);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">收藏系统诊断</h3>
        <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
          {isAuthenticated ? '已登录' : '未登录'}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">收藏数量:</span>
          <span className="font-medium">{favoriteCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">收藏项目数:</span>
          <span className="font-medium">{favoriteItems.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">localStorage数据:</span>
          <span className="font-medium text-xs max-w-xs truncate">{localStorageData}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button size="sm" onClick={testLocalStorage}>
          测试localStorage写入
        </Button>
        <Button size="sm" variant="outline" onClick={clearLocalStorage}>
          清除localStorage
        </Button>
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
        <p className="font-medium mb-1">诊断信息:</p>
        <ul className="space-y-1">
          <li>• 已登录用户: 数据存储在服务器</li>
          <li>• 未登录用户: 数据存储在localStorage</li>
          <li>• localStorage键名: zen_favorites</li>
          <li>• 测试卡片ID: {testCardId}</li>
        </ul>
      </div>
    </Card>
  );
}
