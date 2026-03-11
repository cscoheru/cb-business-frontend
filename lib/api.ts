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
  plan_tier: 'free' | 'pro' | 'enterprise';
  plan_status: 'active' | 'canceled' | 'expired';  // ✅ Fixed: was 'cancelled'
  region_preference: string | null;
  currency_preference: string;
  created_at: string;
  last_login_at: string | null;  // ✅ Fixed: was 'last_active_at'
  is_admin: boolean;  // ✅ Added
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
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/auth/register', {
      email,
      password,
      name,
    }, false);  // ✅ requiresAuth = false for public endpoint

    // Store token
    if (response.access_token) {
      setToken(response.access_token);
    }

    return response;
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
    const url = `/api/v1/crawler/articles${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(url, false);  // ✅ public endpoint - 无需认证
  },

  async getArticle(id: string): Promise<Article> {
    return apiClient.get(`/api/v1/crawler/articles/${id}`, false);  // ✅ public endpoint
  },
};
