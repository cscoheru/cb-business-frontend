'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AllianceStatus {
  status: 'active' | 'degraded' | 'offline';
  mcp: {
    connected: boolean;
    server_url: string;
    available_tools: string[];
  };
  openclaw_gateway: {
    healthy: boolean;
    channels_count?: number;
  };
  scheduler_jobs: Array<{
    id: string;
    name: string;
    next_run: string | null;
    trigger: string;
    status: string;
  }>;
  stats: {
    opportunities_analyzed: number;
    data_gaps_filled: number;
    confidence_improvement_avg: number;
  };
  recent_logs: Array<{
    timestamp: string;
    level: string;
    source: string;
    message: string;
  }>;
}

const statusColors = {
  active: 'bg-green-500',
  degraded: 'bg-yellow-500',
  offline: 'bg-red-500',
};

const statusLabels = {
  active: '正常运行',
  degraded: '部分降级',
  offline: '离线',
};

const jobIcons: Record<string, string> = {
  'data_gap_filling': '🤖',
  'opportunity_deep_analysis': '🔬',
  'funnel_management': '🔄',
  'signal_discovery': '🔍',
  'grade_monitoring': '📊',
};

export function AIAllianceStatus() {
  const [status, setStatus] = useState<AllianceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
    // 每30秒刷新一次
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch('https://api.zenconsult.top/api/v1/ai-alliance/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setError(null);
      } else {
        setError('Failed to load status');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const triggerJob = async (jobType: string) => {
    try {
      const response = await fetch(`https://api.zenconsult.top/api/v1/ai-alliance/trigger/${jobType}`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('任务已触发！');
        loadStatus();
      }
    } catch (err) {
      alert('触发失败');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-600">⚠️ 无法加载 AI 联盟状态</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 联盟状态概览 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🤝</div>
            <div>
              <h3 className="text-xl font-bold">AI + OpenClaw 智能联盟</h3>
              <p className="text-sm text-gray-500">AI分析 → 数据缺口 → MCP采集 → 智能补充</p>
            </div>
          </div>
          <Badge className={`${statusColors[status.status]} text-white px-4 py-2`}>
            {statusLabels[status.status]}
          </Badge>
        </div>

        {/* 组件状态 */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* MCP 状态 */}
          <div className={`p-4 rounded-lg border ${status.mcp.connected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status.mcp.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">MCP Server</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {status.mcp.connected ? `${status.mcp.available_tools.length} 个工具可用` : '未连接'}
            </p>
          </div>

          {/* OpenClaw 状态 */}
          <div className={`p-4 rounded-lg border ${status.openclaw_gateway.healthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status.openclaw_gateway.healthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">OpenClaw Gateway</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {status.openclaw_gateway.healthy
                ? `${status.openclaw_gateway.channels_count || 0} 个采集通道`
                : '连接失败'}
            </p>
          </div>
        </div>
      </Card>

      {/* 定时任务 */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">🔄 定时任务</h3>
        <div className="space-y-3">
          {status.scheduler_jobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{jobIcons[job.id] || '⏰'}</span>
                <div>
                  <p className="font-medium">{job.name}</p>
                  <p className="text-sm text-gray-500">{job.trigger}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  {job.status === 'running' ? '运行中' : '等待'}
                </Badge>
                {job.next_run && (
                  <p className="text-xs text-gray-400 mt-1">
                    下次: {new Date(job.next_run).toLocaleTimeString('zh-CN')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 手动触发按钮 */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerJob('data-gap-filling')}
          >
            🤖 填补数据缺口
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerJob('deep-analysis')}
          >
            🔬 深度分析
          </Button>
        </div>
      </Card>

      {/* 统计数据 */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📊 运行统计</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {status.stats.opportunities_analyzed}
            </div>
            <div className="text-sm text-gray-600">商机已分析</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {status.stats.data_gaps_filled}
            </div>
            <div className="text-sm text-gray-600">数据缺口已填补</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              +{status.stats.confidence_improvement_avg.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">平均置信度提升</div>
          </div>
        </div>
      </Card>

      {/* 最近日志 */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">📋 最近活动</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {status.recent_logs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-sm ${
                log.level === 'ERROR'
                  ? 'bg-red-50 border border-red-100'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {log.source}
                </Badge>
                <span className="text-gray-400 text-xs">
                  {new Date(log.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>
              <p className="mt-1 text-gray-700">{log.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
