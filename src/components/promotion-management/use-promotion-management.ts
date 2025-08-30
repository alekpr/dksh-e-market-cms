/**
 * Promotion Management Hook
 * Provides comprehensive state management for promotion operations
 */
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { promotionApi, type Promotion, type PromotionFilters, type CreatePromotionRequest, type UpdatePromotionRequest, type PromotionStats } from '@/lib/api'

interface UsePromotionManagementOptions {
  initialFilters?: PromotionFilters
  autoFetch?: boolean
}

interface PromotionState {
  promotions: Promotion[]
  currentPromotion: Promotion | null
  stats: PromotionStats | null
  loading: boolean
  saving: boolean
  deleting: boolean
  error: string | null
  filters: PromotionFilters
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

const initialState: PromotionState = {
  promotions: [],
  currentPromotion: null,
  stats: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0
  }
}

export function usePromotionManagement(options: UsePromotionManagementOptions = {}) {
  const { initialFilters, autoFetch = true } = options
  const [state, setState] = useState<PromotionState>({
    ...initialState,
    filters: { ...initialState.filters, ...initialFilters }
  })

  // Fetch promotions
  const fetchPromotions = useCallback(async (filters?: PromotionFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const currentFilters = filters || state.filters
      const response = await promotionApi.getPromotions(currentFilters)
      
      // ตรวจสอบและแยก data structure 
      const responseData = response.data as any
      const promotions = responseData?.data?.promotions || responseData?.promotions || []
      const pagination = responseData?.pagination || { total: 0, page: 1, limit: 20, pages: 0 }
      
      setState(prev => ({
        ...prev,
        promotions,
        pagination,
        filters: currentFilters,
        loading: false,
        error: null
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch promotions'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        promotions: []
      }))
      toast.error(errorMessage)
    }
  }, [state.filters])

  // Fetch promotion statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await promotionApi.getPromotionStats()
      
      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          stats: response.data!.data
        }))
      }
    } catch (error) {
      console.error('Failed to fetch promotion stats:', error)
      // Don't show error toast for stats as it's not critical
    }
  }, [])

  // Get single promotion
  const fetchPromotion = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await promotionApi.getPromotion(id)
      
      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          currentPromotion: response.data!.data.promotion,
          loading: false
        }))
        return response.data!.data.promotion
      } else {
        throw new Error('Failed to fetch promotion')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch promotion'
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage,
        currentPromotion: null
      }))
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Create promotion
  const createPromotion = useCallback(async (data: CreatePromotionRequest) => {
    try {
      setState(prev => ({ ...prev, saving: true, error: null }))
      
      const response = await promotionApi.createPromotion(data)
      
      if (response.data?.success) {
        setState(prev => ({ ...prev, saving: false }))
        toast.success('Promotion created successfully')
        
        // Refresh promotions list
        await fetchPromotions()
        
        return response.data!.data.promotion
      } else {
        throw new Error('Failed to create promotion')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create promotion'
      setState(prev => ({ 
        ...prev, 
        saving: false, 
        error: errorMessage
      }))
      toast.error(errorMessage)
      return null
    }
  }, [fetchPromotions])

  // Update promotion
  const updatePromotion = useCallback(async (id: string, data: UpdatePromotionRequest) => {
    try {
      setState(prev => ({ ...prev, saving: true, error: null }))
      
      // Debug: Log the data before sending to API
      console.log('DEBUG: Data received in updatePromotion hook:', data)
      console.log('DEBUG: endDate in updatePromotion data:', data.endDate)
      console.log('DEBUG: updatePromotion data keys:', Object.keys(data))
      
      const response = await promotionApi.updatePromotion(id, data)
      
      // Check if response contains promotion data (which means success)
      const responseData = response.data as any
      const isSuccess = responseData?.promotion != null
      
      if (isSuccess) {
        setState(prev => ({
          ...prev,
          saving: false,
          currentPromotion: responseData.promotion,
          promotions: prev.promotions.map(promotion =>
            promotion._id === id ? responseData.promotion : promotion
          )
        }))
        toast.success('Promotion updated successfully')
        
        return responseData.promotion
      } else {
        throw new Error('Failed to update promotion')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update promotion'
      setState(prev => ({ 
        ...prev, 
        saving: false, 
        error: errorMessage
      }))
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Delete promotion
  const deletePromotion = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, deleting: true, error: null }))
      
      const response = await promotionApi.deletePromotion(id)
      
      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          deleting: false,
          promotions: prev.promotions.filter(promotion => promotion._id !== id)
        }))
        toast.success('Promotion deleted successfully')
        
        return true
      } else {
        throw new Error('Failed to delete promotion')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete promotion'
      setState(prev => ({ 
        ...prev, 
        deleting: false, 
        error: errorMessage
      }))
      toast.error(errorMessage)
      return false
    }
  }, [])

  // Toggle promotion status
  const togglePromotionStatus = useCallback(async (id: string) => {
    try {
      const response = await promotionApi.togglePromotionStatus(id)
      
      if (response.data?.success) {
        setState(prev => ({
          ...prev,
          promotions: prev.promotions.map(promotion =>
            promotion._id === id ? response.data!.data.promotion : promotion
          )
        }))
        toast.success(response.data!.data.message || 'Promotion status updated')
        
        return response.data!.data.promotion
      } else {
        throw new Error('Failed to toggle promotion status')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle promotion status'
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Track promotion event
  const trackPromotionEvent = useCallback(async (id: string, eventType: 'view' | 'click') => {
    try {
      await promotionApi.trackPromotionEvent(id, eventType)
      
      // Update local state with new analytics
      setState(prev => ({
        ...prev,
        promotions: prev.promotions.map(promotion => {
          if (promotion._id === id) {
            return {
              ...promotion,
              analytics: {
                ...promotion.analytics,
                [eventType === 'view' ? 'views' : 'clicks']: promotion.analytics[eventType === 'view' ? 'views' : 'clicks'] + 1
              }
            }
          }
          return promotion
        })
      }))
    } catch (error) {
      console.error('Failed to track promotion event:', error)
      // Don't show error toast for tracking as it's not critical
    }
  }, [])

  // Filter handlers
  const setFilters = useCallback((newFilters: Partial<PromotionFilters>) => {
    const updatedFilters = { ...state.filters, ...newFilters, page: 1 }
    setState(prev => ({ ...prev, filters: updatedFilters }))
    fetchPromotions(updatedFilters)
  }, [state.filters, fetchPromotions])

  const setPage = useCallback((page: number) => {
    const updatedFilters = { ...state.filters, page }
    setState(prev => ({ ...prev, filters: updatedFilters }))
    fetchPromotions(updatedFilters)
  }, [state.filters, fetchPromotions])

  const setSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
    const updatedFilters = { ...state.filters, sortBy, sortOrder, page: 1 }
    setState(prev => ({ ...prev, filters: updatedFilters }))
    fetchPromotions(updatedFilters)
  }, [state.filters, fetchPromotions])

  const clearFilters = useCallback(() => {
    const defaultFilters = { 
      page: 1, 
      limit: 20, 
      sortBy: 'createdAt', 
      sortOrder: 'desc' as const 
    }
    setState(prev => ({ ...prev, filters: defaultFilters }))
    fetchPromotions(defaultFilters)
  }, [fetchPromotions])

  // Search handler
  const searchPromotions = useCallback((query: string) => {
    setFilters({ search: query || undefined })
  }, [setFilters])

  // Clear current promotion
  const clearCurrentPromotion = useCallback(() => {
    setState(prev => ({ ...prev, currentPromotion: null }))
  }, [])

  // Initialize data
  useEffect(() => {
    if (autoFetch) {
      fetchPromotions()
      fetchStats()
    }
  }, []) // Only run on mount

  return {
    // State
    promotions: state.promotions,
    currentPromotion: state.currentPromotion,
    stats: state.stats,
    loading: state.loading,
    saving: state.saving,
    deleting: state.deleting,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,

    // Actions
    fetchPromotions,
    fetchPromotion,
    createPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionStatus,
    trackPromotionEvent,
    fetchStats,

    // Filter actions
    setFilters,
    setPage,
    setSort,
    clearFilters,
    searchPromotions,
    clearCurrentPromotion,

    // Utilities
    refresh: () => {
      fetchPromotions()
      fetchStats()
    }
  }
}

export type UsePromotionManagementReturn = ReturnType<typeof usePromotionManagement>
