'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface Product {
  asin: string;
  title: string;
  brand: string;
  price: number | null;
  rating: number | null;
  reviews_count: number;
  image: string | null;
  url: string;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'electronics';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  const categoryNames: Record<string, string> = {
    electronics: '电子',
    beauty: '美妆',
    home: '家居',
    fashion: '服饰',
    food: '食品',
    baby: '母婴',
    sports: '运动',
    pets: '宠物',
  };

  const categoryEmojis: Record<string, string> = {
    electronics: '📱',
    beauty: '💄',
    home: '🏠',
    fashion: '👗',
    food: '🍜',
    baby: '👶',
    sports: '⚽',
    pets: '🐕',
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await fetch(`https://api.zenconsult.top/api/v1/products/categories/${category}/trending?limit=24`);

        if (response.ok) {
          const result = await response.json();
          setProducts(result.products || []);
          setCategoryName(categoryNames[category] || category);
        } else {
          console.error('API error:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {categoryEmojis[category]} Amazon {categoryName} 热门产品
        </h1>
        <p className="text-gray-600">
          基于 Oxylabs 实时 Amazon Best Sellers 数据
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">加载中...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400">暂无产品数据，请稍后重试</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.asin} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-40 object-contain mb-3"
                  />
                )}
                <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">
                  {product.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  品牌: {product.brand || 'N/A'}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  {product.rating && (
                    <span className="flex items-center">
                      ⭐ {product.rating}
                    </span>
                  )}
                  {product.reviews_count > 0 && (
                    <span>{product.reviews_count} 评论</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  {product.price && (
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price}
                    </span>
                  )}
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    查看
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
