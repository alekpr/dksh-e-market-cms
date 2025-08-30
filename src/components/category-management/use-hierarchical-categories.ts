import { useState, useEffect, useMemo } from 'react'
import { categoryApi, type Category } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export type HierarchicalViewMode = 'master' | 'hierarchical' | 'store'

export interface HierarchicalCategory {
  masterCategory: Category
  storeCount: number
  totalProductCount: number
  stores: {
    storeId: string
    storeName: string
    categories: Category[]
  }[]
}

export interface MasterCategoryFormData {
  name: string
  description: string
  image: string
  icon: string
  order: number
  meta: {
    title: string
    description: string
    keywords: string
  }
}

export const useHierarchicalCategories = () => {
  const { user } = useAuth()
  const [masterCategories, setMasterCategories] = useState<Category[]>([])
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalCategory[]>([])
  const [storeCategories, setStoreCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<HierarchicalViewMode>('hierarchical')
  const [selectedMaster, setSelectedMaster] = useState<Category | null>(null)
  const [showMasterForm, setShowMasterForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Check if user is admin (only admins can manage master categories)
  const isAdmin = user?.role === 'admin'
  
  const [masterFormData, setMasterFormData] = useState<MasterCategoryFormData>({
    name: '',
    description: '',
    image: '',
    icon: '',
    order: 0,
    meta: {
      title: '',
      description: '',
      keywords: ''
    }
  })

  // Check if user can manage master categories (admin only)
  const canManageMaster = useMemo(() => {
    return user?.role === 'admin'
  }, [user])

  // Fetch master categories
  const fetchMasterCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryApi.getPublicCategories({
        masterOnly: true,
        withProducts: true,
        sort: 'name',
        order: 'asc'
      })

      if (response.success && response.data) {
        setMasterCategories(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error: any) {
      console.error('Failed to fetch master categories:', error)
      setError('Failed to load master categories')
      toast.error('Failed to load master categories')
    } finally {
      setLoading(false)
    }
  }

  // Fetch hierarchical data
  const fetchHierarchicalData = async () => {
    try {
      setLoading(true)
      const response = await categoryApi.getPublicCategories({
        hierarchical: true,
        withProducts: true
      })

      if (response.success && response.data) {
        const hierarchicalData = (response.data as unknown) as HierarchicalCategory[]
        setHierarchicalData(hierarchicalData)
      }
    } catch (error: any) {
      console.error('Failed to fetch hierarchical data:', error)
      setError('Failed to load hierarchical data')
      toast.error('Failed to load hierarchical data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch store-specific categories
  const fetchStoreCategories = async () => {
    try {
      setLoading(true)
      
      // For admins, fetch all store categories (not master)
      // For merchants, fetch only their store's categories
      const params: any = {
        withProducts: true,
        asTree: false // Get flat list for assignment
      }
      
      if (user?.role === 'merchant' && user?.merchantInfo?.storeId) {
        params.store = user.merchantInfo.storeId
      } else if (user?.role === 'admin') {
        // Admin gets all store categories (non-master categories)
        // Use public endpoint to get all store categories
        const response = await categoryApi.getPublicCategories({
          hierarchical: false,
          withProducts: true
        })
        
        if (response.success && response.data) {
          // Filter out master categories
          if (Array.isArray(response.data)) {
            const storeCats = response.data.filter(cat => !cat.isMaster)
            setStoreCategories(storeCats)
          }
        }
        return
      } else {
        return // No access
      }

      const response = await categoryApi.getCategories(params)

      if (response.success && response.data) {
        setStoreCategories(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error: any) {
      console.error('Failed to fetch store categories:', error)
      setError('Failed to load store categories')
      toast.error('Failed to load store categories')
    } finally {
      setLoading(false)
    }
  }

  // Load master categories and store categories on initial load (always needed for statistics and dropdowns)
  useEffect(() => {
    fetchMasterCategories()
    fetchStoreCategories() // Load store categories immediately for statistics
  }, [user])

  // Load additional data based on view mode
  useEffect(() => {
    switch (viewMode) {
      case 'master':
        // Master categories already loaded above
        break
      case 'hierarchical':
        fetchHierarchicalData()
        break
      case 'store':
        // Store categories already loaded above, but refresh if needed
        break
    }
  }, [viewMode, user])

  // Create master category
  const createMasterCategory = async () => {
    if (!canManageMaster) {
      toast.error('Access denied: Admin role required')
      return
    }

    if (!masterFormData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      setLoading(true)
      
      const categoryData = {
        ...masterFormData,
        name: masterFormData.name.trim(),
        description: masterFormData.description.trim() || undefined,
        image: masterFormData.image.trim() || undefined,
        icon: masterFormData.icon.trim() || undefined,
        isMaster: true,
        isActive: true
      }

      const response = await categoryApi.createCategory(categoryData)
      
      if (response.success) {
        toast.success('Master category created successfully')
        setShowMasterForm(false)
        resetMasterForm()
        fetchMasterCategories()
      } else {
        throw new Error(response.message || 'Failed to create master category')
      }
    } catch (error: any) {
      console.error('Failed to create master category:', error)
      toast.error(error.message || 'Failed to create master category')
    } finally {
      setLoading(false)
    }
  }

  // Assign store category to master
  const assignToMaster = async (storeCategoryId: string, masterCategoryId: string) => {
    // Admin can assign any store category, merchant can only assign their own
    if (!isAdmin && !user?.merchantInfo?.storeId) {
      toast.error('Store information not available')
      return
    }

    try {
      setLoading(true)
      console.log('🚀 Starting assignment:', { storeCategoryId, masterCategoryId })
      
      const response = await categoryApi.updateCategory(storeCategoryId, {
        parent: masterCategoryId
      })

      console.log('📡 Assignment API response:', response)

      if (response.success) {
        toast.success('Category assigned to master successfully')
        // Refresh current view
        switch (viewMode) {
          case 'hierarchical':
            fetchHierarchicalData()
            break
          case 'store':
            fetchStoreCategories()
            break
        }
        // Also refresh master categories and stats
        fetchMasterCategories()
      } else {
        console.error('❌ Assignment failed:', response)
        throw new Error(response.message || 'Failed to assign category')
      }
    } catch (error: any) {
      console.error('❌ Assignment error:', error)
      toast.error(error.message || 'Failed to assign category')
    } finally {
      setLoading(false)
      console.log('✅ Assignment process completed')
    }
  }

  // Remove from master (make orphan)
  const removeFromMaster = async (storeCategoryId: string) => {
    try {
      setLoading(true)
      
      const response = await categoryApi.updateCategory(storeCategoryId, {
        parent: undefined // Remove parent reference
      })

      if (response.success) {
        toast.success('Category removed from master')
        // Refresh current view
        switch (viewMode) {
          case 'hierarchical':
            fetchHierarchicalData()
            break
          case 'store':
            fetchStoreCategories()
            break
        }
      } else {
        throw new Error(response.message || 'Failed to remove category from master')
      }
    } catch (error: any) {
      console.error('Failed to remove from master:', error)
      toast.error(error.message || 'Failed to remove from master')
    } finally {
      setLoading(false)
    }
  }

  // Reset master form
  const resetMasterForm = () => {
    setMasterFormData({
      name: '',
      description: '',
      image: '',
      icon: '',
      order: 0,
      meta: {
        title: '',
        description: '',
        keywords: ''
      }
    })
  }

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return {
        masterCategories,
        hierarchicalData,
        storeCategories
      }
    }

    const searchLower = searchTerm.toLowerCase()

    return {
      masterCategories: masterCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description?.toLowerCase().includes(searchLower) ?? false)
      ),
      hierarchicalData: hierarchicalData.filter(item =>
        item.masterCategory.name.toLowerCase().includes(searchLower) ||
        (item.masterCategory.description?.toLowerCase().includes(searchLower) ?? false) ||
        item.stores.some((store: any) => 
          store.storeName.toLowerCase().includes(searchLower) ||
          store.categories.some((cat: any) => 
            cat.name.toLowerCase().includes(searchLower)
          )
        )
      ),
      storeCategories: storeCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchLower) ||
        (cat.description?.toLowerCase().includes(searchLower) ?? false)
      )
    }
  }, [masterCategories, hierarchicalData, storeCategories, searchTerm])

  // Statistics
  const stats = useMemo(() => {
    return {
      totalMasters: masterCategories.length,
      totalStoreCategories: storeCategories.length,
      assignedCategories: storeCategories.filter(cat => cat.parent).length,
      orphanCategories: storeCategories.filter(cat => !cat.parent).length,
      totalProducts: hierarchicalData.reduce((sum, item) => sum + item.totalProductCount, 0)
    }
  }, [masterCategories, storeCategories, hierarchicalData])

  return {
    // State
    masterCategories: filteredData.masterCategories,
    hierarchicalData: filteredData.hierarchicalData,
    storeCategories: filteredData.storeCategories,
    loading,
    error,
    viewMode,
    selectedMaster,
    showMasterForm,
    searchTerm,
    masterFormData,
    stats,
    canManageMaster: isAdmin, // Only admin can manage master categories
    
    // Setters
    setViewMode,
    setSelectedMaster,
    setShowMasterForm,
    setSearchTerm,
    setMasterFormData,
    setError,
    
    // Actions
    createMasterCategory,
    assignToMaster,
    removeFromMaster,
    resetMasterForm,
    fetchMasterCategories,
    fetchHierarchicalData,
    fetchStoreCategories
  }
}
