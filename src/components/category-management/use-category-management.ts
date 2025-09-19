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
  
  // State for name conflict checking
  const [nameConflict, setNameConflict] = useState<{
    exists: boolean
    conflictType: 'store' | 'master' | 'other' | null
    suggestion: string | null
  }>({
    exists: false,
    conflictType: null,
    suggestion: null
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
      // Build API parameters - Only fetch flat data for consistency
      const apiParams = {
        withProducts: true,
        limit: 1000, // Get all for complete data
        isActive: filterStatus === 'all' ? undefined : (filterStatus === 'active'),
        ...(storeId && user?.role === 'merchant' ? { store: storeId } : {})
      }

      // Fetch only flat list - we'll build tree structure manually
      const response = await categoryApi.getCategories(apiParams)

      if (response.success && response.data) {
        const flatData = Array.isArray(response.data) ? response.data : []
        setFlatCategories(flatData)
        
        // Build tree structure from flat data
        const treeData = buildTreeFromFlat(flatData)
        setCategories(treeData)
        
        // Update pagination if available
        if (response.data.pagination) {
          setPagination(response.data.pagination)
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

  // Build tree structure from flat array
  const buildTreeFromFlat = (flatData: Category[]): Category[] => {
    const map = new Map<string, Category>()
    const roots: Category[] = []

    // First pass: create map and initialize children arrays
    flatData.forEach(category => {
      map.set(category._id, { ...category, children: [] })
    })

    // Second pass: build tree structure
    flatData.forEach(category => {
      const node = map.get(category._id)!
      const parentId = typeof category.parent === 'string' ? category.parent : category.parent?._id
      
      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId)!
        parent.children!.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  // Check for name conflicts
  const checkNameConflict = (name: string, excludeId?: string) => {
    if (!name.trim()) {
      setNameConflict({ exists: false, conflictType: null, suggestion: null })
      return
    }

    const trimmedName = name.trim().toLowerCase()
    const existingCategory = flatCategories.find(cat => 
      cat.name.toLowerCase() === trimmedName && 
      cat._id !== excludeId
    )

    if (existingCategory) {
      // Determine conflict type
      let conflictType: 'store' | 'master' | 'other' = 'other'
      if (!existingCategory.store) {
        conflictType = 'master'
      } else if (existingCategory.store === storeId) {
        conflictType = 'store'
      }

      // Generate suggestion
      const storePrefix = user?.merchantInfo?.storeName || 'Store'
      const suggestion = `${name.trim()} (${storePrefix})`

      setNameConflict({
        exists: true,
        conflictType,
        suggestion
      })
    } else {
      setNameConflict({ exists: false, conflictType: null, suggestion: null })
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
    // Apply search filter to flatCategories first
    let searchFiltered = flatCategories
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      searchFiltered = flatCategories.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        (category.description?.toLowerCase().includes(searchLower) ?? false)
      )
    }

    // Return based on view mode
    if (viewMode === 'tree') {
      // Build tree structure from filtered flat data
      return buildTreeFromFlat(searchFiltered)
    } else {
      // Return flat filtered data for table
      return searchFiltered
    }
  }, [flatCategories, searchTerm, viewMode])

  // Get category statistics - Use flatCategories for accurate counts
  const categoryStats = useMemo(() => {
    // Always use flatCategories for statistics to ensure accuracy
    const dataForStats = flatCategories
    
    const total = dataForStats.length
    const active = dataForStats.filter(cat => cat.isActive).length
    const inactive = total - active
    const withProducts = dataForStats.filter(cat => cat.productCount && cat.productCount.total > 0).length
    const featured = dataForStats.filter(cat => cat.featuredOrder && cat.featuredOrder > 0).length

    return {
      total,
      active,
      inactive,
      withProducts,
      featured
    }
  }, [flatCategories])

  // Get display statistics for current view (what user actually sees)
  const displayStats = useMemo(() => {
    // Use filteredCategories in flat format for accurate counting
    let flatDisplayData: Category[] = []
    
    if (viewMode === 'tree' && Array.isArray(filteredCategories)) {
      // Flatten tree structure for counting
      const flattenTree = (cats: Category[]): Category[] => {
        return cats.reduce((acc: Category[], cat) => {
          acc.push(cat)
          if (cat.children && cat.children.length > 0) {
            acc.push(...flattenTree(cat.children))
          }
          return acc
        }, [])
      }
      flatDisplayData = flattenTree(filteredCategories as Category[])
    } else {
      flatDisplayData = Array.isArray(filteredCategories) ? filteredCategories as Category[] : []
    }

    const total = flatDisplayData.length
    const active = flatDisplayData.filter(cat => cat.isActive).length
    const inactive = total - active
    const withProducts = flatDisplayData.filter(cat => cat.productCount && cat.productCount.total > 0).length
    const featured = flatDisplayData.filter(cat => cat.featuredOrder && cat.featuredOrder > 0).length

    return {
      total,
      active,
      inactive,
      withProducts,
      featured
    }
  }, [filteredCategories, viewMode])

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
    
    // Clear name conflict state
    setNameConflict({ exists: false, conflictType: null, suggestion: null })
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
      
      // Prepare category data with proper field handling
      const categoryData: any = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        icon: formData.icon.trim(),
        isActive: formData.isActive,
        order: formData.order,
        // Ensure meta is properly structured - always send the object
        meta: {
          title: formData.meta.title?.trim() || '',
          description: formData.meta.description?.trim() || '',
          keywords: formData.meta.keywords?.trim() || ''
        }
      }

      // Only add parent if it has a valid value
      if (formData.parent && formData.parent.trim()) {
        categoryData.parent = formData.parent.trim()
      } else if (currentView === 'edit' && selectedCategory?.parent) {
        // For edit mode: if category had parent before but now parent is empty,
        // we need to explicitly remove parent by sending a special value
        categoryData.removeParent = true
      }

      // Only include store for merchants
      if (user?.role === 'merchant' && storeId) {
        categoryData.store = storeId
      }

      // Debug logging to check what data is being sent
      console.log('🔍 Category Data being sent to API:', categoryData)
      console.log('🔍 User role:', user?.role)
      console.log('🔍 Store ID:', storeId)
      console.log('🔍 Form Data:', formData)

      if (currentView === 'edit' && selectedCategory) {
        // Update existing category
        try {
          console.log('🔄 Updating category with ID:', selectedCategory._id)
          const response = await categoryApi.updateCategory(selectedCategory._id, categoryData)
          console.log('✅ Update response:', response)
          
          if (response.success) {
            toast.success('Category updated successfully')
          } else {
            console.error('❌ Update failed - response:', response)
            throw new Error(response.message || 'Failed to update category')
          }
        } catch (updateError: any) {
          console.error('❌ Update error:', updateError)
          // Handle specific duplicate name error for updates
          if (updateError.message?.includes('category with this name already exists')) {
            const userChoice = window.confirm(
              `⚠️ Category Name Conflict\n\n` +
              `The name "${formData.name}" is already in use by another category.\n\n` +
              `Click "OK" to update with a unique name\n` +
              `Click "Cancel" to choose a different name yourself`
            )
            
            if (userChoice) {
              // Update with store prefix to make it unique
              const storePrefix = user?.merchantInfo?.storeName || 'Store'
              const uniqueName = `${formData.name.trim()} (${storePrefix} Updated)`
              const uniqueData = {
                ...categoryData,
                name: uniqueName,
                originalName: formData.name.trim(),
                // Add metadata to track this was auto-renamed
                meta: {
                  ...categoryData.meta,
                  autoRenamed: true,
                  originalRequestedName: formData.name.trim(),
                  renamedDuringUpdate: true
                }
              }
              
              try {
                const retryResponse = await categoryApi.updateCategory(selectedCategory._id, uniqueData)
                if (retryResponse.success) {
                  toast.success(`✅ Category updated as "${uniqueName}"`, {
                    description: "The name was modified to avoid conflicts"
                  })
                  // Update form to show the actual name used
                  setFormData(prev => ({ ...prev, name: uniqueName }))
                } else {
                  throw new Error(retryResponse.message || 'Failed to update category with unique name')
                }
              } catch (retryError: any) {
                toast.error(`Failed to update category: ${retryError.message}`, {
                  description: "Please try a completely different name"
                })
                return
              }
            } else {
              toast.error('Please choose a different category name', {
                description: "The current name conflicts with an existing category"
              })
              return
            }
          } else {
            throw updateError
          }
        }
      } else {
        // Create new category
        try {
          console.log('✨ Creating new category')
          const response = await categoryApi.createCategory(categoryData)
          console.log('✅ Create response:', response)
          
          if (response.success) {
            toast.success('Category created successfully')
          } else {
            console.error('❌ Create failed - response:', response)
            throw new Error(response.message || 'Failed to create category')
          }
        } catch (createError: any) {
          console.error('❌ Create error:', createError)
          // Handle specific duplicate name error
          if (createError.message?.includes('category with this name already exists')) {
            // More user-friendly dialog with better options
            const userChoice = window.confirm(
              `⚠️ Category Name Conflict\n\n` +
              `The name "${formData.name}" is already in use.\n\n` +
              `This could be because:\n` +
              `• Another category in your store has this name\n` +
              `• A master category already exists with this name\n` +
              `• Another store is using this name\n\n` +
              `Click "OK" to create with a unique name\n` +
              `Click "Cancel" to choose a different name yourself`
            )
            
            if (userChoice) {
              // Create with store prefix to make it unique
              const storePrefix = user?.merchantInfo?.storeName || 'Store'
              const uniqueName = `${formData.name.trim()} (${storePrefix})`
              const uniqueData = {
                ...categoryData,
                name: uniqueName,
                originalName: formData.name.trim(),
                // Add metadata to track this was auto-renamed
                meta: {
                  ...categoryData.meta,
                  autoRenamed: true,
                  originalRequestedName: formData.name.trim()
                }
              }
              
              try {
                const retryResponse = await categoryApi.createCategory(uniqueData)
                if (retryResponse.success) {
                  toast.success(`✅ Category created as "${uniqueName}"`, {
                    description: "The name was modified to avoid conflicts"
                  })
                  // Update form to show the actual name used
                  setFormData(prev => ({ ...prev, name: uniqueName }))
                } else {
                  throw new Error(retryResponse.message || 'Failed to create category with unique name')
                }
              } catch (retryError: any) {
                // If even the unique name fails, show detailed error
                toast.error(`Failed to create category: ${retryError.message}`, {
                  description: "Please try a completely different name"
                })
                return
              }
            } else {
              // User chose to pick a different name
              toast.error('Please choose a different category name', {
                description: "The current name conflicts with an existing category"
              })
              return
            }
          } else {
            throw createError
          }
        }
      }

      setCurrentView('list')
      resetForm()
      setSelectedCategory(null)
      console.log('🔄 Refreshing categories list...')
      fetchCategories() // Refresh the list
      
    } catch (error: any) {
      console.error('❌ Failed to save category:', error)
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
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
    categoryStats: displayStats,
    canManageCategories,
    storeId,
    storeName: user?.merchantInfo?.storeName,
    hasValidStore,
    nameConflict,
    
    // Setters
    setSearchTerm: handleSearch,
    setFilterStatus: handleStatusFilter,
    setViewMode: handleViewModeChange,
    setFormData,
    setCurrentPage,
    
    // Utilities
    checkNameConflict,
    
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
