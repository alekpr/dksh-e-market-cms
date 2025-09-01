import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { productApi, categoryApi, storeApi, type Product, type Category, type Store } from '@/lib/api'

export type ViewMode = 'list' | 'add' | 'edit' | 'view'

export interface ProductFormData {
  name: string
  description: {
    short: string
    detailed: string
  }
  basePrice: number
  categories: string[]
  store: string
  variants: {
    name: string
    sku: string
    price: number
    inventory: {
      quantity: number
      trackInventory: boolean
      lowStockThreshold?: number
    }
    attributes: Record<string, string>
  }[]
  images: string[] // Standardize to string array only
  status: 'draft' | 'active' | 'archived' | 'deleted'
  featured: boolean
  meta?: {
    title: string
    description: string
    keywords: string
  }
}

export interface ProductStats {
  total: number
  active: number
  draft: number
  archived: number
  outOfStock: number
  featured: number
}

export const useProductManagement = () => {
  const { user, userStore } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // View state
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStore, setFilterStore] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: {
      short: '',
      detailed: ''
    },
    basePrice: 0,
    categories: [],
    store: '',
    variants: [{
      name: 'Default',
      sku: '',
      price: 0,
      inventory: {
        quantity: 0,
        trackInventory: true,
        lowStockThreshold: 5
      },
      attributes: {}
    }],
    images: [],
    status: 'draft',
    featured: false,
    meta: {
      title: '',
      description: '',
      keywords: ''
    }
  })
  
  // Calculate stats
  const [productStats, setProductStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    draft: 0,
    archived: 0,
    outOfStock: 0,
    featured: 0
  })

  const isAdmin = user?.role === 'admin'
  const isMerchant = user?.role === 'merchant'
  const userStoreId = userStore?._id
  const canManageProducts = isAdmin || (isMerchant && userStoreId)
  const storeName = userStore?.name || 'Your Store'

  // Load initial data
  useEffect(() => {
    if (canManageProducts) {
      loadProducts()
      loadCategories()
      if (isAdmin) {
        loadStores()
      }
    }
  }, [canManageProducts, currentPage, filterStatus, filterCategory, filterStore, sortBy, sortOrder])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build filters
      const filters: any = {
        page: currentPage,
        limit: 20,
        sortBy: sortBy,  // แก้จาก sort เป็น sortBy
        sortOrder: sortOrder,  // แก้จาก order เป็น sortOrder
      }

      if (filterStatus !== 'all') filters.status = filterStatus
      if (filterCategory !== 'all') filters.category = filterCategory
      if (filterStore !== 'all') filters.store = filterStore

      // For merchants, only show their own products
      if (isMerchant && userStoreId) {
        filters.store = userStoreId
      }

      const response = await productApi.getProducts(filters)
      console.log('🔍 Product API Response:', response)
      
      // Handle both response formats: {success: true, data: ...} and {status: 'success', data: ...}
      const isSuccess = response.status === 'success' || response.success === true
      const responseData = response.data
      
      if (isSuccess && responseData) {
        const productData = responseData.data || responseData || []
        const count = responseData.count || responseData.pagination?.total || productData.length
        
        console.log('📦 Product Data:', productData)
        console.log('📊 Product Count:', count)
        
        setProducts(productData)
        setTotalPages(Math.ceil(count / 20))
        
        // Calculate stats
        const stats = calculateStats(productData)
        console.log('📈 Calculated Stats:', stats)
        setProductStats(stats)
      } else {
        console.error('❌ Invalid API response:', response)
      }
    } catch (err) {
      console.error('Error loading products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getCategories({
        isActive: true,
        limit: 100,
        sort: 'name',
        order: 'asc',
        ...(isMerchant && userStoreId && {
          store: userStoreId
        })
      })
      
      if ((response.status === 'success' || response.success) && response.data) {
        setCategories(response.data.data || response.data)
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadStores = async () => {
    try {
      const response = await storeApi.getStores({
        limit: 100,
        status: 'active',
        sortBy: 'businessName',
        sortOrder: 'asc'
      })
      if (response.status === 'success' && response.data) {
        setStores(response.data.data || [])
      }
    } catch (err) {
      console.error('Error loading stores:', err)
    }
  }

  const calculateStats = (productList: Product[]): ProductStats => {
    return {
      total: productList.length,
      active: productList.filter(p => p.status === 'active').length,
      draft: productList.filter(p => p.status === 'draft').length,
      archived: productList.filter(p => p.status === 'archived').length,
      outOfStock: productList.filter(p => 
        p.variants.every(v => v.inventory.quantity === 0)
      ).length,
      featured: productList.filter(p => p.featured).length,
    }
  }

  // Handlers
  const handleAdd = () => {
    setSelectedProduct(null)
    setFormData({
      name: '',
      description: {
        short: '',
        detailed: ''
      },
      basePrice: 0,
      categories: [],
      store: isMerchant ? userStoreId || '' : '',
      variants: [{
        name: 'Default',
        sku: '',
        price: 0,
        inventory: {
          quantity: 0,
          trackInventory: true,
          lowStockThreshold: 5
        },
        attributes: {}
      }],
      images: [],
      status: 'draft',
      featured: false,
      meta: {
        title: '',
        description: '',
        keywords: ''
      }
    })
    setCurrentView('add')
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      categories: typeof product.categories[0] === 'string' 
        ? product.categories as string[]
        : (product.categories as Category[]).map(c => c._id),
      store: typeof product.store === 'string' ? product.store : product.store._id,
      variants: product.variants.map(v => ({
        name: v.name,
        sku: v.sku || '',
        price: v.price,
        inventory: v.inventory,
        attributes: v.attributes || {}
      })),
      images: product.images,
      status: product.status,
      featured: product.featured,
      meta: {
        title: '',
        description: '',
        keywords: ''
      }
    })
    setCurrentView('edit')
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setCurrentView('view')
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const isEditing = currentView === 'edit' && selectedProduct
      
      // Transform formData to match API requirements
      const apiData = {
        ...formData,
        status: formData.status === 'deleted' ? 'archived' : formData.status,
        variants: formData.variants.map((v, index) => ({
          ...v,
          _id: isEditing && selectedProduct?.variants[index]?._id || undefined,
          isDefault: index === 0
        }))
      }

      const response = isEditing
        ? await productApi.updateProduct(selectedProduct._id, apiData as any)
        : await productApi.createProduct(apiData as any)

      if (response.status === 'success') {
        await loadProducts()
        setCurrentView('list')
        setSelectedProduct(null)
      }
    } catch (err) {
      console.error('Error saving product:', err)
      setError('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    try {
      setLoading(true)
      const response = await productApi.deleteProduct(productId)
      if (response.status === 'success') {
        await loadProducts()
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (product: Product) => {
    try {
      // Backend accepts: 'draft', 'active', 'archived'
      const newStatus = product.status === 'active' ? 'archived' : 'active'
      
      // Optimistically update the local state for immediate UI feedback
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === product._id 
            ? { ...p, status: newStatus }
            : p
        )
      )
      
      // Update stats immediately based on new status
      setProductStats(prevStats => {
        const updatedStats = { ...prevStats }
        
        // Decrease count for old status
        if (product.status === 'active') {
          updatedStats.active = Math.max(0, updatedStats.active - 1)
        }
        
        // Increase count for new status  
        if (newStatus === 'active') {
          updatedStats.active = updatedStats.active + 1
        }
        
        return updatedStats
      })
      
      // Make API call
      const response = await productApi.updateProductStatus(product._id, newStatus)
      if (response.status === 'success') {
        // Reload data to ensure consistency with backend
        await loadProducts()
      } else {
        // Revert optimistic update if API call failed
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === product._id 
              ? { ...p, status: product.status }
              : p
          )
        )
        // Revert stats
        await loadProducts()
      }
    } catch (err) {
      console.error('Error updating product status:', err)
      setError('Failed to update product status')
      // Revert optimistic update on error
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p._id === product._id 
            ? { ...p, status: product.status }
            : p
        )
      )
      // Reload to get correct state
      await loadProducts()
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    if (!isAdmin) return

    try {
      const response = await productApi.toggleProductFeatured(product._id)
      if (response.status === 'success') {
        await loadProducts()
      }
    } catch (err) {
      console.error('Error toggling featured status:', err)
      setError('Failed to update featured status')
    }
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedProduct(null)
    setError(null)
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchTerm('')
      loadProducts()
      return
    }

    try {
      setLoading(true)
      setSearchTerm(query)
      
      const response = await productApi.searchProducts(query, {
        page: currentPage,
        limit: 20,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        store: filterStore !== 'all' ? filterStore : undefined,
      })

      if (response.status === 'success' && response.data) {
        setProducts(response.data.data || [])
        setTotalPages(Math.ceil((response.data.count || 0) / 20))
      }
    } catch (err) {
      console.error('Error searching products:', err)
      setError('Failed to search products')
    } finally {
      setLoading(false)
    }
  }

  return {
    // Data
    products,
    categories,
    stores,
    loading,
    error,
    
    // View state
    currentView,
    selectedProduct,
    
    // Filter state
    searchTerm,
    filterStatus,
    filterCategory,
    filterStore,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    
    // Form state
    formData,
    productStats,
    
    // Permissions and user info
    canManageProducts,
    isAdmin,
    isMerchant,
    storeName,
    
    // Handlers
    handleAdd,
    handleEdit,
    handleView,
    handleSave,
    handleDelete,
    handleToggleStatus,
    handleToggleFeatured,
    handleCancel,
    handleSearch,
    
    // State setters
    setSearchTerm,
    setFilterStatus,
    setFilterCategory,
    setFilterStore,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setFormData,
  }
}

export type UseProductManagementReturn = ReturnType<typeof useProductManagement>
