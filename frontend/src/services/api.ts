import type { Product } from '../types'

const API_BASE_URL = '/api/v1'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

export const fetchProducts = (): Promise<Product[]> => {
  return request<Product[]>('/products')
}

export const fetchProductById = (id: string): Promise<Product> => {
  return request<Product>(`/products/${id}`)
}

export const fetchProductsByCategory = (category: string): Promise<Product[]> => {
  return request<Product[]>(`/products/category?category=${category}`)
}

export const registerUser = (data: { email: string; username: string; password: string }) => {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const loginUser = (data: { email: string; password: string }) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
