import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { orderApi, type Order, type OrderFilters } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export type OrderView = 'list' | 'view'

export interface OrderStats {
  total: number
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  refunded: number
}

export function useOrderManagement() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // State
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<OrderView>('list')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  
  // Statistics
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0
  })

  // User permissions
  const isAdmin = user?.role === 'admin'
  const isMerchant = user?.role === 'merchant'
  const canManageOrders = isAdmin || (isMerchant && user?.merchantInfo?.storeId)
  const storeName = user?.merchantInfo?.storeName || 'Your Store'

  // Initialize from URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries())
    
    if (params.view) setCurrentView(params.view as OrderView)
    if (params.search) setSearchTerm(params.search)
    if (params.status) setFilterStatus(params.status)
    if (params.paymentStatus) setFilterPaymentStatus(params.paymentStatus)
    if (params.sortBy) setSortBy(params.sortBy)
    if (params.sortOrder) setSortOrder(params.sortOrder as 'asc' | 'desc')
    if (params.page) setCurrentPage(parseInt(params.page))
  }, [searchParams])

  // Build filters
  const buildFilters = useCallback((): OrderFilters => {
    const filters: OrderFilters = {
      page: currentPage,
      limit: 20, // Reasonable limit for better UX with pagination
      sortBy,
      sortOrder
    }

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim()
    }

    if (filterStatus && filterStatus !== 'all') {
      filters.status = filterStatus as Order['status']
    }

    if (filterPaymentStatus && filterPaymentStatus !== 'all') {
      filters.paymentStatus = filterPaymentStatus as Order['paymentStatus']
    }

    // For merchants, only show their store's orders
    if (isMerchant && user?.merchantInfo?.storeId) {
      filters.store = user.merchantInfo.storeId
    }

    return filters
  }, [currentPage, sortBy, sortOrder, searchTerm, filterStatus, filterPaymentStatus, isMerchant, user?.merchantInfo?.storeId])

  // Update URL with current state
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    
    params.set('view', currentView)
    if (searchTerm) params.set('search', searchTerm)
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (filterPaymentStatus !== 'all') params.set('paymentStatus', filterPaymentStatus)
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy)
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder)
    if (currentPage > 1) params.set('page', currentPage.toString())

    navigate({ search: params.toString() }, { replace: true })
  }, [currentView, searchTerm, filterStatus, filterPaymentStatus, sortBy, sortOrder, currentPage, navigate])

  // Load all orders for statistics calculation
  const loadAllOrdersForStats = useCallback(async () => {
    try {
      // Get all orders without pagination for statistics
      const statsFilters: any = {
        limit: 1000, // Large limit to get all orders
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
        // Don't include search, status, or payment status filters for stats
      }

      // Add store filter for merchants
      if (isMerchant && user?.merchantInfo?.storeId) {
        statsFilters.store = user.merchantInfo.storeId
      }

      const statsResponse = isMerchant && user?.merchantInfo?.storeId 
        ? await orderApi.getStoreOrders(user.merchantInfo.storeId, statsFilters)
        : await orderApi.getOrders(statsFilters)

      if (statsResponse.success && statsResponse.data) {
        const allOrdersData = Array.isArray(statsResponse.data) ? statsResponse.data : (statsResponse.data as any).data || []
        
        // Calculate statistics from all orders
        const stats: OrderStats = {
          total: allOrdersData.length,
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0
        }

        allOrdersData.forEach((order: Order) => {
          switch (order.status) {
            case 'pending':
              stats.pending++
              break
            case 'confirmed':
              stats.confirmed++
              break
            case 'processing':
              stats.processing++
              break
            case 'shipped':
              stats.shipped++
              break
            case 'delivered':
              stats.delivered++
              break
            case 'cancelled':
              stats.cancelled++
              break
            case 'refunded':
              stats.refunded++
              break
          }
        })

        setOrderStats(stats)
        setTotalOrders(allOrdersData.length)
        setTotalPages(Math.ceil(allOrdersData.length / 20))
      }
    } catch (err: any) {
      console.error('Error loading stats:', err)
      // Don't show error for stats loading failure
    }
  }, [isMerchant, user?.merchantInfo?.storeId])

  // Load orders
  const loadOrders = useCallback(async () => {
    if (!canManageOrders) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const filters = buildFilters()
      const response = isMerchant && user?.merchantInfo?.storeId 
        ? await orderApi.getStoreOrders(user.merchantInfo.storeId, filters)
        : await orderApi.getOrders(filters)

      console.log('Order API Response:', response)
      console.log('Response.data structure:', response.data)
      
      if (response.success && response.data) {
        // For getStoreOrders, response.data is the direct array from API
        // The API client has already extracted the data property for us
        const ordersData = Array.isArray(response.data) ? response.data : (response.data as any).data || []
        
        // For count, we need to get it from the actual API response
        // Since API client processes the response, count might be lost
        // We'll use the array length as fallback
        const ordersCount = ordersData.length
        
        console.log('Extracted orders data:', ordersData)
        console.log('Extracted orders count:', ordersCount)
        
        setOrders(ordersData)
        
        if (ordersCount !== undefined) {
          setTotalOrders(ordersCount)
          setTotalPages(Math.ceil(ordersCount / 20))
        }

        // Calculate statistics from ALL orders (not filtered)
        // We need to fetch all orders for accurate statistics
        await loadAllOrdersForStats()
      }
    } catch (err: any) {
      console.error('Error loading orders:', err)
      setError(err.message || 'Failed to load orders')
      toast({
        title: 'Error',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [canManageOrders, buildFilters, isMerchant, user?.merchantInfo?.storeId, toast])

  // Load orders when filters change
  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Update URL when state changes
  useEffect(() => {
    updateURL()
  }, [updateURL])

  // Handle view change
  const handleView = useCallback((order: Order) => {
    setSelectedOrder(order)
    setCurrentView('view')
  }, [])

  // Handle back to list
  const handleBack = useCallback(() => {
    setCurrentView('list')
    setSelectedOrder(null)
  }, [])

  // Handle order status update
  const handleUpdateStatus = useCallback(async (
    orderId: string, 
    status: Order['status'], 
    notes?: string
  ) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, { status, notes })
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Order status updated successfully'
        })
        
        // Update the order in the list
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status } : order
        ))
        
        // Update selected order if it's the same
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null)
        }
        
        // Reload to get fresh data
        loadOrders()
      }
    } catch (err: any) {
      console.error('Error updating order status:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to update order status',
        variant: 'destructive'
      })
    }
  }, [toast, selectedOrder, loadOrders])

  // Handle order assignment
  const handleAssignOrder = useCallback(async (
    orderId: string, 
    assignedTo: string, 
    notes?: string
  ) => {
    try {
      const response = await orderApi.assignOrder(orderId, { assignedTo, notes })
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Order assigned successfully'
        })
        
        // Reload to get fresh data
        loadOrders()
      }
    } catch (err: any) {
      console.error('Error assigning order:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign order',
        variant: 'destructive'
      })
    }
  }, [toast, loadOrders])

  // Handle order cancellation
  const handleCancelOrder = useCallback(async (orderId: string, reason?: string) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, { 
        status: 'cancelled', 
        notes: reason 
      })
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Order cancelled successfully'
        })
        
        // Update the order in the list
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status: 'cancelled' as const } : order
        ))
        
        // Update selected order if it's the same
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: 'cancelled' as const } : null)
        }
        
        // Reload to get fresh data
        loadOrders()
      }
    } catch (err: any) {
      console.error('Error cancelling order:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to cancel order',
        variant: 'destructive'
      })
    }
  }, [toast, selectedOrder, loadOrders])

  // Handle search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadOrders()
  }, [loadOrders])

  return {
    // Data
    orders,
    loading,
    error,
    currentView,
    selectedOrder,
    
    // Filters
    searchTerm,
    filterStatus,
    filterPaymentStatus,
    sortBy,
    sortOrder,
    
    // Pagination
    currentPage,
    totalPages,
    totalOrders,
    
    // Statistics
    orderStats,
    
    // User info
    canManageOrders,
    isAdmin,
    isMerchant,
    storeName,
    
    // Actions
    handleView,
    handleBack,
    handleUpdateStatus,
    handleAssignOrder,
    handleCancelOrder,
    handleSearch,
    handleRefresh,
    
    // Setters
    setSearchTerm,
    setFilterStatus,
    setFilterPaymentStatus,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    
    // Utils
    loadOrders
  }
}
