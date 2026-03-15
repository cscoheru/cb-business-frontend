'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  opportunity_type: string;
  confidence_score?: number | null;
  created_at: string;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const STATUS_CONFIG = {
  potential: { label: '发现期', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
  verifying: { label: '验证中', color: 'bg-yellow-100 text-yellow-800', icon: '🔬' },
  assessing: { label: '评估中', color: 'bg-purple-100 text-purple-800', icon: '📊' },
  executing: { label: '执行中', color: 'bg-green-100 text-green-800', icon: '🚀' },
  archived: { label: '已归档', color: 'bg-gray-100 text-gray-800', icon: '📦' },
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const config = STATUS_CONFIG[opportunity.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.potential;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            {/* 状态和类型标签 */}
            <div className="flex items-center gap-2">
              <Badge className={config.color}>
                <span className="mr-1">{config.icon}</span>
                {config.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {opportunity.opportunity_type}
              </Badge>
            </div>

            {/* 标题 */}
            <h3 className="text-lg font-semibold line-clamp-2">
              {opportunity.title}
            </h3>
          </div>

          {/* AI可信度 */}
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold text-purple-600">
              {((opportunity.confidence_score ?? 0) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">AI可信度</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 描述 */}
        <p className="text-sm text-gray-600 line-clamp-3">
          {opportunity.description || '暂无描述'}
        </p>

        {/* AI洞察提示 */}
        <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <Brain className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-purple-700">
            <p className="font-medium">AI持续监控中</p>
            <p className="text-purple-600 mt-1">
              正在分析市场变化、竞争对手动态和价格趋势
            </p>
          </div>
        </div>

        {/* 创建时间 */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          创建于 {new Date(opportunity.created_at).toLocaleDateString('zh-CN')}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/opportunities/${opportunity.id}`} className="w-full">
          <Button variant="outline" className="w-full group">
            <span className="flex-1 text-left flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              查看AI分析进展
            </span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
