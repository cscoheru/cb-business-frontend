'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calculator, Loader2 } from 'lucide-react';
import { profitApi, logisticsApi, tariffsApi } from '@/lib/api';
import { ProfitBreakdown } from './profit-breakdown';

interface ProfitEstimatorProps {
  initialData?: any;
  compact?: boolean;
}

const DEFAULT_COUNTRIES = [
  { code: 'US', name: '美国' },
  { code: 'UK', name: '英国' },
  { code: 'DE', name: '德国' },
  { code: 'JP', name: '日本' },
  { code: 'TH', name: '泰国' },
  { code: 'MY', name: '马来西亚' },
];

const DEFAULT_CATEGORIES = [
  { code: 'electronics', name: '电子产品' },
  { code: 'clothing', name: '服装配饰' },
  { code: 'home_garden', name: '家居园艺' },
  { code: 'beauty', name: '美妆个护' },
  { code: 'sports', name: '运动户外' },
  { code: 'toys', name: '玩具母婴' },
];

const PLATFORMS = [
  { code: 'amazon', name: 'Amazon' },
  { code: 'shopee', name: 'Shopee' },
  { code: 'lazada', name: 'Lazada' },
];

export function ProfitEstimator({ initialData, compact = false }: ProfitEstimatorProps) {
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [destination, setDestination] = useState(initialData?.destination || 'US');
  const [category, setCategory] = useState(initialData?.category || 'electronics');
  const [platform, setPlatform] = useState(initialData?.platform || 'amazon');
  const [purchasePriceCny, setPurchasePriceCny] = useState(initialData?.purchase_price_cny?.toString() || '');
  const [sellingPriceUsd, setSellingPriceUsd] = useState(initialData?.selling_price_usd?.toString() || '');
  const [weightKg, setWeightKg] = useState(initialData?.weight_kg?.toString() || '');
  const [result, setResult] = useState<any>(initialData?.result || null);
  const [loading, setLoading] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);

  // Fetch countries and categories on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      setFetchingMeta(true);
      try {
        const [countriesRes, categoriesRes] = await Promise.allSettled([
          logisticsApi.getCountries(),
          tariffsApi.getCategories(),
        ]);
        if (countriesRes.status === 'fulfilled' && countriesRes.value?.countries?.length) {
          setCountries(countriesRes.value.countries.map((c: any) => ({
            code: c.code || c.country_code,
            name: c.name || c.country_name || c.code,
          })));
        }
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.categories?.length) {
          setCategories(categoriesRes.value.categories.map((c: any) => ({
            code: c.code || c.category_code,
            name: c.name || c.category_name || c.code,
          })));
        }
      } catch {
        // Silently fall back to defaults
      } finally {
        setFetchingMeta(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!purchasePriceCny || !sellingPriceUsd || !weightKg) return;

    setLoading(true);
    try {
      const data = {
        selling_price_usd: parseFloat(sellingPriceUsd),
        purchase_price_cny: parseFloat(purchasePriceCny),
        weight_kg: parseFloat(weightKg),
        destination,
        category,
        platform,
      };
      const res = await profitApi.calculate(data);
      setResult(res);
    } catch (error: any) {
      console.error('Profit calculation failed:', error);
    } finally {
      setLoading(false);
    }
  }, [purchasePriceCny, sellingPriceUsd, weightKg, destination, category, platform]);

  const labelClass = compact ? 'text-xs' : 'text-sm';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-blue-600" />
          <h3 className={compact ? 'text-sm font-semibold' : 'text-lg font-semibold'}>利润计算器</h3>
          {!fetchingMeta && (
            <Badge variant="outline" className="text-xs">
              {countries.length} 国家 / {categories.length} 品类
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selectors row */}
        <div className={`grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-3'}`}>
          <div>
            <label className={`block ${labelClass} font-medium text-muted-foreground mb-1`}>目标市场</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full h-8 px-2 text-sm border rounded-lg bg-transparent focus:ring-2 focus:ring-ring"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block ${labelClass} font-medium text-muted-foreground mb-1`}>产品品类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-8 px-2 text-sm border rounded-lg bg-transparent focus:ring-2 focus:ring-ring"
            >
              {categories.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block ${labelClass} font-medium text-muted-foreground mb-1`}>销售平台</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full h-8 px-2 text-sm border rounded-lg bg-transparent focus:ring-2 focus:ring-ring"
            >
              {PLATFORMS.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Input fields */}
        <div className={`grid gap-3 ${compact ? 'grid-cols-3' : 'grid-cols-3'}`}>
          <div>
            <label className={`block ${labelClass} font-medium text-muted-foreground mb-1`}>采购价 (CNY)</label>
            <Input
              type="number"
              placeholder="例如: 50"
              value={purchasePriceCny}
              onChange={(e) => setPurchasePriceCny(e.target.value)}
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className={`block ${labelClass} font-medium text-muted-foreground mb-1`}>售价 (USD)</label>
            <Input
              type="number"
              placeholder="例如: 29.99"
              value={sellingPriceUsd}
              onChange={(e) => setSellingPriceUsd(e.target.value)}
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className={`block ${labelClass} font-medium text-muted-foreground mb-1`}>重量 (kg)</label>
            <Input
              type="number"
              placeholder="例如: 0.3"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              min={0}
              step={0.01}
            />
          </div>
        </div>

        {/* Calculate button */}
        <Button
          onClick={handleCalculate}
          disabled={loading || !purchasePriceCny || !sellingPriceUsd || !weightKg}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              计算中...
            </>
          ) : (
            '计算利润'
          )}
        </Button>

        {/* Result */}
        {result && (
          <div className="border-t pt-4">
            <ProfitBreakdown data={result} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
