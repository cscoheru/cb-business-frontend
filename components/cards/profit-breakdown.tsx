'use client';

interface ProfitBreakdownProps {
  data: {
    selling_price_usd?: number;
    total_cost_usd?: number;
    net_profit_usd?: number;
    margin_percent?: number;
    cost_breakdown?: {
      purchase_cost_usd?: number;
      logistics_cost_usd?: number;
      tariff_cost_usd?: number;
      vat_cost_usd?: number;
      platform_commission_usd?: number;
      fba_fee_usd?: number;
      other_costs_usd?: number;
    };
    logistics?: {
      shipping_method?: string;
      carrier?: string;
      estimated_days?: number;
    };
    exchange_rate?: number;
  };
}

const COST_LABELS: Record<string, { label: string; color: string }> = {
  purchase_cost_usd: { label: '采购成本', color: 'bg-blue-500' },
  logistics_cost_usd: { label: '物流成本', color: 'bg-orange-500' },
  tariff_cost_usd: { label: '关税', color: 'bg-red-500' },
  vat_cost_usd: { label: 'VAT', color: 'bg-rose-400' },
  platform_commission_usd: { label: '平台佣金', color: 'bg-purple-500' },
  fba_fee_usd: { label: 'FBA费用', color: 'bg-gray-500' },
  other_costs_usd: { label: '其他', color: 'bg-gray-400' },
};

function getMarginColor(margin?: number): string {
  if (!margin) return 'text-gray-500';
  if (margin > 20) return 'text-green-600';
  if (margin >= 10) return 'text-yellow-600';
  return 'text-red-600';
}

function getMarginBgColor(margin?: number): string {
  if (!margin) return 'bg-gray-100';
  if (margin > 20) return 'bg-green-50';
  if (margin >= 10) return 'bg-yellow-50';
  return 'bg-red-50';
}

function getMarginLabel(margin?: number): string {
  if (!margin) return '-';
  if (margin > 30) return '优秀';
  if (margin > 20) return '良好';
  if (margin >= 10) return '一般';
  if (margin >= 0) return '较低';
  return '亏损';
}

export function ProfitBreakdown({ data }: ProfitBreakdownProps) {
  const breakdown = data.cost_breakdown || {};
  const totalCost = data.total_cost_usd || 0;
  const netProfit = data.net_profit_usd || 0;
  const margin = data.margin_percent || 0;
  const sellingPrice = data.selling_price_usd || 1; // avoid division by zero

  // Calculate relative widths for the cost bar
  const costEntries = Object.entries(breakdown).filter(
    ([key, val]) => val && val > 0 && COST_LABELS[key]
  );

  return (
    <div className="space-y-4">
      {/* Cost Breakdown Bar */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">成本结构 (占售价比例)</p>
        <div className="w-full h-6 rounded-full overflow-hidden flex bg-gray-100">
          {costEntries.map(([key, val]) => {
            const label = COST_LABELS[key];
            const widthPct = Math.max(((val as number) / sellingPrice) * 100, 1);
            return (
              <div
                key={key}
                className={`${label.color} h-full transition-all`}
                style={{ width: `${widthPct}%` }}
                title={`${label.label}: $${(val as number).toFixed(2)}`}
              />
            );
          })}
        </div>
      </div>

      {/* Cost Items Detail */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {costEntries.map(([key, val]) => {
          const label = COST_LABELS[key];
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-sm ${label.color}`} />
                <span className="text-muted-foreground">{label.label}</span>
              </div>
              <span className="font-medium">${(val as number).toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Total Cost Line */}
      <div className="border-t pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">总成本</span>
          <span className="font-semibold">${totalCost.toFixed(2)}</span>
        </div>
      </div>

      {/* Net Profit */}
      <div className={`rounded-lg p-4 ${getMarginBgColor(margin)}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">净利润</p>
            <p className={`text-3xl font-bold ${getMarginColor(margin)}`}>
              {netProfit >= 0 ? '$' : '-$'}{Math.abs(netProfit).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">利润率</p>
            <p className={`text-2xl font-bold ${getMarginColor(margin)}`}>
              {margin.toFixed(1)}%
            </p>
            <p className={`text-xs font-medium ${getMarginColor(margin)}`}>
              {getMarginLabel(margin)}
            </p>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      {data.logistics && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
          {data.logistics.shipping_method && (
            <span>物流: {data.logistics.shipping_method}</span>
          )}
          {data.logistics.carrier && (
            <span>承运商: {data.logistics.carrier}</span>
          )}
          {data.logistics.estimated_days && (
            <span>时效: {data.logistics.estimated_days} 天</span>
          )}
        </div>
      )}

      {/* Exchange rate */}
      {data.exchange_rate && (
        <p className="text-xs text-muted-foreground">
          汇率: 1 USD = {data.exchange_rate.toFixed(4)} CNY
        </p>
      )}
    </div>
  );
}
