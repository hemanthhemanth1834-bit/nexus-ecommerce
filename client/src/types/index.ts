export interface User {
  id: number
  email: string
  name: string
  role: string
  avatar?: string
  createdAt: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  image: string
  images: string[]
  categoryId: number
  category?: Category
  stock: number
  rating: number
  reviewCount: number
  featured: boolean
  specifications?: Record<string, string>
  createdAt: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  _count?: { products: number }
}

export interface CartItem {
  id: number
  productId: number
  quantity: number
  product: Product
}

export interface Cart {
  id: number
  items: CartItem[]
}

export interface Order {
  id: number
  userId: number
  total: number
  status: string
  paymentStatus: string
  shippingAddress: string
  items: OrderItem[]
  user?: User
  createdAt: string
}

export interface OrderItem {
  id: number
  productId: number
  quantity: number
  price: number
  product: Product
}

export interface Review {
  id: number
  userId: number
  productId: number
  rating: number
  comment: string
  user?: User
  createdAt: string
}

export interface WishlistItem {
  id: number
  productId: number
  product: Product
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sort?: string
  page?: number
  limit?: number
  featured?: boolean
}
