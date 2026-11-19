export interface Product {
  id: number
  title: string
  description?: string
  category: string
  platform?: string
  imageUrl?: string
  price: number
  originalPrice?: number
  stock: number
  sellerId: number
  rating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  username: string
  role: string
  createdAt: string
}

export interface CartItem {
  id: number
  userId: number
  productId: number
  quantity: number
  product?: Product
}

export interface Order {
  id: number
  userId: number
  status: string
  total: number
  createdAt: string
  orderItems?: OrderItem[]
  keys?: string[]
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  productName?: string
  productImage?: string
  quantity: number
  price: number
}

export interface AuthTokens {
  token: string
  userId: number
  username: string
  role: string
}