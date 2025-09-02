/**
 * API Client Configuration and Utilities
 */

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
export const API_BASE_URL = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`

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
  status: 'pending' | 'active' | 'suspended' | 'inactive' | 'closed';
  commission?: {
    rate: number;
    feeStructure: string;
  };
  businessInfo?: {
    businessType: string;
    taxId?: string;
    registrationNumber?: string;
  };
  payoutInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
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
  attributes?: Record<string, string>; // Make attributes optional
  sku?: string;
  barcode?: string;
  inventory: {
    quantity: number;
    trackInventory: boolean;
    lowStockThreshold?: number;
  }; // Standardize to object format only
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
  }; // Standardize to object format only
  categories: Category[] | string[];
  category?: Category | string; // Support single category
  store: Store | string;
  status: 'draft' | 'active' | 'archived' | 'deleted';
  featured: boolean;
  images: string[]; // Standardize to string array only
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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
  isMaster?: boolean; // New field for hierarchical categories
  order: number;
  store?: Store | string; // Store reference (null for master categories)
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

// Hierarchical Category API Types
export interface HierarchicalCategory {
  masterCategory: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    icon?: string;
    order: number;
  };
  storeCount: number;
  totalProductCount: number;
  stores: Array<{
    storeId: string;
    storeName: string;
    storeSlug: string;
    categories: Category[];
  }>;
}

// Order API Types
export interface OrderItem {
  _id: string;
  product: Product | string;
  quantity: number;
  price: number;
  total: number;
  variant?: ProductVariant;
}

export interface OrderAddress {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  additionalInfo?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | { _id: string; name: string; email: string; fullName: string; }; // API uses 'user' not 'customer'
  customer?: User | string; // Keep for backward compatibility
  store?: Store | string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number; // API uses 'totalAmount'
  total?: number; // Keep for backward compatibility
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  // Payment info comes from nested payment object
  payment?: {
    method: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    amount: number;
    currency: string;
    refundedAmount: number;
  };
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'; // Derived from payment.status
  paymentMethod?: string; // Derived from payment.method
  paymentId?: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  shipping?: {
    method: string;
    status: string;
    estimatedDelivery?: string;
    cost: number;
  };
  notes?: string;
  trackingNumber?: string;
  merchantNotes?: string;
  cancelReason?: string;
  refundReason?: string;
  assignedTo?: User | string | null;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields from API
  discount?: number;
  metadata?: any;
  isGuestOrder?: boolean;
  deviceInfo?: any;
  statusHistory?: Array<{
    status: string;
    notes: string;
    updatedBy: string | null;
    _id: string;
  }>;
  transactionLogs?: any[];
  storeOrders?: Array<{
    store: string;
    items: string[];
    subtotal: number;
    status: string;
    _id: string;
  }>;
  __v?: number;
}

export interface CreateOrderRequest {
  customer?: string;
  store?: string;
  items: Array<{
    product: string;
    quantity: number;
    price?: number;
    variant?: string;
  }>;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  trackingNumber?: string;
  merchantNotes?: string;
  assignedTo?: string;
  estimatedDelivery?: string;
}

export interface OrderStatusUpdateRequest {
  status: Order['status'];
  notes?: string;
}

export interface OrderAssignmentRequest {
  assignedTo: string;
  notes?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  store?: string;
  customer?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Promotion Types
export interface PromotionRule {
  type: 'minimum_purchase' | 'product_category' | 'user_role' | 'store_specific' | 'quantity_based';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
}

export interface PromotionDiscount {
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value?: number;
  maxDiscount?: number;
  buyQuantity?: number;
  getQuantity?: number;
  getDiscountType?: 'percentage' | 'fixed_amount' | 'free';
  getDiscountValue?: number;
}

export interface PromotionApplicableItem {
  itemType: 'product' | 'category' | 'store' | 'all';
  itemId?: string;
  includeVariants?: boolean;
}

export interface PromotionBanner {
  image?: string;
  link?: string;
  position: 'header' | 'home_slider' | 'category_top' | 'product_detail' | 'footer';
  displayOrder: number;
}

export interface PromotionFeaturedProducts {
  productIds: string[];
  maxProducts: number;
  autoSelect: boolean;
  selectionCriteria: 'best_selling' | 'highest_rated' | 'newest' | 'random' | 'manual';
}

export interface PromotionFlashSale {
  originalPrice?: number;
  salePrice?: number;
  availableQuantity?: number;
  soldQuantity: number;
  notifyBeforeStart: number;
  showCountdown: boolean;
}

export interface PromotionTargeting {
  userRoles?: string[];
  stores?: string[];
  categories?: string[];
  locations?: string[];
  newUsersOnly: boolean;
  minimumOrderValue?: number;
}

export interface PromotionAnalytics {
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface PromotionUsageLimit {
  total?: number;
  perUser?: number;
  perDay?: number;
}

export interface PromotionCurrentUsage {
  total: number;
  today: number;
  lastResetDate: string;
}

export interface Promotion {
  _id: string;
  title: string;
  description?: string;
  type: 'featured_products' | 'flash_sale' | 'promotional_banner' | 'discount_coupon' | 'buy_x_get_y' | 'free_shipping';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'cancelled';
  priority: number;
  startDate: string;
  endDate: string;
  discount?: PromotionDiscount;
  applicableItems?: PromotionApplicableItem[];
  rules?: PromotionRule[];
  usageLimit?: PromotionUsageLimit;
  currentUsage: PromotionCurrentUsage;
  banner?: PromotionBanner;
  featuredProducts?: PromotionFeaturedProducts;
  flashSale?: PromotionFlashSale;
  targeting?: PromotionTargeting;
  analytics: PromotionAnalytics;
  createdBy: string | User;
  updatedBy?: string | User;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  isCurrentlyActive?: boolean;
  timeRemaining?: number;
  usagePercentage?: number;
}

export interface CreatePromotionRequest {
  title: string;
  description?: string;
  type: Promotion['type'];
  status?: Promotion['status'];
  priority?: number;
  startDate: string;
  endDate: string;
  discount?: PromotionDiscount;
  applicableItems?: PromotionApplicableItem[];
  rules?: PromotionRule[];
  usageLimit?: PromotionUsageLimit;
  banner?: PromotionBanner;
  featuredProducts?: PromotionFeaturedProducts;
  flashSale?: PromotionFlashSale;
  targeting?: PromotionTargeting;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePromotionRequest {
  title?: string;
  description?: string;
  status?: Promotion['status'];
  priority?: number;
  startDate?: string;
  endDate?: string;
  discount?: PromotionDiscount;
  applicableItems?: PromotionApplicableItem[];
  rules?: PromotionRule[];
  usageLimit?: PromotionUsageLimit;
  banner?: PromotionBanner;
  featuredProducts?: PromotionFeaturedProducts;
  flashSale?: PromotionFlashSale;
  targeting?: PromotionTargeting;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface PromotionFilters {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  active?: boolean;
  storeId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PromotionStats {
  statusStats: Array<{
    _id: string;
    count: number;
    totalViews: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
  }>;
  typeStats: Array<{
    _id: string;
    count: number;
    avgViews: number;
    avgClicks: number;
    avgConversions: number;
  }>;
  currentlyActive: number;
  expiringSoon: number;
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
  status?: 'pending' | 'active' | 'suspended' | 'inactive' | 'closed'
}

export interface StoreStatusRequest {
  status: 'pending' | 'active' | 'suspended' | 'inactive' | 'closed'
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
      console.log(`Request to ${endpoint} with token: ${token.substring(0, 15)}...`);
    } else {
      console.warn(`Request to ${endpoint} without auth token!`);
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
    const url = response.url.replace(this.baseURL, '');
    
    console.log(`API Response from ${url}: status=${response.status}, contentType=${contentType}`);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      
      if (!response.ok) {
        // Extract detailed error message if available
        const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`
        console.error('API Error Response:', data)
        const error = new Error(errorMessage)
        // Add response status and data to error for better handling
        ;(error as any).status = response.status
        ;(error as any).data = data
        throw error
      }
      
      console.log(`API Success Response from ${url}:`, data);
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
  getStore: async (id: string) => {
    try {
      return await apiClient.get<Store>(`/stores/${id}`)
    } catch (error: any) {
      console.error(`Error in getStore(${id}):`, error);
      console.error('Error details:', {
        status: error?.status,
        message: error?.message,
        data: error?.data
      });
      throw error;
    }
  },

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
    apiClient.put<{ data: Store }>(`/stores/${id}/status`, data),

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
  getCurrentUserStore: async () => {
    try {
      return await apiClient.get<Store>('/stores/my-store')
    } catch (error: any) {
      console.error('Error in getCurrentUserStore:', error);
      console.error('Error details:', {
        status: error?.status,
        message: error?.message,
        data: error?.data
      });
      throw error;
    }
  },

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
    // Support both old (sort/order) and new (sortBy/sortOrder) parameters
    if (params?.sort) queryParams.append('sortBy', params.sort)
    if (params?.order) queryParams.append('sortOrder', params.order)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
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
    apiClient.put<{ data: Product }>(`/products/${id}`, data),

  // Update product status
  updateProductStatus: (id: string, status: Product['status']) =>
    apiClient.put<{ data: Product }>(`/products/${id}/status`, { status }),

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
  // Get all categories (existing endpoint)
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

  // Get public categories (new endpoint for hierarchical support)
  getPublicCategories: (params?: {
    page?: number
    limit?: number
    parent?: string
    level?: number
    featured?: boolean
    withProducts?: boolean
    withChildren?: boolean
    asTree?: boolean
    hierarchical?: boolean
    masterOnly?: boolean
    sort?: string
    order?: 'asc' | 'desc'
    store?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.parent) queryParams.append('parent', params.parent)
    if (params?.level !== undefined) queryParams.append('level', params.level.toString())
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString())
    if (params?.withProducts !== undefined) queryParams.append('withProducts', params.withProducts.toString())
    if (params?.withChildren !== undefined) queryParams.append('withChildren', params.withChildren.toString())
    if (params?.asTree !== undefined) queryParams.append('asTree', params.asTree.toString())
    if (params?.hierarchical !== undefined) queryParams.append('hierarchical', params.hierarchical.toString())
    if (params?.masterOnly !== undefined) queryParams.append('masterOnly', params.masterOnly.toString())
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
      data: Category[] | HierarchicalCategory[]
    }>(`/categories/public${query ? `?${query}` : ''}`)
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

// Order management API methods
export const orderApi = {
  // Get all orders with filtering and pagination
  getOrders: (params?: OrderFilters) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
    if (params?.store) queryParams.append('store', params.store)
    if (params?.customer) queryParams.append('customer', params.customer)
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.minTotal) queryParams.append('minTotal', params.minTotal.toString())
    if (params?.maxTotal) queryParams.append('maxTotal', params.maxTotal.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const query = queryParams.toString()
    return apiClient.get<{ 
      success: boolean; 
      count: number; 
      pagination?: any; 
      data: Order[] 
    }>(`/orders${query ? `?${query}` : ''}`)
  },

  // Get a specific order by ID
  getOrder: (id: string) => 
    apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`),

  // Create a new order (guest orders)
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<{ success: boolean; data: Order }>('/orders', data),

  // Update an order (admin/merchant)
  updateOrder: (id: string, data: UpdateOrderRequest) =>
    apiClient.put<{ success: boolean; data: Order }>(`/orders/${id}`, data),

  // Update order status
  updateOrderStatus: (id: string, data: OrderStatusUpdateRequest) =>
    apiClient.put<{ success: boolean; data: Order }>(`/orders/${id}/status`, data),

  // Assign order to merchant/staff
  assignOrder: (id: string, data: OrderAssignmentRequest) =>
    apiClient.patch<{ success: boolean; data: Order }>(`/orders/${id}/assign`, data),

  // Cancel an order
  cancelOrder: (id: string, reason?: string) =>
    apiClient.patch<{ success: boolean; data: Order }>(`/orders/${id}/cancel`, { reason }),

  // Get store orders (for merchants)
  getStoreOrders: (storeId: string, params?: OrderFilters) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const query = queryParams.toString()
    return apiClient.get<{ 
      success: boolean; 
      count: number; 
      data: Order[] 
    }>(`/stores/${storeId}/orders${query ? `?${query}` : ''}`)
  },

  // Get customer orders
  getCustomerOrders: (customerId: string, params?: OrderFilters) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    
    const query = queryParams.toString()
    return apiClient.get<{ 
      success: boolean; 
      count: number; 
      data: Order[] 
    }>(`/customers/${customerId}/orders${query ? `?${query}` : ''}`)
  },

  // Get order statistics
  getOrderStatistics: (params?: {
    store?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.store) queryParams.append('store', params.store)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    if (params?.groupBy) queryParams.append('groupBy', params.groupBy)
    
    const query = queryParams.toString()
    return apiClient.get<{ 
      success: boolean; 
      data: {
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
        ordersByStatus: Record<string, number>;
        ordersByPaymentStatus: Record<string, number>;
        revenueByPeriod?: Array<{ period: string; revenue: number; orders: number }>;
      }
    }>(`/orders/statistics${query ? `?${query}` : ''}`)
  },

  // Search orders
  searchOrders: (query: string, params?: { 
    store?: string; 
    status?: string; 
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams({ search: query })
    if (params?.store) queryParams.append('store', params.store)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    return apiClient.get<{ 
      success: boolean; 
      count: number; 
      data: Order[] 
    }>(`/orders/search?${queryParams.toString()}`)
  },

  // Export orders (admin only)
  exportOrders: (params?: {
    format?: 'csv' | 'excel';
    store?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.format) queryParams.append('format', params.format)
    if (params?.store) queryParams.append('store', params.store)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.startDate) queryParams.append('startDate', params.startDate)
    if (params?.endDate) queryParams.append('endDate', params.endDate)
    
    const query = queryParams.toString()
    return apiClient.get<{ success: boolean; downloadUrl: string }>(`/orders/export${query ? `?${query}` : ''}`)
  },
}

// Promotion API
export const promotionApi = {
  // Get all promotions with filtering and pagination
  getPromotions: (params?: PromotionFilters) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.type) queryParams.append('type', params.type)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.active !== undefined) queryParams.append('active', params.active.toString())
    if (params?.storeId) queryParams.append('storeId', params.storeId)
    if (params?.search) queryParams.append('search', params.search)
    
    // Handle sorting properly
    if (params?.sortBy) {
      const sortField = params.sortOrder === 'desc' ? `-${params.sortBy}` : params.sortBy
      queryParams.append('sort', sortField)
    }
    
    const query = queryParams.toString()
    return apiClient.get<{
      success: boolean;
      results: number;
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
      data: { promotions: Promotion[] };
    }>(`/promotions${query ? `?${query}` : ''}`)
  },

  // Get active promotions (public endpoint)
  getActivePromotions: (params?: {
    type?: string;
    storeId?: string;
    categoryId?: string;
    position?: string;
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.storeId) queryParams.append('storeId', params.storeId)
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
    if (params?.position) queryParams.append('position', params.position)
    
    const query = queryParams.toString()
    return apiClient.get<{
      success: boolean;
      results: number;
      data: { promotions: Promotion[] };
    }>(`/promotions/active${query ? `?${query}` : ''}`)
  },

  // Get featured products
  getFeaturedProducts: (params?: {
    limit?: number;
    storeId?: string;
    categoryId?: string;
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.storeId) queryParams.append('storeId', params.storeId)
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId)
    
    const query = queryParams.toString()
    return apiClient.get<{
      success: boolean;
      results: number;
      data: { products: Product[] };
    }>(`/promotions/featured-products${query ? `?${query}` : ''}`)
  },

  // Get flash sales
  getFlashSales: (params?: {
    limit?: number;
    upcoming?: boolean;
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.upcoming) queryParams.append('upcoming', params.upcoming.toString())
    
    const query = queryParams.toString()
    return apiClient.get<{
      success: boolean;
      results: number;
      data: { flashSales: Promotion[] };
    }>(`/promotions/flash-sales${query ? `?${query}` : ''}`)
  },

  // Get promotional banners
  getPromotionalBanners: (params?: {
    position?: string;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.position) queryParams.append('position', params.position)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const query = queryParams.toString()
    return apiClient.get<{
      success: boolean;
      results: number;
      data: { banners: Promotion[] };
    }>(`/promotions/banners${query ? `?${query}` : ''}`)
  },

  // Get single promotion by ID
  getPromotion: (id: string) => {
    return apiClient.get<{
      success: boolean;
      data: { promotion: Promotion };
    }>(`/promotions/${id}`)
  },

  // Create new promotion
  createPromotion: (data: CreatePromotionRequest) => {
    return apiClient.post<{
      success: boolean;
      data: { promotion: Promotion };
    }>('/promotions', data)
  },

  // Update promotion
  updatePromotion: (id: string, data: UpdatePromotionRequest) => {
    return apiClient.patch<{
      success: boolean;
      data: { promotion: Promotion };
    }>(`/promotions/${id}`, data)
  },

  // Delete promotion
  deletePromotion: (id: string) => {
    return apiClient.delete<{
      success: boolean;
      data: null;
    }>(`/promotions/${id}`)
  },

  // Toggle promotion status (activate/deactivate)
  togglePromotionStatus: (id: string) => {
    return apiClient.patch<{
      success: boolean;
      data: { promotion: Promotion; message: string };
    }>(`/promotions/${id}/toggle-status`)
  },

  // Track promotion event (view/click)
  trackPromotionEvent: (id: string, eventType: 'view' | 'click') => {
    return apiClient.post<{
      success: boolean;
      data: { analytics: PromotionAnalytics };
    }>(`/promotions/${id}/track`, { eventType })
  },

  // Get promotion statistics (admin only)
  getPromotionStats: () => {
    return apiClient.get<{
      success: boolean;
      data: PromotionStats;
    }>('/promotions/stats')
  },

  // Calculate discount for items
  calculateDiscount: (data: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    userId?: string;
    storeId?: string;
    orderTotal: number;
  }) => {
    return apiClient.post<{
      success: boolean;
      data: {
        totalDiscount: number;
        appliedPromotions: Array<{
          promotionId: string;
          title: string;
          type: string;
          discountAmount: number;
        }>;
        originalTotal: number;
        finalTotal: number;
      };
    }>('/promotions/calculate-discount', data)
  },
}
