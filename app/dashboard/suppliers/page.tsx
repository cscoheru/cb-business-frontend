'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { suppliersApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt';
import { SupplierRecommendations } from '@/components/cards/supplier-recommendations';

export default function SupplierSearchPage() {
  const { isAuthenticated, user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await suppliersApi.search({ keyword: keyword.trim(), limit: 20 });
      setResults(res?.products || res || []);
    } catch (error: any) {
      console.error('Supplier search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Free user: show upgrade prompt
  if (isAuthenticated && user?.plan_tier === 'free') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4" />
            返回仪表盘
          </button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">货源搜索</h1>
          <p className="text-gray-600">
            从1688等平台搜索优质货源，匹配商机卡片
          </p>
        </div>

        <UpgradePrompt feature="ai_analysis" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back button */}
      <Link href="/dashboard">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          返回仪表盘
        </button>
      </Link>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">货源搜索</h1>
        <p className="text-gray-600">
          从1688等平台搜索优质货源，匹配商机卡片
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="输入产品关键词搜索货源，如: 无线耳机、手机壳..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 h-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !keyword.trim()}
          className="h-10 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              搜索中
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              搜索货源
            </>
          )}
        </Button>
      </div>

      {/* Not authenticated prompt */}
      {!isAuthenticated && (
        <div className="bg-muted rounded-lg p-6 text-center">
          <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">请先登录</p>
          <p className="text-sm text-muted-foreground mb-4">
            登录后即可使用货源搜索功能
          </p>
          <Link href="/login">
            <Button>立即登录</Button>
          </Link>
        </div>
      )}

      {/* Loading state */}
      {isAuthenticated && loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          <span>正在搜索1688货源...</span>
        </div>
      )}

      {/* Results */}
      {isAuthenticated && !loading && searched && results.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">
              找到 {results.length} 件商品
            </Badge>
            <span className="text-sm text-muted-foreground">
              关键词: {keyword}
            </span>
          </div>

          {/* Grid view */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((product, idx) => (
              <SupplierRecommendations
                key={idx}
                products={[product]}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {isAuthenticated && !loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mb-4 opacity-40" />
          <p className="font-medium mb-1">未找到相关货源</p>
          <p className="text-sm">请尝试更换关键词或调整搜索条件</p>
        </div>
      )}

      {/* Initial state */}
      {isAuthenticated && !loading && !searched && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mb-4 opacity-40" />
          <p className="font-medium mb-1">输入关键词开始搜索</p>
          <p className="text-sm">支持产品名称、品类、品牌等关键词</p>
        </div>
      )}
    </div>
  );
}
