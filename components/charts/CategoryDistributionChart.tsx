'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface CategoryDistributionChartProps {
  data: Array<{
    category: string;
    count: number;
    color: string;
  }>;
  className?: string;
}

/**
 * Bar chart showing distribution of cards/opportunities by category
 */
export function CategoryDistributionChart({
  data,
  className = '',
}: CategoryDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={className}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          type="number"
          className="text-xs"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          type="category"
          dataKey="category"
          width={80}
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
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
