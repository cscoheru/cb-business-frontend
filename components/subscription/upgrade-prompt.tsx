'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  feature?: 'ai_analysis' | 'risk_alert' | 'general';
  variant?: 'card' | 'banner' | 'inline';
  className?: string;
}

export function UpgradePrompt({
  feature = 'general',
  variant = 'card',
  className = ''
}: UpgradePromptProps) {
  const getFeatureInfo = () => {
    switch (feature) {
      case 'ai_analysis':
        return {
          title: '解锁AI深度分析',
          description: '获取AI驱动的市场洞察、竞争对手分析和机会评分',
          icon: <Sparkles className="h-5 w-5" />,
        };
      case 'risk_alert':
        return {
          title: '启用风险预警',
          description: '实时监控政策变化、关税调整和供应链风险',
          icon: <Shield className="h-5 w-5" />,
        };
      default:
        return {
          title: '升级到专业版',
          description: '解锁AI分析、风险预警和无限API调用',
          icon: <TrendingUp className="h-5 w-5" />,
        };
    }
  };

  const info = getFeatureInfo();

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              {info.icon}
            </div>
            <div>
              <p className="font-medium text-purple-900">{info.title}</p>
              <p className="text-sm text-purple-700">{info.description}</p>
            </div>
          </div>
          <Link href="/checkout?plan=pro&cycle=yearly">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              立即升级
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-muted rounded-lg ${className}`}>
        <Zap className="h-4 w-4 text-yellow-600" />
        <div className="flex-1">
          <p className="text-sm font-medium">{info.title}</p>
          <p className="text-xs text-muted-foreground">{info.description}</p>
        </div>
        <Link href="/checkout?plan=pro&cycle=yearly">
          <Button variant="outline" size="sm">
            升级
          </Button>
        </Link>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-50 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            {info.icon}
          </div>
          <div>
            <h3 className="font-semibold">{info.title}</h3>
            <p className="text-sm text-muted-foreground">{info.description}</p>
          </div>
        </div>
        <Badge className="bg-purple-100 text-purple-800">推荐</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>完整市场数据</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>AI机会分析</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>风险预警</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>无限API调用</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href="/checkout?plan=pro&cycle=yearly" className="flex-1">
          <Button className="w-full">
            年付 ¥990
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">省¥198</span>
          </Button>
        </Link>
        <Link href="/checkout?plan=pro&cycle=monthly" className="flex-1">
          <Button variant="outline" className="w-full">
            月付 ¥99
          </Button>
        </Link>
      </div>
    </Card>
  );
}
