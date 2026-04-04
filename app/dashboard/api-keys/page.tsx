'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  BarChart3,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiKeysApi, APIKeyData, APIKeyCreateResponse, APITier, TierInfo } from '@/lib/api';

// Tier colors and labels
const tierConfig: Record<APITier, { color: string; bgColor: string; label: string; price: string }> = {
  developer: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: '开发者', price: '¥299/月' },
  business: { color: 'text-purple-600', bgColor: 'bg-purple-100', label: '商业版', price: '¥999/月' },
  enterprise: { color: 'text-amber-600', bgColor: 'bg-amber-100', label: '企业版', price: '¥2999/月' },
};

export default function APIKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<APIKeyData[]>([]);
  const [tiers, setTiers] = useState<TierInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create key modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyTier, setNewKeyTier] = useState<APITier>('developer');
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<APIKeyCreateResponse | null>(null);
  const [showFullKey, setShowFullKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Usage stats modal state
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [keysData, tiersData] = await Promise.all([
        apiKeysApi.listKeys(),
        apiKeysApi.getTierInfo(),
      ]);
      setKeys(keysData);
      setTiers(tiersData.tiers);
    } catch (err: any) {
      setError(err.message || '加载 API Keys 失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const result = await apiKeysApi.createKey(newKeyName, newKeyTier);
      setCreatedKey(result);
      setNewKeyName('');
      setShowCreateModal(false);
      await loadData(); // Refresh list
    } catch (err: any) {
      setError(err.message || '创建 API Key 失败');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('确定要撤销此 API Key 吗？撤销后需要重新激活才能使用。')) return;

    try {
      await apiKeysApi.revokeKey(keyId);
      await loadData();
    } catch (err: any) {
      setError(err.message || '撤销失败');
    }
  };

  const handleReactivateKey = async (keyId: string) => {
    try {
      await apiKeysApi.reactivateKey(keyId);
      await loadData();
    } catch (err: any) {
      setError(err.message || '激活失败');
    }
  };

  const handleViewUsage = async (keyId: string) => {
    setSelectedKeyId(keyId);
    setShowUsageModal(true);
    setIsLoadingUsage(true);

    try {
      const stats = await apiKeysApi.getUsage(keyId, 7);
      setUsageStats(stats);
    } catch (err: any) {
      setUsageStats(null);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '从未';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Key className="h-8 w-8" />
            API Keys
          </h1>
          <p className="text-muted-foreground">
            管理您的 API 密钥，用于访问公共 API
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          创建新密钥
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            ×
          </Button>
        </div>
      )}

      {/* Created Key Success Modal */}
      {createdKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold">API Key 创建成功</h2>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800 font-medium mb-2">
                ⚠️ 请立即复制您的 API Key，此密钥只会显示一次！
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-2 rounded border text-sm font-mono break-all">
                  {showFullKey
                    ? createdKey.full_key
                    : `${createdKey.full_key.substring(0, 12)}${'•'.repeat(36)}`}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullKey(!showFullKey)}
                >
                  {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => copyToClipboard(createdKey.full_key)}
                className="flex-1 gap-2"
              >
                {copiedKey ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    复制密钥
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setCreatedKey(null)}>
                关闭
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">创建新的 API Key</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">密钥名称</Label>
                <Input
                  id="keyName"
                  placeholder="例如：生产环境密钥"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <div>
                <Label>订阅层级</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['developer', 'business', 'enterprise'] as APITier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setNewKeyTier(tier)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        newKeyTier === tier
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-medium ${tierConfig[tier].color}`}>
                        {tierConfig[tier].label}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {tierConfig[tier].price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateKey}
                disabled={!newKeyName.trim() || isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    创建中...
                  </>
                ) : (
                  '创建密钥'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                }}
              >
                取消
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Usage Stats Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">使用统计</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowUsageModal(false)}>
                ×
              </Button>
            </div>

            {isLoadingUsage ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : usageStats ? (
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl font-bold">{usageStats.total_requests}</div>
                    <div className="text-sm text-muted-foreground">总请求数</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {usageStats.successful_requests}
                    </div>
                    <div className="text-sm text-muted-foreground">成功请求</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {usageStats.failed_requests}
                    </div>
                    <div className="text-sm text-muted-foreground">失败请求</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {usageStats.avg_response_time_ms}ms
                    </div>
                    <div className="text-sm text-muted-foreground">平均响应</div>
                  </div>
                </div>

                {/* By Endpoint */}
                <div>
                  <h3 className="font-medium mb-3">按端点统计</h3>
                  <div className="space-y-2">
                    {Object.entries(usageStats.by_endpoint || {}).map(([endpoint, count]) => (
                      <div key={endpoint} className="flex items-center justify-between py-2 border-b">
                        <code className="text-sm">{endpoint}</code>
                        <Badge variant="outline">{count as number}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Day */}
                <div>
                  <h3 className="font-medium mb-3">每日趋势</h3>
                  <div className="space-y-2">
                    {(usageStats.by_day || []).map((day: any) => (
                      <div key={day.date} className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm">{day.date}</span>
                        <span className="text-sm font-medium">{day.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                暂无使用数据
              </div>
            )}
          </Card>
        </div>
      )}

      {/* API Keys List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : keys.length === 0 ? (
        <Card className="p-12 text-center">
          <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无 API Key</h3>
          <p className="text-muted-foreground mb-4">
            创建您的第一个 API Key 开始使用公共 API
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建 API Key
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <Card key={key.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{key.name}</h3>
                    <Badge className={tierConfig[key.tier as APITier]?.bgColor || 'bg-gray-100'}>
                      {tierConfig[key.tier as APITier]?.label || key.tier}
                    </Badge>
                    {key.is_active ? (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        活跃
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        <XCircle className="h-3 w-3 mr-1" />
                        已撤销
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded">{key.key_prefix}...</code>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      最后使用: {formatDate(key.last_used_at)}
                    </span>
                    {key.expires_at && (
                      <span className="flex items-center gap-1">
                        过期: {formatDate(key.expires_at)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      {key.rate_limit_per_minute} 次/分钟
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      今日: {key.usage_today} / {key.rate_limit_per_day}
                    </span>
                    <span>本月: {key.usage_this_month}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewUsage(key.id)}
                    className="gap-1"
                  >
                    <BarChart3 className="h-4 w-4" />
                    统计
                  </Button>
                  {key.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      撤销
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReactivateKey(key.id)}
                      className="gap-1 text-green-600 hover:text-green-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      激活
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tier Information */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">订阅层级对比</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div key={tier.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{tier.name === 'developer' ? '开发者' : tier.name === 'business' ? '商业版' : '企业版'}</h3>
                <Badge>{tier.price} {tier.currency}/{tier.period}</Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div>请求限制: {tier.rate_limit_per_minute}/分钟, {tier.rate_limit_per_day}/天</div>
              </div>
              <ul className="space-y-1 text-sm">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
