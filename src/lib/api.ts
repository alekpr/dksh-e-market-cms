/**
 * API Client Configuration and Utilities
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// Types for API responses
export interface ApiResponse<T = any> {
  status?: 'success' | 'fail' | 'error'
  success?: boolean
  message?: string
  data?: T
  results?: number
  token?: string
  accessToken?: string
  refreshToken?: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'customer' | 'merchant' | 'admin'
  active: boolean
  status?: 'active' | 'inactive' | 'suspended' | 'pending'
  createdAt: string
  updatedAt?: string
  avatar?: string
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other'
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  }
  permissions?: string[]
  tags?: string[]
  adminNotes?: Array<{
    note: string
    addedBy: string
    addedAt: string
  }>
  security?: {
    passwordChangedAt?: string
    accountLockedUntil?: string | null
    failedLoginAttempts?: number
    lastLogin?: string
    lastLoginIP?: string
    loginCount?: number
    twoFactorEnabled?: boolean
    passwordResetToken?: string | null
    passwordResetExpires?: string | null
  }
  merchantInfo?: {
    storeId: string
    storeName: string
    storeStatus?: 'pending' | 'active' | 'suspended' | 'inactive'
    canManageStore?: boolean
  }
  activitySummary?: {
    orderCount?: number
    totalSpent?: number
    avgOrderValue?: number
    lastOrderDate?: string
    favoriteCategories?: string[]
    loyaltyPoints?: number
  }
}

// User API Types
export interface UserApiResponse {
  success: boolean
  count?: number
  results?: number
  pagination?: {
    total: number
    page: number
    pages: number
    limit: number
  }
  data: User[]
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  passwordConfirm: string
  role: 'customer' | 'merchant' | 'admin'
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other'
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  }
  permissions?: string[]
  tags?: string[]
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  passwordConfirm?: string
  role?: 'customer' | 'merchant' | 'admin'
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other'
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  }
  permissions?: string[]
  tags?: string[]
}

export interface UserStatusRequest {
  status: 'active' | 'inactive' | 'suspended' | 'pending'
}

export interface UserRoleRequest {
  role: 'customer' | 'merchant' | 'admin'
  reason?: string
}

export interface UserPermissionsRequest {
  permissions: string[]
  action: 'set' | 'add' | 'remove'
}

export interface AccountLockRequest {
  action: 'lock' | 'unlock'
}

export interface AdminNoteRequest {
  note: string
}

export interface BulkUserOperationRequest {
  userIds: string[]
  operation: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'delete'
  data?: any
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

// Store Management Types
// Store API Types
export interface Store {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  contactEmail: string;
  contactPhone: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  owner?: {
    _id: string;
    name: string;
    email: string;
    fullName: string;
    isAccountLocked: boolean;
    daysSinceRegistration: number | null;
    id: string;
  };
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  commission?: {
    rate: number;
    feeStructure: string;
  };
  businessInfo?: {
    businessType: string;
  };
  metrics?: {
    totalSales: number;
    averageRating: number;
    totalOrders: number;
    productCount: number;
  };
  createdAt: string;
  updatedAt: string;
  __v?: number;
  id: string;
}

// Product API Types
export interface ProductVariant {
  _id: string;
  name: string;
  price: number;
  attributes: Record<string, string>;
  sku?: string;
  barcode?: string;
  inventory: {
    quantity: number;
    trackInventory: boolean;
    lowStockThreshold?: number;
  };
  isDefault: boolean;
  images?: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: {
    short: string;
    detailed: string;
  };
  categories: Category[] | string[];
  store: Store | string;
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'deleted';
  featured: boolean;
  images: string[];
  hasVariants: boolean;
  variants: ProductVariant[];
  rating?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  basePrice: number;
  description: {
    short: string;
    detailed: string;
  };
  store: string;
  categories: string[];
  status?: 'draft' | 'active';
  images?: string[];
  hasVariants?: boolean;
  variants?: Omit<ProductVariant, '_id'>[];
}

export interface UpdateProductRequest {
  name?: string;
  basePrice?: number;
  description?: {
    short?: string;
    detailed?: string;
  };
  categories?: string[];
  images?: string[];
  variants?: ProductVariant[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  status?: string;
  store?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Category API Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: Category | string;
  level: number;
  ancestors: Category[];
  image?: string;
  icon?: string;
  isActive: boolean;
  order: number;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  featuredOrder?: number;
  children?: Category[];
  productCount?: {
    direct: number;
    children?: number;
    total: number;
  };
  breadcrumbs?: Category[];
  path?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreListResponse {
  count: number
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
  data: Store[]
}

// Actual API response structure (what the server returns)
export interface StoreApiResponse {
  success: boolean
  count: number
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
  data: Store[]
}

export interface StoreStats {
  totalSales: number
  averageRating: number
  totalOrders: number
  productCount: number
  daysActive: number
}

export interface CreateStoreRequest {
  name: string
  description?: string
  contactEmail: string
  contactPhone: string
  address: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country: string
  }
  owner: string
  businessInfo?: {
    businessType?: string
    taxId?: string
    registrationNumber?: string
  }
  payoutInfo?: {
    bankName?: string
    accountNumber?: string
    accountName?: string
  }
}

export interface UpdateStoreRequest {
  name?: string
  description?: string
  contactEmail?: string
  contactPhone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  businessInfo?: {
    businessType?: string
    taxId?: string
    registrationNumber?: string
  }
  payoutInfo?: {
    bankName?: string
    accountNumber?: string
    accountName?: string
  }
}

export interface StoreStatusRequest {
  status: 'pending' | 'active' | 'suspended' | 'inactive'
}

export interface StoreCommissionRequest {
  rate: number
  feeStructure?: 'percentage' | 'fixed' | 'tiered'
}

// Token management utilities
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token')
  },
  
  setAccessToken: (token: string): void => {
    localStorage.setItem('access_token', token)
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token')
  },
  
  setRefreshToken: (token: string): void => {
    localStorage.setItem('refresh_token', token)
  },
  
  clearTokens: (): void => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    try {
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  },
  
  setUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

// HTTP Client class
class ApiClient {
  private baseURL: string
  private refreshing: Promise<string | null> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Add auth token if available
    const token = tokenStorage.getAccessToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle 401 (unauthorized) by attempting token refresh
      if (response.status === 401 && token) {
        const newToken = await this.handleTokenRefresh()
        if (newToken) {
          // Retry the original request with new token
          headers.Authorization = `Bearer ${newToken}`
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          })
          return this.handleResponse<T>(retryResponse)
        }
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API request failed:', error)
      throw new Error('Network error occurred')
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      if (!response.ok) {
        // Include status code in error message for better debugging
        const errorMessage = data.message || `HTTP error! status: ${response.status}`
        const error = new Error(errorMessage)
        // Add response status to error for better handling
        ;(error as any).status = response.status
        throw error
      }
      
      return data
    } else {
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`)
        ;(error as any).status = response.status
        throw error
      }
      
      return {
        status: 'success',
        data: {} as T
      }
    }
  }

  private async handleTokenRefresh(): Promise<string | null> {
    // Skip token refresh if no refresh token is available
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      console.log('No refresh token available, clearing auth data')
      tokenStorage.clearTokens()
      
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page...')
        window.location.href = '/login'
      }
      return null
    }

    // Prevent multiple simultaneous refresh requests
    if (this.refreshing) {
      return this.refreshing
    }

    this.refreshing = this.performTokenRefresh(refreshToken)
    
    try {
      const newToken = await this.refreshing
      return newToken
    } finally {
      this.refreshing = null
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string | null> {
    try {
      console.log('Attempting to refresh token...')
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        console.error('Token refresh failed with status:', response.status)
        throw new Error('Token refresh failed')
      }

      const data: ApiResponse<RefreshTokenResponse> = await response.json()
      
      if (data.status === 'success' && data.data?.accessToken) {
        console.log('Token refresh successful')
        tokenStorage.setAccessToken(data.data.accessToken)
        if (data.data.refreshToken) {
          tokenStorage.setRefreshToken(data.data.refreshToken)
        }
        return data.data.accessToken
      } else if (data.accessToken) {
        // Handle different response format
        console.log('Token refresh successful (alternative format)')
        tokenStorage.setAccessToken(data.accessToken)
        if (data.refreshToken) {
          tokenStorage.setRefreshToken(data.refreshToken)
        }
        return data.accessToken
      }

      throw new Error('Invalid refresh response format')
    } catch (error) {
      console.error('Token refresh error:', error)
      tokenStorage.clearTokens()
      
      // Only redirect to login if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page...')
        window.location.href = '/login'
      }
      return null
    }
  }

  // Public API methods
  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  public async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Authentication specific methods
  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<LoginResponse>('/auth/login', credentials)
    
    if (response.status === 'success' && response.token && response.data?.user) {
      tokenStorage.setAccessToken(response.token)
      tokenStorage.setUser(response.data.user)
      
      // If refresh token is provided in the response, store it
      if (response.refreshToken) {
        tokenStorage.setRefreshToken(response.refreshToken)
      }
    }
    
    return response
  }

  public async logout(): Promise<void> {
    try {
      await this.get('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      tokenStorage.clearTokens()
    }
  }

  public async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.get<{ user: User }>('/auth/me')
  }

  public async refreshToken(): Promise<string | null> {
    return this.handleTokenRefresh()
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Convenience export for auth methods
export const authApi = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
  refreshToken: () => apiClient.refreshToken(),
}

// Store management API methods
export const storeApi = {
  // Get all stores with filtering and pagination
  getStores: (params?: {
    page?: number
    limit?: number
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    search?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.search) queryParams.append('search', params.search)
    
    const query = queryParams.toString()
    return apiClient.get<StoreApiResponse>(`/stores${query ? `?${query}` : ''}`)
  },

  // Get a specific store by ID
  getStore: (id: string) => 
    apiClient.get<{ data: Store }>(`/stores/${id}`),

  // Create a new store
  createStore: (data: CreateStoreRequest) =>
    apiClient.post<{ data: Store }>('/stores', data),

  // Update a store
  updateStore: (id: string, data: UpdateStoreRequest) =>
    apiClient.put<{ data: Store }>(`/stores/${id}`, data),

  // Delete/close a store
  deleteStore: (id: string) =>
    apiClient.delete(`/stores/${id}`),

  // Update store status
  updateStoreStatus: (id: string, data: StoreStatusRequest) =>
    apiClient.patch<{ data: Store }>(`/stores/${id}/status`, data),

  // Update store commission
  updateStoreCommission: (id: string, data: StoreCommissionRequest) =>
    apiClient.patch<{ data: Store }>(`/stores/${id}/commission`, data),

  // Get store statistics
  getStoreStats: (id: string) =>
    apiClient.get<{ data: StoreStats }>(`/stores/${id}/stats`),

  // Search stores
  searchStores: (query: string) =>
    apiClient.get<{ count: number; data: Store[] }>(`/stores/search?query=${encodeURIComponent(query)}`),

  // Get current user's store (for merchants)
  getCurrentUserStore: () =>
    apiClient.get<{ success: boolean; data: Store }>('/stores/my-store'),

  // Verify store access for merchant
  verifyStoreAccess: (storeId: string) =>
    apiClient.get<{ success: boolean; data: { hasAccess: boolean; store?: Store } }>(`/stores/${storeId}/verify-access`),
}

// Product management API methods
export const productApi = {
  // Get all products with filtering and pagination
  getProducts: (params?: ProductFilters) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.store) queryParams.append('store', params.store)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString())
    if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString())
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return apiClient.get<{ data: Product[]; pagination?: any; count?: number }>(`/products${query ? `?${query}` : ''}`)
  },

  // Get a specific product by ID or slug
  getProduct: (idOrSlug: string) => 
    apiClient.get<{ data: Product }>(`/products/${idOrSlug}`),

  // Create a new product
  createProduct: (data: CreateProductRequest) =>
    apiClient.post<{ data: Product }>('/products', data),

  // Update a product
  updateProduct: (id: string, data: UpdateProductRequest) =>
    apiClient.patch<{ data: Product }>(`/products/${id}`, data),

  // Update product status
  updateProductStatus: (id: string, status: Product['status']) =>
    apiClient.patch<{ data: Product }>(`/products/${id}/status`, { status }),

  // Update product inventory
  updateProductInventory: (id: string, variantId: string, quantity: number) =>
    apiClient.patch<{ data: Product }>(`/products/${id}/inventory`, { variantId, quantity }),

  // Add product variant
  addProductVariant: (id: string, variant: Omit<ProductVariant, '_id'>) =>
    apiClient.post<{ data: Product }>(`/products/${id}/variants`, variant),

  // Update product variant
  updateProductVariant: (id: string, variantId: string, variant: Partial<ProductVariant>) =>
    apiClient.patch<{ data: Product }>(`/products/${id}/variants/${variantId}`, variant),

  // Delete product variant
  deleteProductVariant: (id: string, variantId: string) =>
    apiClient.delete<{ data: Product }>(`/products/${id}/variants/${variantId}`),

  // Toggle product featured status (admin only)
  toggleProductFeatured: (id: string) =>
    apiClient.patch<{ data: Product }>(`/products/${id}/featured`),

  // Search products
  searchProducts: (query: string, params?: { page?: number; limit?: number; category?: string; store?: string }) => {
    const queryParams = new URLSearchParams({ query })
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.category) queryParams.append('category', params.category)
    if (params?.store) queryParams.append('store', params.store)
    
    return apiClient.get<{ data: Product[]; pagination?: any; count?: number }>(`/products/search?${queryParams.toString()}`)
  },

  // Bulk update products
  bulkUpdateProducts: (productIds: string[], updateData: Record<string, any>) =>
    apiClient.post<{ updatedCount: number }>('/products/bulk-update', { productIds, updateData }),

  // Delete product
  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`),

  // Get related products
  getRelatedProducts: (id: string, limit?: number) => {
    const queryParams = new URLSearchParams()
    if (limit) queryParams.append('limit', limit.toString())
    
    const query = queryParams.toString()
    return apiClient.get<{ data: Product[] }>(`/products/${id}/related${query ? `?${query}` : ''}`)
  },
}

// Category management API methods  
export const categoryApi = {
  // Get all categories
  getCategories: (params?: {
    page?: number
    limit?: number
    parent?: string
    level?: number
    isActive?: boolean
    featured?: boolean
    withProducts?: boolean
    withChildren?: boolean
    asTree?: boolean
    sort?: string
    order?: 'asc' | 'desc'
    store?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.parent) queryParams.append('parent', params.parent)
    if (params?.level !== undefined) queryParams.append('level', params.level.toString())
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString())
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString())
    if (params?.withProducts !== undefined) queryParams.append('withProducts', params.withProducts.toString())
    if (params?.withChildren !== undefined) queryParams.append('withChildren', params.withChildren.toString())
    if (params?.asTree !== undefined) queryParams.append('asTree', params.asTree.toString())
    if (params?.sort) queryParams.append('sort', params.sort)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.store) queryParams.append('store', params.store)
    
    const query = queryParams.toString()
    return apiClient.get<{
      success: boolean
      count: number
      pagination?: {
        total: number
        page: number
        pages: number
        limit: number
      }
      data: Category[]
    }>(`/categories${query ? `?${query}` : ''}`)
  },

  // Get a specific category by ID or slug
  getCategory: (idOrSlug: string, params?: {
    withChildren?: boolean
    withProducts?: boolean
    withBreadcrumbs?: boolean
    store?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.withChildren !== undefined) queryParams.append('withChildren', params.withChildren.toString())
    if (params?.withProducts !== undefined) queryParams.append('withProducts', params.withProducts.toString())
    if (params?.withBreadcrumbs !== undefined) queryParams.append('withBreadcrumbs', params.withBreadcrumbs.toString())
    if (params?.store) queryParams.append('store', params.store)
    
    const query = queryParams.toString()
    return apiClient.get<{ success: boolean; data: Category }>(`/categories/${idOrSlug}${query ? `?${query}` : ''}`)
  },

  // Create a new category
  createCategory: (data: {
    name: string
    description?: string
    parent?: string
    image?: string
    icon?: string
    isActive?: boolean
    order?: number
    store?: string
    meta?: {
      title?: string
      description?: string
      keywords?: string
    }
  }) =>
    apiClient.post<{ success: boolean; data: Category }>('/categories', data),

  // Update a category
  updateCategory: (id: string, data: {
    name?: string
    description?: string
    parent?: string
    image?: string
    icon?: string
    isActive?: boolean
    order?: number
    store?: string
    meta?: {
      title?: string
      description?: string
      keywords?: string
    }
  }) =>
    apiClient.put<{ success: boolean; data: Category }>(`/categories/${id}`, data),

  // Delete a category
  deleteCategory: (id: string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/categories/${id}`),

  // Update category order
  reorderCategories: (items: Array<{ id: string; order: number }>) =>
    apiClient.put<{ success: boolean; message: string }>('/categories/reorder', { items }),

  // Update featured categories
  updateFeaturedCategories: (items: Array<{ id: string; featuredOrder: number }>) =>
    apiClient.put<{ success: boolean; message: string; data: Category[] }>('/categories/featured', { items }),

  // Get featured categories
  getFeaturedCategories: (limit?: number) => {
    const queryParams = new URLSearchParams()
    if (limit) queryParams.append('limit', limit.toString())
    
    const query = queryParams.toString()
    return apiClient.get<{ success: boolean; count: number; data: Category[] }>(`/categories/featured${query ? `?${query}` : ''}`)
  },

  // Search categories
  searchCategories: (query: string) =>
    apiClient.get<{ success: boolean; count: number; data: Category[] }>(`/categories/search?query=${encodeURIComponent(query)}`),
}

// User management API methods
export const userApi = {
  // Get all users with filtering and pagination
  getUsers: (params?: {
    page?: number
    limit?: number
    status?: string
    role?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    search?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.search) queryParams.append('search', params.search)
    
    const query = queryParams.toString()
    return apiClient.get<UserApiResponse>(`/users${query ? `?${query}` : ''}`)
  },

  // Get a specific user by ID
  getUser: (id: string) => 
    apiClient.get<{ data: User }>(`/users/${id}`),

  // Create a new user
  createUser: (data: CreateUserRequest) =>
    apiClient.post<{ data: User }>('/users', data),

  // Update a user
  updateUser: (id: string, data: UpdateUserRequest) =>
    apiClient.put<{ data: User }>(`/users/${id}`, data),

  // Delete/deactivate a user
  deleteUser: (id: string) =>
    apiClient.delete(`/users/${id}`),

  // Update user status
  updateUserStatus: (id: string, data: UserStatusRequest) =>
    apiClient.patch<{ data: User }>(`/users/${id}/status`, data),

  // Assign role to user
  assignRole: (id: string, data: UserRoleRequest) =>
    apiClient.patch<{ data: User }>(`/users/${id}/role`, data),

  // Update user permissions
  updatePermissions: (id: string, data: UserPermissionsRequest) =>
    apiClient.patch<{ data: User }>(`/users/${id}/permissions`, data),

  // Toggle account lock
  toggleAccountLock: (id: string, data: AccountLockRequest) =>
    apiClient.patch<{ data: User }>(`/users/${id}/lock`, data),

  // Get user activity
  getUserActivity: (id: string) =>
    apiClient.get<{ data: any }>(`/users/${id}/activity`),

  // Add admin note
  addAdminNote: (id: string, data: AdminNoteRequest) =>
    apiClient.post<{ data: User }>(`/users/${id}/notes`, data),

  // Get user statistics
  getUserStatistics: () =>
    apiClient.get<{ data: any }>('/users/statistics'),

  // Search users
  searchUsers: (query: string, filters?: any) => {
    const queryParams = new URLSearchParams({ query })
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          queryParams.append(key, filters[key].toString())
        }
      })
    }
    
    return apiClient.get<{ count: number; data: User[] }>(`/users/search?${queryParams.toString()}`)
  },

  // Bulk operations
  bulkUserOperations: (data: BulkUserOperationRequest) =>
    apiClient.post<{ data: any }>('/users/bulk', data),
}
