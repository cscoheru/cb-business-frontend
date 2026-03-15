// ============ Configuration ============
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';

// Token management
const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// ============ Types ============
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  plan_tier: 'trial' | 'free' | 'pro' | 'enterprise';  // ✅ Added 'trial'
  plan_status: 'active' | 'canceled' | 'expired';  // ✅ Fixed: was 'cancelled'
  region_preference: string | null;
  currency_preference: string;
  created_at: string;
  last_login_at: string | null;  // ✅ Fixed: was 'last_active_at'
  is_admin: boolean;  // ✅ Added
  trial_ends_at: string | null;  // ✅ Added trial_ends_at
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  billing_cycle: 'monthly' | 'yearly' | null;
  amount: number;
  currency: string;
  started_at: string;
  expires_at: string | null;
  canceled_at: string | null;
  auto_renew: boolean;
  features: string[];
}

export interface PlanInfo {
  tier: string;
  name: string;
  price_monthly: number | null;
  price_yearly: number | null;
  features: string[];
}

export interface UsageCheck {
  usage_type: string;
  current_count: number;
  limit: number;
  remaining: number;
  reset_at: string;
}

// ============ Error Handling ============
export class APIError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.status = status;
  }

  getErrorMessage(): string {
    return this.message;
  }

  getErrorCode(): string {
    return this.code;
  }
}

// Helper to get auth headers (without Content-Type)
const getAuthHeaders = () => {
  const token = getToken();
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`
  };
};

// Response handler with detailed error handling
async function handleResponse(response: Response, endpoint: string, method: string): Promise<any> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: response.statusText,
      code: 'UNKNOWN_ERROR'
    }));

    throw new APIError(
      error.detail || `Request failed`,
      error.code || 'HTTP_ERROR',
      response.status
    );
  }

  return response.json();
}

// Retry logic for network errors
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);

      // Don't retry on client errors (4xx) or successful responses
      if (response.ok || response.status < 500) {
        return response;
      }

      // Server error (5xx) - prepare for retry
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

    } catch (error) {
      lastError = error as Error;

      // If network error and not the last attempt, wait and retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// ============ Base API Client ============
export const apiClient = {
  async get(endpoint: string, requiresAuth = true, signal?: AbortSignal) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      Object.assign(headers, getAuthHeaders());
    }

    const response = await fetchWithRetry(
      `${API_BASE_URL}${endpoint}`,
      {
        method: 'GET',
        headers,
        signal,
      }
    );

    return handleResponse(response, endpoint, 'GET');
  },

  async post(endpoint: string, data: any, requiresAuth = false, signal?: AbortSignal) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ✅ Fixed: Only add auth headers when requiresAuth is true
    if (requiresAuth) {
      Object.assign(headers, getAuthHeaders());
    }

    const response = await fetchWithRetry(
      `${API_BASE_URL}${endpoint}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        signal,
      }
    );

    return handleResponse(response, endpoint, 'POST');
  },

  async put(endpoint: string, data: any, requiresAuth = true, signal?: AbortSignal) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      Object.assign(headers, getAuthHeaders());
    }

    const response = await fetchWithRetry(
      `${API_BASE_URL}${endpoint}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        signal,
      }
    );

    return handleResponse(response, endpoint, 'PUT');
  },

  async delete(endpoint: string, requiresAuth = true, signal?: AbortSignal) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      Object.assign(headers, getAuthHeaders());
    }

    const response = await fetchWithRetry(
      `${API_BASE_URL}${endpoint}`,
      {
        method: 'DELETE',
        headers,
        signal,
      }
    );

    return handleResponse(response, endpoint, 'DELETE');
  },

  // ✅ Added: Helper method to create AbortController
  createController(): AbortController {
    return new AbortController();
  }
};

// ============ Auth API ============
export const authApi = {
  async register(email: string, password: string, name: string, plan_choice?: 'trial' | 'free'): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/api/v1/auth/register', {
        email,
        password,
        name,
        plan_choice: plan_choice || 'trial',  // 默认trial
      }, false);  // ✅ requiresAuth = false for public endpoint

      // Store token
      if (response.access_token) {
        setToken(response.access_token);
      }

      return response;
    } catch (error: any) {
      // Enhanced error handling for registration
      if (error.message?.includes('CORS') || error.message?.includes('ERR_FAILED')) {
        throw new Error('注册服务暂时不可用，请稍后再试。如果问题持续，请联系客服。');
      }
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/auth/login', {
      email,
      password,
    }, false);  // ✅ requiresAuth = false for public endpoint

    // Store token
    if (response.access_token) {
      setToken(response.access_token);
    }

    return response;
  },

  logout() {
    removeToken();
  },
};

// ============ Users API ============
export const usersApi = {
  async getMe(): Promise<User> {
    return apiClient.get('/api/v1/users/me');
  },
};

// ============ Subscriptions API ============
export const subscriptionsApi = {
  async getMySubscription(): Promise<Subscription> {
    return apiClient.get('/api/v1/subscriptions/me');
  },

  async createSubscription(planTier: string, billingCycle: 'monthly' | 'yearly'): Promise<Subscription> {
    return apiClient.post('/api/v1/subscriptions', {
      plan_tier: planTier,
      billing_cycle: billingCycle,
    }, true);  // ✅ requires authentication
  },

  async cancelSubscription(): Promise<{ success: boolean; message: string; expires_at: string }> {
    return apiClient.delete('/api/v1/subscriptions', true);  // ✅ requires authentication
  },

  async getPlans(): Promise<PlanInfo[]> {
    return apiClient.get('/api/v1/subscriptions/plans', false);  // ✅ public endpoint
  },

  async getPlanDetails(tier: string): Promise<PlanInfo> {
    return apiClient.get(`/api/v1/subscriptions/plans/${tier}`, false);  // ✅ public endpoint
  },
};

// ============ Usage API ============
export const usageApi = {
  async checkUsage(usageType: string): Promise<UsageCheck> {
    return apiClient.get(`/api/v1/usage/check/${usageType}`);
  },

  async checkFeature(featureName: string): Promise<{
    has_access: boolean;
    feature: string;
    current_plan: string;
    required_plan: string | null;
    message: string | null;
  }> {
    return apiClient.get(`/api/v1/usage/feature/${featureName}`);
  },

  async getUsageStats(): Promise<{
    today: Record<string, number>;
    week: Record<string, number>;
    plan_tier: string;
  }> {
    return apiClient.get('/api/v1/usage/stats');
  },

  async recordUsage(usageType: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    return apiClient.post(`/api/v1/usage/record/${usageType}`, { quantity }, true);  // ✅ requires authentication
  },
};

// ============ Health API ============
export const healthApi = {
  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    database: string;
    redis: string;
  }> {
    return apiClient.get('/health', false);  // ✅ public endpoint
  },
};

// ============ Articles API ============
export interface Article {
  id: string;
  title: string;
  summary: string | null;
  full_content: string | null;
  link: string;
  source: string;
  language: string;
  published_at: string | null;
  crawled_at: string | null;
  region: string | null;
  country: string | null;  // 国家代码 (th, vn, my, us, br, mx)
  platform: string | null;
  content_theme: string | null;
  tags: string[];
  risk_level: string | null;
  opportunity_score: number | null;
  author: string | null;
  is_processed: boolean;
  is_published: boolean;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  per_page: number;
}

export const articlesApi = {
  async getArticles(params?: {
    region?: string;
    country?: string;  // 添加国家筛选参数
    theme?: string;
    platform?: string;
    page?: number;
    per_page?: number;
  }): Promise<ArticlesResponse> {
    const searchParams = new URLSearchParams();
    if (params?.region) searchParams.set('region', params.region);
    if (params?.country) searchParams.set('country', params.country);
    if (params?.theme) searchParams.set('theme', params.theme);
    if (params?.platform) searchParams.set('platform', params.platform);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());

    const queryString = searchParams.toString();
    const url = `/api/v1/crawler-sync/articles${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url, false);  // ✅ public endpoint - 无需认证
  },

  async getArticle(id: string): Promise<Article> {
    return apiClient.get(`/api/v1/crawler-sync/articles/${id}`, false);  // ✅ public endpoint
  },
};

// ============ Cards API ============
export interface Card {
  id: string;
  title: string;
  category: 'wireless_earbuds' | 'smart_plugs' | 'fitness_trackers' | 'phone_chargers' | 'desk_lamps' | 'phone_cases' | 'yoga_mats' | 'coffee_makers' | 'bluetooth_speakers' | 'webcams' | 'keyboards' | 'mouse';
  content: {
    summary: {
      title: string;
      opportunity_score: number;
      market_size: number;
      sweet_spot: {
        min: number;
        max: number;
        best: number;
      };
      reliability: number;
    };
    market_data: {
      price: {
        min: number;
        max: number;
        avg: number;
        count: number;
      };
      rating: {
        min: number;
        max: number;
        avg: number;
        count: number;
      };
    };
    insights: {
      price_sweet_spot: {
        min: number;
        max: number;
        best: number;
      };
      top_products: Array<{
        asin: string;
        title: string;
        price: number;
        rating: number;
        reviews_count: number;
      }>;
      market_saturation: 'low' | 'medium' | 'high';
    };
    recommendations: string[];
    data_sources: string[];
    generated_at: string;
  };
  analysis: {
    category: string;
    category_name: string;
    market_data: {
      total_products: number;
      price_analysis: {
        min: number;
        max: number;
        avg: number;
        count: number;
      };
      rating_analysis: {
        min: number;
        max: number;
        avg: number;
        count: number;
      };
      data_source: string;
      reliability: number;
      fetch_time: string;
    };
    insights: any;
    opportunity_score: number;
    recommendations: string[];
  };
  amazon_data: {
    products?: Array<{
      asin: string;
      title: string;
      price: number;
      rating: number;
      reviews_count: number;
      url: string;
      image_url?: string;
    }>;
  };
  created_at: string;
  published_at: string | null;
  views: number;
  likes: number;
  is_published: boolean;
}

export interface DailyCardsResponse {
  success: boolean;
  date: string;
  count: number;
  cards: Card[];
  cache_info?: {
    mode: string;
    generated_at: string;
  };
}

export interface LatestCardsResponse {
  success: boolean;
  count: number;
  cards: Card[];
}

export interface CardHistoryResponse {
  success: boolean;
  total: number;
  skip: number;
  limit: number;
  cards: Card[];
}

export interface CardStatsResponse {
  success: boolean;
  overview: {
    total_cards: number;
    published_cards: number;
    today_cards: number;
    total_views: number;
    total_likes: number;
    category_breakdown: {
      wireless_earbuds: number;
      smart_plugs: number;
      fitness_trackers: number;
      phone_chargers: number;
      desk_lamps: number;
      phone_cases: number;
      yoga_mats: number;
      coffee_makers: number;
      bluetooth_speakers: number;
      webcams: number;
      keyboards: number;
      mouse: number;
    };
  };
}

export const cardsApi = {
  async getDailyCards(date?: string): Promise<DailyCardsResponse> {
    const url = date
      ? `/api/v1/cards/daily?date=${date}`
      : '/api/v1/cards/daily';
    return apiClient.get(url, false);
  },

  async getLatestCards(limit: number = 3): Promise<LatestCardsResponse> {
    return apiClient.get(`/api/v1/cards/latest?limit=${limit}`, false);
  },

  async getCard(id: string): Promise<{ success: boolean; card: Card }> {
    return apiClient.get(`/api/v1/cards/${id}`, false);
  },

  async likeCard(id: string): Promise<{ success: boolean; card_id: string; likes: number }> {
    return apiClient.post(`/api/v1/cards/${id}/like`, {}, false);
  },

  async getCardHistory(params?: {
    skip?: number;
    limit?: number;
    category?: string;
  }): Promise<CardHistoryResponse> {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category) searchParams.set('category', params.category);

    const queryString = searchParams.toString();
    const url = `/api/v1/cards/history${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url, false);
  },

  async getCardStats(): Promise<CardStatsResponse> {
    return apiClient.get('/api/v1/cards/stats/overview', false);
  },
};

// ============ Favorites API ============

export interface FavoriteItem {
  id: string;
  card_id: string | null;
  opportunity_id: string | null;
  created_at: string;
  card?: Card;
  opportunity?: any; // BusinessOpportunity data
}

export interface FavoriteCheckResponse {
  is_favorite: boolean;
  favorite_id: string | null;
}

export const favoritesApi = {
  async getFavorites(): Promise<FavoriteItem[]> {
    return apiClient.get('/api/v1/favorites', true);
  },

  async addFavorite(cardId: string): Promise<{
    id: string;
    user_id: string;
    card_id: string;
    opportunity_id: string | null;
    created_at: string;
  }> {
    return apiClient.post('/api/v1/favorites', { card_id: cardId, opportunity_id: null }, true);
  },

  async addOpportunityFavorite(opportunityId: string): Promise<{
    id: string;
    user_id: string;
    card_id: string | null;
    opportunity_id: string;
    created_at: string;
  }> {
    return apiClient.post('/api/v1/favorites', { card_id: null, opportunity_id: opportunityId }, true);
  },

  async removeFavorite(favoriteId: string): Promise<void> {
    return apiClient.delete(`/api/v1/favorites/${favoriteId}`, true);
  },

  async removeFavoriteByCard(cardId: string): Promise<void> {
    return apiClient.delete(`/api/v1/favorites/card/${cardId}`, true);
  },

  async removeFavoriteByOpportunity(opportunityId: string): Promise<void> {
    return apiClient.delete(`/api/v1/favorites/opportunity/${opportunityId}`, true);
  },

  async checkFavorite(cardId: string): Promise<FavoriteCheckResponse> {
    return apiClient.get(`/api/v1/favorites/check/${cardId}`, true);
  },

  async checkOpportunityFavorite(opportunityId: string): Promise<FavoriteCheckResponse> {
    return apiClient.get(`/api/v1/favorites/check/opportunity/${opportunityId}`, true);
  },
};

// ============ Payment API ============
export interface PaymentOrderRequest {
  plan_tier: 'free' | 'pro' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
  payment_method: 'wechat' | 'alipay' | 'airwallex';
}

export interface PaymentOrderResponse {
  order_no: string;
  amount: number;
  currency: string;
  payment_method: string;
  code_url?: string;
  qrcode_url?: string;
  client_token?: string;
  payment_intent_id?: string;
  expires_at: string;
}

export const paymentsApi = {
  async createOrder(
    planTier: 'pro' | 'enterprise',
    billingCycle: 'monthly' | 'yearly',
    paymentMethod: 'airwallex' | 'wechat' = 'airwallex'
  ): Promise<PaymentOrderResponse> {
    return apiClient.post('/api/v1/payments/create', {
      plan_tier: planTier,
      billing_cycle: billingCycle,
      payment_method: paymentMethod,
    }, true);
  },

  async queryOrder(orderNo: string): Promise<{
    order_no: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    payment_method: string;
    created_at: string;
    completed_at?: string;
    transaction_id?: string;
  }> {
    return apiClient.get(`/api/v1/payments/${orderNo}`, true);
  },
};

// ============ Opportunities API ============

/** 商机等级 - 基于C-P-I分数的动态等级 */
export type OpportunityGrade = 'lead' | 'normal' | 'priority' | 'landable';

/** 商机状态 */
export type OpportunityStatus = 'potential' | 'verifying' | 'assessing' | 'executing' | 'archived' | 'ignored' | 'failed';

/** 商机类型 */
export type OpportunityType = 'product' | 'policy' | 'platform' | 'brand' | 'industry' | 'region';

export interface BusinessOpportunity {
  id: string;
  title: string;
  description: string | null;
  status: OpportunityStatus;
  opportunity_type: OpportunityType;
  grade: OpportunityGrade | null;

  // C-P-I分数
  cpi_total_score: number | null;
  cpi_competition_score: number | null;
  cpi_potential_score: number | null;
  cpi_intelligence_gap_score: number | null;

  // 置信度和其他
  confidence_score: number;
  elements: Record<string, any>;
  ai_insights: Record<string, any>;
  user_interactions: Record<string, any>;

  // 时间戳
  created_at: string;
  last_verification_at: string | null;
  last_grade_change_at: string | null;
  last_cpi_recalc_at: string | null;

  // 关联
  card_id: string | null;
  article_id: string | null;
  user_id: string | null;
}

export interface OpportunityFunnelResponse {
  success: boolean;
  funnel: {
    [key in OpportunityStatus]: {
      count: number;
      avg_confidence: number;
      label: string;
    };
  };
  total: number;
  description: string;
}

export const opportunitiesApi = {
  async getFunnel(): Promise<OpportunityFunnelResponse> {
    return apiClient.get('/api/v1/opportunities/funnel', false);
  },

  async generateFromCards(cardIds?: string[], limit: number = 10): Promise<{
    success: boolean;
    generated: number;
    opportunities: BusinessOpportunity[];
  }> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (cardIds && cardIds.length > 0) {
      cardIds.forEach(id => params.append('card_ids', id));
    }

    return apiClient.post(`/api/v1/opportunities/generate-from-cards?${params}`, {}, true);
  },

  async getOpportunity(id: string): Promise<{
    success: boolean;
    opportunity: BusinessOpportunity;
  }> {
    return apiClient.get(`/api/v1/opportunities/${id}`, true);
  },

  async listOpportunities(params?: {
    status?: OpportunityStatus;
    grade?: OpportunityGrade;
    type?: OpportunityType;
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    opportunities: BusinessOpportunity[];
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.grade) searchParams.set('grade', params.grade);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const queryString = searchParams.toString();
    return apiClient.get(`/api/v1/opportunities${queryString ? `?${queryString}` : ''}`, true);
  },
};

// ============ Admin API ============
export interface AdminUserStats {
  total: number;
  active: number;
  paid: number;
  growthRate: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  subscription: string;
  status: string;
  createdAt: string;
  lastActiveAt: string;
  apiUsage: {
    limit: number;
    used: number;
  };
}

export interface AdminUserListResponse {
  users: AdminUser[];
  total: number;
}

export interface AdminUserFilters {
  status?: string;
  plan_tier?: string;
  search?: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  period: string;
  startDate: string;
  nextBillingDate: string;
}

export interface AdminSubscriptionListResponse {
  subscriptions: AdminSubscription[];
  stats: {
    total: number;
    active: number;
    pro: number;
    enterprise: number;
    revenue: number;
  };
}

export interface AdminFinanceData {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  subscriptionTrend: Array<{ month: string; count: number }>;
  paymentMethods: Array<{ method: string; count: number; percentage: number }>;
  totalRevenue: number;
  revenueGrowth: number;
  activeSubscriptions: number;
  subscriptionGrowth: number;
}

export interface AdminAnalyticsData {
  totalUsers: number;
  userGrowth: number;
  activeUsers: number;
  averageApiCalls: number;
  apiCallsGrowth: number;
  topMarkets: Array<{ market: string; users: number; growth: number }>;
  topCategories: Array<{ category: string; views: number; growth: number }>;
}

export const adminApi = {
  // User management
  async getUserStats(): Promise<AdminUserStats> {
    return apiClient.get('/api/v1/admin/users/stats', true);
  },

  async getUsers(filters?: AdminUserFilters): Promise<AdminUserListResponse> {
    return apiClient.post('/api/v1/admin/users', filters || {}, true);
  },

  // Subscription management
  async getSubscriptions(filters?: {
    status?: string;
    plan_tier?: string;
  }): Promise<AdminSubscriptionListResponse> {
    return apiClient.post('/api/v1/admin/subscriptions', filters || {}, true);
  },

  // Finance data
  async getFinanceData(period: string = '30d'): Promise<AdminFinanceData> {
    return apiClient.get(`/api/v1/admin/finance?period=${period}`, true);
  },

  // Analytics data
  async getAnalytics(): Promise<AdminAnalyticsData> {
    return apiClient.get('/api/v1/admin/analytics', true);
  },
};
