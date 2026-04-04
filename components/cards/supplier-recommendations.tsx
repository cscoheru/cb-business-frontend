'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Package, ShoppingBag, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SupplierProduct {
  title?: string;
  price_range?: string;
  min_order_quantity?: number;
  supplier_rating?: number;
  monthly_sales?: number;
  image_url?: string;
  product_url?: string;
  supplier_name?: string;
}

interface SupplierRecommendationsProps {
  products: SupplierProduct[];
  loading?: boolean;
}

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-xs text-muted-foreground">N/A</span>;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < fullStars
              ? 'text-yellow-400 fill-yellow-400'
              : i === fullStars && hasHalf
              ? 'text-yellow-400 fill-yellow-200'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="min-w-[220px] max-w-[220px] shrink-0">
      <CardContent className="p-3 space-y-3">
        <Skeleton className="h-28 w-full rounded" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SupplierRecommendations({ products, loading }: SupplierRecommendationsProps) {
  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-4 w-4 text-orange-500" />
          <h4 className="text-sm font-semibold">1688 货源推荐</h4>
          <Badge variant="outline" className="text-xs">加载中...</Badge>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="h-4 w-4 text-orange-500" />
          <h4 className="text-sm font-semibold">1688 货源推荐</h4>
        </div>
        <div className="flex items-center justify-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
          <Package className="h-5 w-5 mr-2" />
          <span className="text-sm">暂无货源数据</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShoppingBag className="h-4 w-4 text-orange-500" />
        <h4 className="text-sm font-semibold">1688 货源推荐</h4>
        <Badge variant="outline" className="text-xs">{products.length} 件商品</Badge>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((product, idx) => (
          <Card key={idx} className="min-w-[220px] max-w-[220px] shrink-0 hover:shadow-md transition-shadow">
            <CardContent className="p-3 space-y-2">
              {/* Image or placeholder */}
              <div className="h-28 w-full rounded bg-muted flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title || 'Product'}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>

              {/* Title */}
              <p className="text-xs font-medium line-clamp-2 leading-tight min-h-[2rem]">
                {product.title || '商品名称未知'}
              </p>

              {/* Supplier name */}
              {product.supplier_name && (
                <p className="text-xs text-muted-foreground truncate">{product.supplier_name}</p>
              )}

              {/* Price */}
              <div className="text-sm font-bold text-orange-600">
                {product.price_range || '询价'}
              </div>

              {/* Meta info row */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>MOQ: {product.min_order_quantity || '-'}</span>
                </div>
                {product.monthly_sales !== undefined && product.monthly_sales > 0 && (
                  <span>月销 {product.monthly_sales >= 1000 ? `${(product.monthly_sales / 1000).toFixed(1)}k` : product.monthly_sales}</span>
                )}
              </div>

              {/* Rating */}
              <StarRating rating={product.supplier_rating} />

              {/* CTA */}
              {product.product_url && (
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7 mt-1"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    查看货源
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
