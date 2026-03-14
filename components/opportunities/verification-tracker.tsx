'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

interface DataCollectionTask {
  id: string;
  opportunity_id: string;
  task_type: string;
  priority: string;
  status: string;
  ai_request: {
    question?: string;
    data_needed?: string[];
  };
  channel_name?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  progress: number;
  estimated_completion?: string;
  result_summary?: string;
}

interface VerificationTrackerProps {
  opportunityId?: string;
  showHistory?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
}

export default function VerificationTracker({
  opportunityId,
  showHistory = false,
  autoRefresh = true,
  refreshInterval = 10
}: VerificationTrackerProps) {
  const [tasks, setTasks] = useState<DataCollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    failed: 0
  });

  useEffect(() => {
    fetchTasks();

    if (autoRefresh) {
      const interval = setInterval(fetchTasks, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [opportunityId, showHistory, autoRefresh, refreshInterval]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = opportunityId
        ? `https://api.zenconsult.top/api/v1/data-collection-tasks/opportunity/${opportunityId}?include_history=${showHistory}`
        : `https://api.zenconsult.top/api/v1/data-collection-tasks?active_only=${!showHistory}&limit=20`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTasks(data.tasks || []);

        // Update stats
        if (opportunityId && data.tasks) {
          setStats({
            active: data.active_count || 0,
            completed: data.completed_count || 0,
            failed: data.failed_count || 0
          });
        } else {
          setStats({
            active: data.tasks?.filter((t: DataCollectionTask) =>
              t.status === 'pending' || t.status === 'running'
            ).length || 0,
            completed: data.tasks?.filter((t: DataCollectionTask) =>
              t.status === 'completed'
            ).length || 0,
            failed: data.tasks?.filter((t: DataCollectionTask) =>
              t.status === 'failed'
            ).length || 0
          });
        }

        setError(null);
      } else {
        setError('获取任务失败');
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'running':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-700',
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500'
    };

    const labels = {
      pending: '等待中',
      running: '执行中',
      completed: '已完成',
      failed: '失败',
      cancelled: '已取消'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badges[status as keyof typeof badges] || badges.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-gray-100 text-gray-700'
    };

    const labels = {
      high: '高',
      medium: '中',
      low: '低'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${badges[priority as keyof typeof badges] || badges.medium}`}>
        {labels[priority as keyof typeof labels] || priority}
      </span>
    );
  };

  const getTaskTypeLabel = (taskType: string) => {
    const labels: Record<string, string> = {
      product_search: '产品搜索',
      review_monitoring: '评论监控',
      price_tracking: '价格追踪',
      competition_analysis: '竞争分析',
      market_research: '市场研究',
      trend_analysis: '趋势分析',
      supplier_verification: '供应商验证',
      compliance_check: '合规检查'
    };

    return labels[taskType] || taskType;
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 数据采集追踪</h3>
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 text-blue-500 animate-spin mr-2" />
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">📊 数据采集追踪</h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            活跃: <span className="font-medium text-blue-600">{stats.active}</span>
          </div>
          <div className="text-sm text-gray-600">
            完成: <span className="font-medium text-green-600">{stats.completed}</span>
          </div>
          <div className="text-sm text-gray-600">
            失败: <span className="font-medium text-red-600">{stats.failed}</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No Tasks */}
      {tasks.length === 0 && !loading && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无数据采集任务</p>
          <p className="text-sm text-gray-400 mt-1">
            {opportunityId ? '此商机暂无验证任务' : '没有活跃的采集任务'}
          </p>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            {/* Task Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <h4 className="font-medium text-gray-900">
                    {getTaskTypeLabel(task.task_type)}
                  </h4>
                  {getStatusBadge(task.status)}
                  {getPriorityBadge(task.priority)}
                </div>

                {/* AI Question */}
                {task.ai_request?.question && (
                  <p className="text-sm text-gray-600 mt-1">
                    问题: {task.ai_request.question}
                  </p>
                )}

                {/* Data Needed */}
                {task.ai_request?.data_needed && task.ai_request.data_needed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.ai_request.data_needed.map((item, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(task.progress * 100)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {task.estimated_completion || '计算中...'}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'failed' ? 'bg-red-500' :
                    task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${task.progress * 100}%` }}
                />
              </div>
            </div>

            {/* Task Details */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {task.channel_name && (
                  <span>通道: {task.channel_name}</span>
                )}
                {task.retry_count > 0 && (
                  <span className="text-orange-600">重试 {task.retry_count} 次</span>
                )}
              </div>
              <div>
                创建于 {new Date(task.created_at).toLocaleString('zh-CN')}
              </div>
            </div>

            {/* Error Message */}
            {task.error_message && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                错误: {task.error_message}
              </div>
            )}

            {/* Result Summary */}
            {task.result_summary && task.status === 'completed' && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                ✅ {task.result_summary}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {loading ? '刷新中...' : '🔄 刷新'}
        </button>
      </div>
    </div>
  );
}
