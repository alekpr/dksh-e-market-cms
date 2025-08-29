import { useState, useMemo, useEffect } from 'react'
import { categoryApi } from '@/lib/api'
import type { Category } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export type ViewMode = 'list' | 'add' | 'edit' | 'view'

export interface CategoryFormData {
  name: string
  description: string
  parent: string
  image: string
  icon: string
  isActive: boolean
  order: number
  meta: {
    title: string
    description: string
    keywords: string
  }
}

export const useCategoryManagement = () => {
  const { user, hasValidStore } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [flatCategories, setFlatCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 50,
  })
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent: '',
    image: '',
    icon: '',
    isActive: true,
    order: 0,
    meta: {
      title: '',
      description: '',
      keywords: ''
    }
  })

  // Check if user can manage categories
  const canManageCategories = useMemo(() => {
    if (user?.role === 'admin') return true
    if (user?.role === 'merchant') {
      return hasValidStore && !!user.merchantInfo?.storeId
    }
    return false
  }, [user, hasValidStore])

  // Get store ID for API calls
  const storeId = user?.merchantInfo?.storeId

  // Fetch categories for merchant's store
  const fetchCategories = async () => {
    if (!canManageCategories) {
      setError('Access denied: Merchant with valid store or Admin role required')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // Build API parameters
      const apiParams = {
        asTree: true,
        withProducts: true,
        page: currentPage,
        limit: pagination.limit,
        isActive: filterStatus === 'all' ? undefined : (filterStatus === 'active'),
        ...(storeId && user?.role === 'merchant' ? { store: storeId } : {})
      }

      // Fetch tree structure for display
      const treeResponse = await categoryApi.getCategories(apiParams)

      if (treeResponse.success && treeResponse.data) {
        setCategories(Array.isArray(treeResponse.data) ? treeResponse.data : [])
      }

      // Fetch flat list for form dropdown and table view
      const flatParams = {
        withProducts: true,
        limit: 1000, // Get all for dropdown
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active',
        ...(storeId && user?.role === 'merchant' ? { store: storeId } : {})
      }

      const flatResponse = await categoryApi.getCategories(flatParams)

      if (flatResponse.success && flatResponse.data) {
        setFlatCategories(Array.isArray(flatResponse.data) ? flatResponse.data : [])
        
        // Update pagination if available
        if (flatResponse.data.pagination) {
          setPagination(flatResponse.data.pagination)
        }
      }

    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
      setError('Failed to load categories. Please try again.')
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  // Load categories on component mount and when filters change
  useEffect(() => {
    if (canManageCategories) {
      fetchCategories()
    }
  }, [canManageCategories, currentPage, filterStatus, searchTerm])

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return viewMode === 'tree' ? categories : flatCategories
    }

    const searchLower = searchTerm.toLowerCase()
    const filterCategory = (category: Category): boolean => {
      return category.name.toLowerCase().includes(searchLower) ||
             (category.description?.toLowerCase().includes(searchLower) ?? false)
    }

    if (viewMode === 'tree') {
      const filterTreeCategories = (cats: Category[]): Category[] => {
        return cats.reduce((acc: Category[], category) => {
          const matchesSearch = filterCategory(category)
          const filteredChildren = category.children ? filterTreeCategories(category.children) : []
          
          if (matchesSearch || filteredChildren.length > 0) {
            acc.push({
              ...category,
              children: filteredChildren
            })
          }
          
          return acc
        }, [])
      }
      
      return filterTreeCategories(categories)
    } else {
      return flatCategories.filter(filterCategory)
    }
  }, [categories, flatCategories, searchTerm, viewMode])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parent: '',
      image: '',
      icon: '',
      isActive: true,
      order: 0,
      meta: {
        title: '',
        description: '',
        keywords: ''
      }
    })
  }

  // Handle add category
  const handleAdd = () => {
    setCurrentView('add')
    resetForm()
    setSelectedCategory(null)
  }

  // Handle edit category
  const handleEdit = (category: Category) => {
    setCurrentView('edit')
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parent: typeof category.parent === 'string' ? category.parent : category.parent?._id || '',
      image: category.image || '',
      icon: category.icon || '',
      isActive: category.isActive,
      order: category.order,
      meta: {
        title: category.meta?.title || '',
        description: category.meta?.description || '',
        keywords: category.meta?.keywords || ''
      }
    })
  }

  // Handle view category
  const handleView = (category: Category) => {
    setCurrentView('view')
    setSelectedCategory(category)
  }

  // Handle save (add/edit)
  const handleSave = async () => {
    if (!canManageCategories) {
      toast.error('Access denied')
      return
    }

    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    // For merchants, ensure storeId is available
    if (user?.role === 'merchant' && !storeId) {
      toast.error('Store information not available. Please contact support.')
      return
    }

    try {
      setLoading(true)
      
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent: formData.parent || undefined,
        image: formData.image.trim() || undefined,
        icon: formData.icon.trim() || undefined,
        // Only include store for merchants
        ...(user?.role === 'merchant' && storeId ? { store: storeId } : {})
      }

      if (currentView === 'edit' && selectedCategory) {
        // Update existing category
        const response = await categoryApi.updateCategory(selectedCategory._id, categoryData)
        if (response.success) {
          toast.success('Category updated successfully')
        } else {
          throw new Error(response.message || 'Failed to update category')
        }
      } else {
        // Create new category
        const response = await categoryApi.createCategory(categoryData)
        if (response.success) {
          toast.success('Category created successfully')
        } else {
          throw new Error(response.message || 'Failed to create category')
        }
      }

      setCurrentView('list')
      resetForm()
      setSelectedCategory(null)
      fetchCategories() // Refresh the list
      
    } catch (error: any) {
      console.error('Failed to save category:', error)
      toast.error(error.message || 'Failed to save category')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete category
  const handleDelete = async (id: string) => {
    if (!canManageCategories) {
      toast.error('Access denied')
      return
    }

    try {
      setLoading(true)
      const response = await categoryApi.deleteCategory(id)
      if (response.success) {
        toast.success('Category deleted successfully')
        fetchCategories() // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to delete category')
      }
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      toast.error(error.message || 'Failed to delete category')
    } finally {
      setLoading(false)
    }
  }

  // Handle toggle category status
  const handleToggleStatus = async (category: Category) => {
    if (!canManageCategories) {
      toast.error('Access denied')
      return
    }

    try {
      const response = await categoryApi.updateCategory(category._id, {
        isActive: !category.isActive
      })
      
      if (response.success) {
        toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`)
        fetchCategories()
      } else {
        throw new Error(response.message || 'Failed to update category status')
      }
    } catch (error: any) {
      console.error('Failed to toggle category status:', error)
      toast.error(error.message || 'Failed to update category status')
    }
  }

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle view mode change
  const handleViewModeChange = (mode: 'tree' | 'table') => {
    setViewMode(mode)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setCurrentPage(1)
  }

  // Handle cancel form
  const handleCancel = () => {
    setCurrentView('list')
    resetForm()
    setSelectedCategory(null)
  }

  // Get category statistics
  const categoryStats = useMemo(() => {
    const total = flatCategories.length
    const active = flatCategories.filter(cat => cat.isActive).length
    const inactive = total - active
    const withProducts = flatCategories.filter(cat => cat.productCount && cat.productCount.total > 0).length
    const featured = flatCategories.filter(cat => cat.featuredOrder && cat.featuredOrder > 0).length

    return {
      total,
      active,
      inactive,
      withProducts,
      featured
    }
  }, [flatCategories])

  return {
    // State
    categories: filteredCategories,
    flatCategories,
    loading,
    error,
    setError,
    currentView,
    selectedCategory,
    searchTerm,
    filterStatus,
    viewMode,
    formData,
    currentPage,
    pagination,
    categoryStats,
    canManageCategories,
    storeId,
    storeName: user?.merchantInfo?.storeName,
    hasValidStore,
    
    // Setters
    setSearchTerm: handleSearch,
    setFilterStatus: handleStatusFilter,
    setViewMode: handleViewModeChange,
    setFormData,
    setCurrentPage,
    
    // Actions
    handleAdd,
    handleEdit,
    handleView,
    handleSave,
    handleDelete,
    handleToggleStatus,
    handleClearFilters,
    handleCancel,
    fetchCategories
  }
}
