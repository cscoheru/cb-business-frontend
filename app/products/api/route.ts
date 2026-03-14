import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') || 'electronics';

  try {
    // Server-side fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://api.zenconsult.top/api/v1/products/categories/${category}/trending?limit=24`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return Response.json({ error: `API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);

  } catch (error) {
    console.error('Server-side fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch products', products: [], category, category_name: getCategoryName(category) },
      { status: 200 }
    );
  }
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    electronics: '电子',
    beauty: '美妆',
    home: '家居',
    fashion: '服饰',
    food: '食品',
    baby: '母婴',
    sports: '运动',
    pets: '宠物',
  };
  return names[category] || category;
}
