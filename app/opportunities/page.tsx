'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPrompt } from '@/components/opportunities/permission-badge';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  status: string;
  opportunity_type: string;
  confidence_score: number;
  created_at: string;
}

interface FunnelData {
  [status: string]: {
    count: number;
    avg_confidence: number;
  };
}

interface UserAccess {
  plan_tier: string;
  plan_status: string;
  trial_ends_at?: string;
  is_trial_expired?: boolean;
  accessible_statuses?: string[];
}

export default function OpportunitiesPage() {
  const { user, isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [funnel, setFunnel] = useState<FunnelData>({});
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    minConfidence: ''
  });

  // Get API URL at runtime (not build time)
  const getApiUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';
    // Force HTTPS in client-side
    if (typeof window !== 'undefined' && url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    return url;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOpportunities(),
        fetchFunnel()
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.type) params.append('type', filter.type);
      if (filter.minConfidence) params.append('min_confidence', filter.minConfidence);

      // 添加认证token
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const API_BASE_URL = getApiUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/opportunities?${params}`, {
        headers
      });
      const data = await response.json();
      setOpportunities(data.opportunities || []);
      setUserAccess(data.user_access || null);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    }
  };

  const fetchFunnel = async () => {
    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const API_BASE_URL = getApiUrl();
      const response = await fetch(`${API_BASE_URL}/api/v1/opportunities/funnel`, {
        headers
      });
      const data = await response.json();
      setFunnel(data.funnel || {});
    } catch (error) {
      console.error('Failed to fetch funnel:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      potential: 'bg-blue-100 text-blue-800',
      verifying: 'bg-yellow-100 text-yellow-800',
      assessing: 'bg-purple-100 text-purple-800',
      executing: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
      ignored: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      potential: '发现期',
      verifying: '验证期',
      assessing: '评估期',
      executing: '执行期',
      archived: '已归档',
      ignored: '已忽略',
      failed: '已失败'
    };
    return labels[status] || status;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          机会发现
        </h1>
        <p className="text-gray-600">
          AI驱动的商机发现与验证平台
        </p>
      </div>

      {/* 漏斗概览 */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📊 商机漏斗</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(funnel).map(([status, data]) => (
            <div key={status} className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">{data.count}</div>
              <div className="text-sm text-gray-600">{getStatusLabel(status)}</div>
              <div className="text-xs text-gray-500 mt-1">
                可信度: {(data.avg_confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 权限提示 - 对于Free/未登录用户显示 */}
      {!isAuthenticated || user?.plan_tier === 'free' ? (
        <div className="mb-8">
          <SubscriptionPrompt
            title="解锁完整商机跟踪功能"
            description={
              !isAuthenticated
                ? "注册账户，免费体验AI智能商机发现与验证"
                : "升级到Pro版，解锁所有商机跟踪功能"
            }
            features={[
              '无限查看所有阶段商机',
              'AI智能分析与评分',
              '数据采集验证',
              '市场趋势预测'
            ]}
            gradient={!isAuthenticated ? 'blue' : 'purple'}
          />
        </div>
      ) : user?.plan_tier === 'trial' && userAccess?.is_trial_expired ? (
        <div className="mb-8">
          <SubscriptionPrompt
            title="试用期已到期"
            description="升级到Pro版，继续享受完整商机跟踪功能"
            features={[
              '无限查看所有阶段商机',
              'AI智能分析与评分',
              '数据采集验证',
              '专属客服支持'
            ]}
            gradient="orange"
          />
        </div>
      ) : null}

      {/* 筛选器 */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">所有状态</option>
            <option value="potential">发现期</option>
            <option value="verifying">验证期</option>
            <option value="assessing">评估期</option>
            <option value="executing">执行期</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">所有类型</option>
            <option value="product">产品</option>
            <option value="policy">政策</option>
            <option value="platform">平台</option>
            <option value="brand">品牌</option>
            <option value="industry">行业</option>
            <option value="region">地区</option>
          </select>

          <button
            onClick={fetchOpportunities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            应用筛选
          </button>
        </div>
      </div>

      {/* 商机列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">加载中...</div>
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400">暂无商机数据</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              href={`/opportunities/${opp.id}`}
              className="block"
              prefetch={false}
            >
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                {/* 状态标签 */}
                <div className="mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(opp.status)}`}>
                    {getStatusLabel(opp.status)}
                  </span>
                  <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                    {opp.opportunity_type}
                  </span>
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {opp.title}
                </h3>

                {/* 描述 */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {opp.description || '暂无描述'}
                </p>

                {/* 置信度 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">AI可信度</span>
                    <span className="font-medium">{(opp.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${opp.confidence_score * 100}%` }}
                    />
                  </div>
                </div>

                {/* 创建时间 */}
                <div className="text-xs text-gray-500">
                  {new Date(opp.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
