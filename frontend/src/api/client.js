const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('aura_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const isJson = res.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      if (res.status === 401) {
        // Clear invalid token if expired/unauthorized
        localStorage.removeItem('aura_token');
        localStorage.removeItem('aura_user');
      }
      const message = data?.error || res.statusText || 'API request failed';
      throw new ApiError(message, res.status, data);
    }

    return {
      data,
      status: res.status,
      headers: {
        cache: res.headers.get('x-cache'),
        responseTimeMs: res.headers.get('x-response-time-ms')
      }
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network connection failed', 0, null);
  }
}

// Authentication API
export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me')
};

// Categories API
export const categoriesApi = {
  getAll: () => apiRequest('/categories')
};

// Transactions API
export const transactionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiRequest(`/transactions?${query.toString()}`);
  },
  getById: (id) => apiRequest(`/transactions/${id}`),
  create: (payload) => apiRequest('/transactions', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  delete: (id) => apiRequest(`/transactions/${id}`, { method: 'DELETE' })
};

// Analytics API
export const analyticsApi = {
  getSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/analytics/summary${query ? `?${query}` : ''}`);
  },
  getTrends: (months = 6) => apiRequest(`/analytics/trends?months=${months}`),
  getCategories: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/analytics/categories${query ? `?${query}` : ''}`);
  },
  getBenchmark: () => apiRequest('/analytics/benchmark')
};

// Users API (Admin)
export const usersApi = {
  getAll: (search = '') => apiRequest(`/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  updateRole: (id, role) => apiRequest(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
};

// Health API
export const healthApi = {
  check: () => apiRequest('/health')
};
