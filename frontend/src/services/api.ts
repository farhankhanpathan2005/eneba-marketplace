import type { Product, User, CartItem, Order, AuthTokens } from '../types'

const API = import.meta.env.VITE_API_URL || '/api/v1'

// ─── Token helpers ───────────────────────────────────────────────
const TOKEN_KEY = 'eneba_token'
const USER_KEY = 'eneba_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuth(tokens: AuthTokens): void {
  localStorage.setItem(TOKEN_KEY, tokens.token)
  localStorage.setItem(USER_KEY, JSON.stringify({ id: tokens.userId, username: tokens.username, role: tokens.role }))
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// ─── Fetch wrapper ──────────────────────────────────────────────
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${API}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  // Read body once — can't read twice
  let data: any
  try {
    data = await res.json()
  } catch {
    throw new Error(`HTTP ${res.status}: invalid response`)
  }

  if (!res.ok) {
    const err = data?.error || `HTTP ${res.status}`
    throw new Error(typeof err === 'string' ? err : String(err))
  }

  // ─── Recursive snake_case → camelCase mapper ──────────────────────
  function camelize(obj: any): any {
    if (Array.isArray(obj)) return obj.map(camelize)
    if (obj === null || typeof obj !== 'object') return obj
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = camelize(value)
    }
    return result
  }

  return camelize(data)
}

// ─── Products ───────────────────────────────────────────────────
export const fetchProducts = (params?: {
  page?: number
  limit?: number
  category?: string
  platform?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: string
  search?: string
}): Promise<{ data: Product[]; total: number; page: number; limit: number }> => {
  const qs = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    })
  }
  return request(`/products${qs.toString() ? `?${qs}` : ''}`)
}

export const fetchProductById = (id: number): Promise<Product> =>
  request(`/products/${id}`)

// ─── Auth ───────────────────────────────────────────────────────
// Registration response includes token as well
export interface RegisterResponse {
  id: number
  email: string
  username: string
  role: string
  token: string
  message: string
}

export const registerUser = (data: { email: string; username: string; password: string }): Promise<RegisterResponse> =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(data) })

export const loginUser = (data: { email: string; password: string }): Promise<AuthTokens> =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(data) })

// ─── Cart ───────────────────────────────────────────────────────
export const fetchCart = (): Promise<CartItem[]> => request('/cart')

export const addToCart = (productId: number, quantity = 1): Promise<CartItem> =>
  request('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity }),
  })

export const updateCartItem = (itemId: number, quantity: number): Promise<CartItem> =>
  request(`/cart/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })

export const removeFromCart = (itemId: number): Promise<void> =>
  request(`/cart/${itemId}`, { method: 'DELETE' })

// ─── Orders ─────────────────────────────────────────────────────
export const createOrder = (paymentMethod: string): Promise<Order> =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify({ payment_method: paymentMethod }),
  })

export const fetchOrders = (): Promise<Order[]> => request('/orders')

export const fetchOrderById = (id: number): Promise<Order> =>
  request(`/orders/${id}`)