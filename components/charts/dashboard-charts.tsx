'use client';

import { TrendChart } from './trend-chart';
import { CustomPieChart } from './pie-chart';
import { CustomBarChart } from './bar-chart';
import { StatsCard } from './stats-card';
import { TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

// Mock data - replace with real API data
const trendData = [
  { name: '1月', value: 400 },
  { name: '2月', value: 300 },
  { name: '3月', value: 600 },
  { name: '4月', value: 800 },
  { name: '5月', value: 500 },
  { name: '6月', value: 700 },
];

const categoryData = [
  { name: '电子产品', value: 400 },
  { name: '家居用品', value: 300 },
  { name: '服饰配件', value: 300 },
  { name: '美妆个护', value: 200 },
  { name: '其他', value: 150 },
];

const comparisonData = [
  { name: '本月', 本月销售额: 4000, 上月销售额: 2400 },
  { name: '上月', 本月销售额: 3000, 上月销售额: 1398 },
  { name: '去年同期', 本月销售额: 2000, 上月销售额: 9800 },
];

export function DashboardCharts() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="总销售额"
          value="¥12,345"
          change={12.5}
          changeLabel="较上月"
          trend="up"
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
        />
        <StatsCard
          title="新增用户"
          value="1,234"
          change={8.2}
          changeLabel="较上月"
          trend="up"
          icon={<Users className="h-6 w-6 text-green-600" />}
        />
        <StatsCard
          title="订单数量"
          value="567"
          change={-3.2}
          changeLabel="较上月"
          trend="down"
          icon={<ShoppingCart className="h-6 w-6 text-purple-600" />}
        />
        <StatsCard
          title="转化率"
          value="2.4%"
          change={0.1}
          changeLabel="较上月"
          trend="up"
          icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TrendChart
          data={trendData}
          title="销售趋势"
          dataKey="value"
          color="#3b82f6"
        />
        <CustomPieChart
          data={categoryData}
          title="品类分布"
        />
      </div>

      {/* Comparison Chart */}
      <CustomBarChart
        data={comparisonData}
        title="销售对比"
        dataKeys={['本月销售额', '上月销售额']}
        colors={['#3b82f6', '#10b981']}
        height={300}
      />
    </div>
  );
}
