'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProfitEstimator } from '@/components/cards/profit-estimator';

export default function CostCalculatorPage() {
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
        <h1 className="text-3xl font-bold mb-2">利润计算器</h1>
        <p className="text-gray-600">
          智能计算产品利润，包含采购、物流、关税、平台佣金等全链路成本分析
        </p>
      </div>

      {/* Profit Estimator */}
      <ProfitEstimator />

      {/* Usage tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">使用提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>采购价为人民币进货价，系统自动按实时汇率换算</li>
          <li>物流成本根据目的地国家和包裹重量自动计算</li>
          <li>关税根据目标国家和产品品类自动匹配</li>
          <li>平台佣金根据所选电商平台自动计算</li>
          <li>建议利润率保持在 20% 以上以获得健康的收益</li>
        </ul>
      </div>
    </div>
  );
}
