'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

/**
 * 商机等级枚举 - 基于C-P-I分数的动态等级
 * - LEAD: < 60分，需进一步验证
 * - NORMAL: 60-69分，保持关注
 * - PRIORITY: 70-84分，优先验证
 * - LANDABLE: ≥ 85分，可落地执行
 */
export type OpportunityGrade = 'lead' | 'normal' | 'priority' | 'landable';

interface OpportunityGradeBadgeProps {
  grade: OpportunityGrade | null | undefined;
  score?: number | null;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const GRADE_CONFIG: Record<OpportunityGrade, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}> = {
  lead: {
    label: '线索',
    description: '需进一步验证 (C-P-I < 60分)',
    color: 'border-slate-300',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    icon: '🔍'
  },
  normal: {
    label: '普通商机',
    description: '保持关注 (C-P-I 60-69分)',
    color: 'border-blue-300',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: '📊'
  },
  priority: {
    label: '重点商机',
    description: '优先验证 (C-P-I 70-84分)',
    color: 'border-amber-300',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: '⭐'
  },
  landable: {
    label: '落地商机',
    description: '可落地执行 (C-P-I ≥ 85分)',
    color: 'border-green-300',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: '🚀'
  }
};

export function OpportunityGradeBadge({
  grade,
  score,
  showScore = false,
  size = 'md'
}: OpportunityGradeBadgeProps) {
  if (!grade) {
    return (
      <Badge variant="outline" className="border-gray-300">
        未评级
      </Badge>
    );
  }

  const config = GRADE_CONFIG[grade];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${config.color} ${config.bgColor} ${config.textColor} ${sizeClasses[size]} border-2 font-medium`}
          >
            <span className="mr-1">{config.icon}</span>
            <span>{config.label}</span>
            {showScore && score !== null && score !== undefined && (
              <span className="ml-1 opacity-75">({Math.round(score)}分)</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
            {score !== null && score !== undefined && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">C-P-I总分:</span>
                  <span className="font-medium">{Math.round(score)}分</span>
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * 商机等级进度条组件
 * 显示C-P-I三维度分数
 */
interface CPIScoreBarProps {
  competitionScore?: number | null;
  potentialScore?: number | null;
  intelligenceGapScore?: number | null;
  totalScore?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export function CPIScoreBar({
  competitionScore,
  potentialScore,
  intelligenceGapScore,
  totalScore,
  size = 'md'
}: CPIScoreBarProps) {
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  const textClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2 w-full">
      {/* 总分 */}
      {totalScore !== null && totalScore !== undefined && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className={`${textClass} text-muted-foreground`}>C-P-I总分</span>
            <span className={`${textClass} font-medium`}>{Math.round(totalScore)}分</span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
            <div
              className={`h-full ${getScoreColor(totalScore)} transition-all duration-500`}
              style={{ width: `${Math.min(totalScore, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 分项分数 */}
      <div className="space-y-1.5">
        {/* 竞争度 (40%权重) */}
        {competitionScore !== null && competitionScore !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`${textClass} text-muted-foreground`}>
                竞争度 (C)
              </span>
              <span className={`${textClass} font-medium text-xs`}>
                {Math.round(competitionScore)}
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
              <div
                className={`h-full ${getScoreColor(competitionScore)} transition-all duration-500`}
                style={{ width: `${Math.min(competitionScore, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 增长潜力 (40%权重) */}
        {potentialScore !== null && potentialScore !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`${textClass} text-muted-foreground`}>
                增长潜力 (P)
              </span>
              <span className={`${textClass} font-medium text-xs`}>
                {Math.round(potentialScore)}
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
              <div
                className={`h-full ${getScoreColor(potentialScore)} transition-all duration-500`}
                style={{ width: `${Math.min(potentialScore, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 信息差 (20%权重) */}
        {intelligenceGapScore !== null && intelligenceGapScore !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className={`${textClass} text-muted-foreground`}>
                信息差 (I)
              </span>
              <span className={`${textClass} font-medium text-xs`}>
                {Math.round(intelligenceGapScore)}
              </span>
            </div>
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
              <div
                className={`h-full ${getScoreColor(intelligenceGapScore)} transition-all duration-500`}
                style={{ width: `${Math.min(intelligenceGapScore, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="pt-2 border-t">
        <p className={`${textClass} text-muted-foreground`}>
          C-P-I算法: 竞争度(40%) + 增长潜力(40%) + 信息差(20%)
        </p>
      </div>
    </div>
  );
}

/**
 * 根据C-P-I总分计算等级
 */
export function calculateGradeFromScore(score: number): OpportunityGrade {
  if (score < 60) return 'lead';
  if (score < 70) return 'normal';
  if (score < 85) return 'priority';
  return 'landable';
}
