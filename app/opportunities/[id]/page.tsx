'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { favoritesApi } from '@/lib/api';
import { Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useFavorites } from '@/lib/contexts/favorites-context';
import { useToast } from '@/components/ui/toast';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  status: string;
  opportunity_type: string;
  confidence_score: number;
  elements: any;
  ai_insights: any;
  created_at: string;
  data_collection_tasks?: any[];
}

interface DataCollectionTask {
  id: string;
  task_type: string;
  priority: string;
  status: string;
  ai_request: any;
  result?: any;
  created_at: string;
  completed_at?: string;
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toggleFavorite } = useFavorites();
  const { showSuccess, showError } = useToast();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOpportunity(params.id as string);
    }
  }, [params.id]);

  const fetchOpportunity = async (id: string) => {
    try {
      const response = await fetch(`https://api.zenconsult.top/api/v1/opportunities/${id}`);
      const data = await response.json();
      setOpportunity(data.opportunity);

      // 检查收藏状态
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const favoriteData = await favoritesApi.checkOpportunityFavorite(id);
          setIsFavorite(favoriteData.is_favorite);
        } catch (err) {
          console.error('Failed to check favorite status:', err);
        }
      }
    } catch (error) {
      console.error('Failed to fetch opportunity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!opportunity) return;
    if (saving) return;

    setSaving(true);

    try {
      // For opportunities, we need to handle differently than cards
      // Opportunities require authentication as they involve AI monitoring
      if (!isAuthenticated) {
        // Show registration prompt for anonymous users
        showError('需要注册', '收藏商机需要注册账户，注册后AI将为您持续监控此机会');
        setTimeout(() => {
          router.push(`/register?redirect=${encodeURIComponent(window.location.pathname)}`);
        }, 1500);
        return;
      }

      if (isFavorite) {
        // 取消收藏
        await favoritesApi.removeFavoriteByOpportunity(opportunity.id);
        setIsFavorite(false);
        showSuccess('已取消收藏');
      } else {
        // 添加收藏
        await favoritesApi.addOpportunityFavorite(opportunity.id);
        setIsFavorite(true);
        showSuccess('收藏成功', 'AI将为您持续监控此机会的进展');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showError('操作失败', '请稍后再试');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!opportunity) return;
    if (!confirm('确定要归档此商机吗？')) return;

    try {
      await fetch(`https://api.zenconsult.top/api/v1/opportunities/${opportunity.id}?reason=用户手动归档`, {
        method: 'DELETE'
      });
      alert('已归档');
      window.location.href = '/opportunities';
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400">商机不存在</div>
          <Link href="/opportunities" className="text-blue-600 hover:underline">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = {
    potential: 'bg-blue-100 text-blue-800',
    verifying: 'bg-yellow-100 text-yellow-800',
    assessing: 'bg-purple-100 text-purple-800',
    executing: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
    ignored: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800'
  }[opportunity.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 返回链接 */}
      <Link href="/opportunities" className="text-blue-600 hover:underline mb-6 inline-block">
        ← 返回商机列表
      </Link>

      {/* 标题区域 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {opportunity.status}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                {opportunity.opportunity_type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {opportunity.title}
            </h1>
            <p className="text-gray-600">
              {opportunity.description || '暂无描述'}
            </p>
          </div>
        </div>

        {/* 置信度 */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">AI 可信度</span>
            <span className="text-lg font-bold text-gray-900">
              {(opportunity.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${opportunity.confidence_score * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 商机要素 */}
      {opportunity.elements && Object.keys(opportunity.elements).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📦 商机要素</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.entries(opportunity.elements) as [string, any][]).map(([key, value]) => (
              value && (
                <div key={key} className="p-4 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500 mb-1 capitalize">
                    {key}
                  </div>
                  <div className="font-medium text-gray-900">
                    {value.focus || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {value.opportunity_reason}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* AI洞察 */}
      {opportunity.ai_insights && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🤖 AI 洞察</h2>

          {opportunity.ai_insights.why_opportunity && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">为什么是商机</h3>
              <p className="text-gray-600">{opportunity.ai_insights.why_opportunity}</p>
            </div>
          )}

          {opportunity.ai_insights.key_assumptions && opportunity.ai_insights.key_assumptions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">关键假设</h3>
              <ul className="list-disc list-inside text-gray-600">
                {opportunity.ai_insights.key_assumptions.map((assumption: string, i: number) => (
                  <li key={i}>{assumption}</li>
                ))}
              </ul>
            </div>
          )}

          {opportunity.ai_insights.verification_needs && opportunity.ai_insights.verification_needs.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">需要验证</h3>
              <ul className="list-disc list-inside text-gray-600">
                {opportunity.ai_insights.verification_needs.map((need: string, i: number) => (
                  <li key={i}>{need}</li>
                ))}
              </ul>
            </div>
          )}

          {opportunity.ai_insights.confidence_history && opportunity.ai_insights.confidence_history.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">置信度历史</h3>
              <div className="space-y-2">
                {opportunity.ai_insights.confidence_history.map((history: any, i: number) => (
                  <div key={i} className="text-sm flex items-center gap-2">
                    <span className="text-gray-500">
                      {history.from.toFixed(2)} → {history.to.toFixed(2)}
                    </span>
                    <span className="text-green-600">↑{(history.to - history.from).toFixed(2)}</span>
                    <span className="text-gray-400 truncate max-w-xs">
                      {history.reasoning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 关联的产品和资讯 - 融合设计 */}
      {(opportunity as any).card && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📦 关联产品</h2>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🛒</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {(opportunity as any).card.content.summary.title}
                </h3>
                <p className="text-sm text-gray-600">
                  类别: {(opportunity as any).card.category}
                </p>
              </div>
            </div>
            {(opportunity as any).card.amazon_data?.products && (
              <div className="mt-3">
                <p className="text-sm text-gray-700 mb-2">
                  参考产品 ({(opportunity as any).card.amazon_data.products.length}个):
                </p>
                <div className="flex flex-wrap gap-2">
                  {(opportunity as any).card.amazon_data.products.slice(0, 3).map((product: any, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-gray-700 border">
                      {product.title?.substring(0, 20)}...
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Link
              href={`/cards`}
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              查看完整产品分析 →
            </Link>
          </div>
        </div>
      )}

      {(opportunity as any).article && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📰 关联资讯</h2>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {(opportunity as any).article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {(opportunity as any).article.summary?.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>📍 {(opportunity as any).article.region || '全球'}</span>
                  <span>🏢 {(opportunity as any).article.platform || '综合'}</span>
                  <span>🏷️ {(opportunity as any).article.content_theme || '通用'}</span>
                </div>
                {(opportunity as any).article.tags && (opportunity as any).article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(opportunity as any).article.tags.slice(0, 5).map((tag: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-white rounded text-xs text-gray-600 border">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <a
                  href={(opportunity as any).article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-green-600 hover:text-green-800"
                >
                  阅读原文 →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 数据采集任务 */}
      {opportunity.data_collection_tasks && opportunity.data_collection_tasks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 数据采集任务</h2>
          <div className="space-y-3">
            {opportunity.data_collection_tasks.map((task: DataCollectionTask) => (
              <div key={task.id} className="p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{task.task_type}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleString('zh-CN')}
                  </span>
                </div>
                {task.ai_request && task.ai_request.question && (
                  <div className="text-sm text-gray-600">
                    问题: {task.ai_request.question}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isFavorite
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          {saving ? '保存中...' : isFavorite ? '已收藏' : '收藏'}
        </button>
        <button
          onClick={handleArchive}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          归档
        </button>
      </div>
    </div>
  );
}
