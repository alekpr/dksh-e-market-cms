/**
 * Banner Management Hook
 * Provides comprehensive state management for banner operations
 */
/// <reference types="vite/client" />

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
// TypeScript interfaces for banner data
export interface Banner {
  _id: string
  title: string
  description?: string
  imageUrl: string
  actionType: 'product_detail' | 'store' | 'category' | 'external_link'
  actionValue: string
  isActive: boolean
  priority: number
  startDate?: string
  endDate?: string
  createdBy?: {
    id: string
    name: string
    email: string
  }
  createdAt?: string
  updatedAt?: string
  targetProduct?: any
  targetStore?: any
  targetCategory?: any
}

export interface CreateBannerRequest {
  title: string
  description?: string
  imageUrl: string
  actionType: 'product_detail' | 'store' | 'category' | 'external_link'
  actionValue: string
  isActive: boolean
  priority: number
  startDate?: string
  endDate?: string
}

export interface UpdateBannerRequest {
  title?: string
  description?: string
  imageUrl?: string
  actionType?: 'product_detail' | 'store' | 'category' | 'external_link'
  actionValue?: string
  isActive?: boolean
  priority?: number
  startDate?: string
  endDate?: string
}

export interface BannerStats {
  total: number
  active: number
  inactive: number
  upcoming: number
  expired: number
}

export interface BannerFilters {
  search: string
  status: 'all' | 'active' | 'inactive'
  actionType: 'all' | 'product_detail' | 'store' | 'category' | 'external_link'
  page: number
  limit: number
}

export interface BannerPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// API functions
const bannerAPI = {
  getBanners: async () => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch banners')
    }

    return response.json()
  },

  getBanner: async (id: string) => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch banner')
    }

    return response.json()
  },

  createBanner: async (data: CreateBannerRequest) => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create banner')
    }

    return response.json()
  },

  updateBanner: async (id: string, data: UpdateBannerRequest) => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to update banner')
    }

    return response.json()
  },

  deleteBanner: async (id: string) => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to delete banner')
    }

    return response.json()
  },

  toggleBannerStatus: async (id: string, isActive: boolean) => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to toggle banner status')
    }

    return response.json()
  },

  reorderBanners: async (bannerIds: string[]) => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners/reorder`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bannerIds }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to reorder banners')
    }

    return response.json()
  },

  getStats: async (): Promise<BannerStats> => {
    const token = localStorage.getItem('access_token')
    
    const response = await fetch(`${API_BASE_URL}/banners/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch banner stats')
    }

    return response.json()
  },

  uploadImage: async (file: File) => {
    const token = localStorage.getItem('access_token')
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch(`${API_BASE_URL}/banners/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to upload image')
    }

    return response.json()
  },
}

// Main hook for banner management
const useBannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<BannerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    upcoming: 0,
    expired: 0,
  })
  const [filters, setFilters] = useState<BannerFilters>({
    search: '',
    status: 'all',
    actionType: 'all',
    page: 1,
    limit: 10,
  })
  const [pagination, setPagination] = useState<BannerPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })

  // Load banners
  const loadBanners = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bannerAPI.getBanners()
      setBanners(response.data || [])
      
      // Update pagination
      setPagination({
        page: filters.page,
        limit: filters.limit,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / filters.limit),
        hasNext: filters.page < Math.ceil((response.total || 0) / filters.limit),
        hasPrev: filters.page > 1,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load banners'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<BannerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Fetch banners (alias for loadBanners for compatibility)
  const fetchBanners = useCallback(() => {
    loadBanners()
  }, [loadBanners])

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const statsData = await bannerAPI.getStats()
      setStats(statsData)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  // Create banner
  const createBanner = useCallback(async (data: CreateBannerRequest) => {
    try {
      setLoading(true)
      const response = await bannerAPI.createBanner(data)
      toast.success('Banner created successfully')
      await loadBanners()
      await loadStats()
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create banner'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBanners, loadStats])

  // Update banner
  const updateBanner = useCallback(async (id: string, data: UpdateBannerRequest) => {
    try {
      setLoading(true)
      const response = await bannerAPI.updateBanner(id, data)
      toast.success('Banner updated successfully')
      await loadBanners()
      await loadStats()
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update banner'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBanners, loadStats])

  // Delete banner
  const deleteBanner = useCallback(async (id: string) => {
    try {
      setLoading(true)
      await bannerAPI.deleteBanner(id)
      toast.success('Banner deleted successfully')
      await loadBanners()
      await loadStats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete banner'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBanners, loadStats])

  // Toggle banner status
  const toggleBannerStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      setLoading(true)
      await bannerAPI.toggleBannerStatus(id, isActive)
      toast.success(`Banner ${isActive ? 'activated' : 'deactivated'} successfully`)
      await loadBanners()
      await loadStats()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle banner status'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadBanners, loadStats])

  // Select banner
  const selectBanner = useCallback(async (id: string) => {
    try {
      setLoading(true)
      const response = await bannerAPI.getBanner(id)
      setSelectedBanner(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load banner details'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Upload image
  const uploadImage = useCallback(async (file: File) => {
    try {
      setLoading(true)
      const response = await bannerAPI.uploadImage(file)
      toast.success('Image uploaded successfully')
      return response.data.imageUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadBanners()
    loadStats()
  }, [loadBanners, loadStats])

  return {
    // State
    banners,
    selectedBanner,
    loading,
    error,
    stats,
    filters,
    pagination,
    
    // Actions
    loadBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    selectBanner,
    uploadImage,
    setSelectedBanner,
    updateFilters,
    fetchBanners,
    
    // Utils
    clearError: () => setError(null),
  }
}

// Export both named and default for flexibility
export { useBannerManagement }
export default useBannerManagement