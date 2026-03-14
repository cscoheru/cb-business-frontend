'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface BarData {
  name: string;
  [key: string]: string | number;
}

interface CustomBarChartProps {
  data: BarData[];
  title?: string;
  dataKeys: string[];
  colors?: string[];
  height?: number;
  layout?: 'vertical' | 'horizontal';
}

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function CustomBarChart({
  data,
  title = '柱状图',
  dataKeys,
  colors = DEFAULT_COLORS,
  height = 300,
  layout = 'vertical',
}: CustomBarChartProps) {
  return (
    <Card className="p-6">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type={layout === 'vertical' ? 'number' : 'category'}
            dataKey={layout === 'vertical' ? undefined : 'name'}
            className="text-sm"
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            type={layout === 'vertical' ? 'category' : 'number'}
            dataKey={layout === 'vertical' ? 'name' : undefined}
            className="text-sm"
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
