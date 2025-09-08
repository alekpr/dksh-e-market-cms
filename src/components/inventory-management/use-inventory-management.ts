import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { productApi, type Product } from '@/lib/api'

export type InventoryViewMode = 'dashboard' | 'stock-tracking' | 'low-stock' | 'bulk-update'

interface InventoryItem {
  productId: string
  productName: string
  productSlug: string
  productStatus: string
  variantId: string
  variantName: string
  sku: string
  currentStock: number
  lowStockThreshold: number
  isLowStock: boolean
  isOutOfStock: boolean
  trackInventory: boolean
  storeName?: string
  storeId?: string
  images: string[] | { url: string; alt?: string; position?: number; isMain?: boolean }[]
  basePrice: number
}

export interface InventoryStats {
  totalProducts: number
  totalVariants: number
  inStock: number
  lowStock: number
  outOfStock: number
  totalValue: number
}

export interface BulkUpdateItem {
  productId: string
  variantId: string
  currentStock: number
  newStock: number
  productName: string
  variantName: string
}

// Helper function for exponential backoff retry
const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      // Don't retry on 429 errors - wait longer
      if (error.message?.includes('429') && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
        console.log(`Attempt ${attempt} failed with 429. Retrying in ${Math.round(delay)}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      if (attempt === maxRetries) {
        throw error
      }
      
      // For other errors, use shorter delay
      const delay = baseDelay * attempt
      console.log(`Attempt ${attempt} failed. Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries exceeded')
}

export const useInventoryManagement = () => {
  const { user, userStore } = useAuth()
  const [loading, setLoading] = useState(false) // เปลี่ยนจาก true เป็น false
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [lastLoadTime, setLastLoadTime] = useState<number>(0)

  // View state
  const [currentView, setCurrentView] = useState<InventoryViewMode>('dashboard')

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all') // all, in-stock, low-stock, out-of-stock
  const [sortBy, setSortBy] = useState<string>('productName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Cache duration: 30 seconds
  const CACHE_DURATION = 30 * 1000

  // Derived states
  const isAdmin = user?.role === 'admin'
  const isMerchant = user?.role === 'merchant'
  const userStoreId = userStore?._id
  const canManageInventory = isAdmin || (isMerchant && userStoreId)
  const storeName = userStore?.name || 'Your Store'

  // Load products and convert to inventory items with retry mechanism and caching
  const loadInventoryData = useCallback(async (forceRefresh = false) => {
    console.log('🚀 loadInventoryData called:', {
      canManageInventory,
      loading,
      forceRefresh,
      lastLoadTime: new Date(lastLoadTime).toISOString(),
      cacheValid: !forceRefresh && lastLoadTime && (Date.now() - lastLoadTime < CACHE_DURATION)
    })
    
    if (!canManageInventory || loading) {
      console.log('❌ Skipping loadInventoryData:', {
        canManageInventory,
        loading
      })
      return // Prevent multiple concurrent loads
    }
    
    // Check cache first
    const now = Date.now()
    if (!forceRefresh && lastLoadTime && (now - lastLoadTime < CACHE_DURATION)) {
      console.log('Using cached inventory data')
      return
    }
    
    try {
      setLoading(true)
      setError(null)

      // Build filters for products API
      const filters: any = {
        limit: 200, // Get more products for inventory view
        status: 'active', // Only show active products
        sortBy: 'name',
        sortOrder: 'asc'
      }

      // For merchants, only show their own products
      if (isMerchant && userStoreId) {
        filters.store = userStoreId
      }

      // Use retry mechanism for API call
      const response = await retry(
        () => productApi.getProducts(filters),
        3, // Max 3 retries
        2000 // Start with 2 second delay for 429 errors
      )
      
      const isSuccess = response.status === 'success' || response.success === true
      const responseData = response.data
      
      if (isSuccess && responseData) {
        const productData = responseData.data || responseData || []
        setProducts(productData)
        
        // Convert products to inventory items
        const items = convertProductsToInventoryItems(productData)
        setInventoryItems(items)
        setLastLoadTime(now)
      } else {
        console.error('❌ Invalid API response:', response)
        setError('Failed to load inventory data')
      }
    } catch (err) {
      console.error('Error loading inventory data:', err)
      if (err instanceof Error && err.message.includes('429')) {
        setError('Server is busy. Please wait a moment and try again.')
      } else {
        setError('Failed to load inventory data')
      }
    } finally {
      setLoading(false)
    }
  }, [canManageInventory, isMerchant, userStoreId, loading, lastLoadTime, CACHE_DURATION])

  // Convert products array to inventory items array
  const convertProductsToInventoryItems = (products: Product[]): InventoryItem[] => {
    const items: InventoryItem[] = []
    
    products.forEach(product => {
      product.variants.forEach(variant => {
        const isLowStock = variant.inventory.trackInventory && 
                          variant.inventory.quantity <= (variant.inventory.lowStockThreshold || 5)
        const isOutOfStock = variant.inventory.trackInventory && variant.inventory.quantity === 0
        
        items.push({
          productId: product._id,
          productName: product.name,
          productSlug: product.slug,
          productStatus: product.status,
          variantId: variant._id,
          variantName: variant.name,
          sku: variant.sku || 'N/A',
          currentStock: variant.inventory.quantity,
          lowStockThreshold: variant.inventory.lowStockThreshold || 5,
          isLowStock,
          isOutOfStock,
          trackInventory: variant.inventory.trackInventory,
          storeName: typeof product.store === 'object' ? product.store.name : undefined,
          storeId: typeof product.store === 'string' ? product.store : product.store._id,
          images: product.images,
          basePrice: product.basePrice
        })
      })
    })
    
    return items
  }

  // Calculate inventory statistics
  const inventoryStats = useMemo((): InventoryStats => {
    const totalVariants = inventoryItems.length
    const totalProducts = new Set(inventoryItems.map(item => item.productId)).size
    
    const inStock = inventoryItems.filter(item => 
      !item.isOutOfStock && !item.isLowStock).length
    const lowStock = inventoryItems.filter(item => 
      item.isLowStock && !item.isOutOfStock).length
    const outOfStock = inventoryItems.filter(item => 
      item.isOutOfStock).length
    
    const totalValue = inventoryItems.reduce((sum, item) => 
      sum + (item.currentStock * item.basePrice), 0)

    return {
      totalProducts,
      totalVariants,
      inStock,
      lowStock,
      outOfStock,
      totalValue
    }
  }, [inventoryItems])

  // Filter and sort inventory items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...inventoryItems]

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(search) ||
        item.variantName.toLowerCase().includes(search) ||
        (item.sku && item.sku.toLowerCase().includes(search))
      )
    }

    // Apply status filter
    switch (filterStatus) {
      case 'in-stock':
        filtered = filtered.filter(item => !item.isOutOfStock && !item.isLowStock)
        break
      case 'low-stock':
        filtered = filtered.filter(item => item.isLowStock && !item.isOutOfStock)
        break
      case 'out-of-stock':
        filtered = filtered.filter(item => item.isOutOfStock)
        break
      default:
        // 'all' - no additional filtering
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'productName':
          aValue = a.productName
          bValue = b.productName
          break
        case 'variantName':
          aValue = a.variantName
          bValue = b.variantName
          break
        case 'currentStock':
          aValue = a.currentStock
          bValue = b.currentStock
          break
        case 'sku':
          aValue = a.sku || ''
          bValue = b.sku || ''
          break
        default:
          return 0
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortOrder === 'asc' ? comparison : -comparison
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    return filtered
  }, [inventoryItems, searchTerm, filterStatus, sortBy, sortOrder])

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedItems.slice(startIndex, endIndex)
  }, [filteredAndSortedItems, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage)

  // Load data on mount with debouncing
  useEffect(() => {
    console.log('🔍 useInventoryManagement useEffect triggered:', {
      canManageInventory,
      isMerchant,
      userStoreId,
      user: user?.email,
      userStore: userStore?._id
    })
    
    if (canManageInventory) {
      console.log('✅ Can manage inventory, calling loadInventoryData')
      const timer = setTimeout(() => {
        loadInventoryData()
      }, 100) // Small delay to prevent immediate multiple calls
      
      return () => clearTimeout(timer)
    } else {
      console.log('❌ Cannot manage inventory:', {
        canManageInventory,
        isAdmin,
        isMerchant,
        userStoreId
      })
    }
  }, [canManageInventory, isMerchant, userStoreId]) // Include key dependencies but not the function itself

  // Update inventory for a specific variant
  const updateInventory = async (productId: string, variantId: string, newQuantity: number): Promise<boolean> => {
    try {
      const response = await retry(
        () => productApi.updateProductInventory(productId, variantId, newQuantity),
        3,
        1000
      )
      
      if (response.success || response.status === 'success') {
        // Update local state immediately for better UX
        setInventoryItems(current => 
          current.map(item => 
            item.productId === productId && item.variantId === variantId
              ? {
                  ...item,
                  currentStock: newQuantity,
                  isLowStock: newQuantity <= item.lowStockThreshold && newQuantity > 0,
                  isOutOfStock: newQuantity === 0
                }
              : item
          )
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating inventory:', error)
      return false
    }
  }

  // Bulk update inventory
  const bulkUpdateInventory = async (updates: BulkUpdateItem[]): Promise<boolean> => {
    try {
      const promises = updates.map(update =>
        retry(
          () => productApi.updateProductInventory(update.productId, update.variantId, update.newStock),
          3,
          1000
        )
      )

      const results = await Promise.allSettled(promises)
      const successCount = results.filter(result => result.status === 'fulfilled').length
      
      if (successCount > 0) {
        // Update local state for successful updates
        setInventoryItems(current => {
          const updated = [...current]
          updates.forEach((update, index) => {
            if (results[index].status === 'fulfilled') {
              const itemIndex = updated.findIndex(item => 
                item.productId === update.productId && item.variantId === update.variantId
              )
              if (itemIndex !== -1) {
                const item = updated[itemIndex]
                updated[itemIndex] = {
                  ...item,
                  currentStock: update.newStock,
                  isLowStock: update.newStock <= item.lowStockThreshold && update.newStock > 0,
                  isOutOfStock: update.newStock === 0
                }
              }
            }
          })
          return updated
        })
      }
      
      return successCount === updates.length
    } catch (error) {
      console.error('Error bulk updating inventory:', error)
      return false
    }
  }

  return {
    // Data
    inventoryItems: paginatedItems,
    allInventoryItems: inventoryItems,
    inventoryStats,
    products,

    // State
    loading,
    error,
    searchTerm,
    filterStatus,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    currentView,

    // Computed
    storeName,
    canManageInventory,
    isAdmin,
    isMerchant,

    // Actions
    loadInventoryData,
    updateInventory,
    bulkUpdateInventory,
    
    // Setters
    setSearchTerm,
    setFilterStatus,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setCurrentView,
    setError
  }
}
