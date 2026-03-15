'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface UsageTrendChartProps {
  data: Array<{
    date: string;
    views: number;
    favorites: number;
    searches: number;
  }>;
  className?: string;
}

/**
 * Usage trend line chart showing views, favorites, and searches over time
 */
export function UsageTrendChart({ data, className = '' }: UsageTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="views"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="浏览量"
          dot={{ fill: 'hsl(var(--primary))' }}
        />
        <Line
          type="monotone"
          dataKey="favorites"
          stroke="#ec4899"
          strokeWidth={2}
          name="收藏"
          dot={{ fill: '#ec4899' }}
        />
        <Line
          type="monotone"
          dataKey="searches"
          stroke="#f59e0b"
          strokeWidth={2}
          name="搜索"
          dot={{ fill: '#f59e0b' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
