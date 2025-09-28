/**
 * Enhanced Product Selector with Pricing for Flash Sales and Featured Products
 * Allows selection of products with individual pricing configuration
 */
import { useState, useEffect, useCallback } from 'react'
import { Search, Package, X, Plus, DollarSign, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { tokenStorage, API_BASE_URL } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

// Helper function to get proper image URL
const getImageUrl = (image: string | { url: string; alt?: string; position?: number; isMain?: boolean }) => {
  if (typeof image === 'string') {
    // Handle string format - check if it's already a full URL
    if (image.startsWith('http')) {
      return image
    }
    // If it's just an ID, construct the backend URL
    return `${API_BASE_URL}/files/${image}/serve`
  }
  
  // Handle object format
  if (image && typeof image === 'object' && image.url) {
    if (image.url.startsWith('http')) {
      return image.url
    }
    return `${API_BASE_URL}/files/${image.url}/serve`
  }
  
  return ''
}

interface Product {
  _id: string
  name: string
  price: number
  basePrice?: number
  sku: string
  category?: {
    _id: string
    name: string
  }
  images?: string[]
  stock?: number
}

interface ProductWithPricing {
  product: Product
  promotionalPrice?: number
  discountType?: 'percentage' | 'fixed_amount'
  discountValue?: number
  isActive?: boolean
}

interface ProductSelectorWithPricingProps {
  selectedProducts: ProductWithPricing[]
  onSelectionChange: (products: ProductWithPricing[]) => void
  promotionType: 'featured_products' | 'flash_sale' | 'buy_x_get_y' | 'quantity_discount'
  maxSelection?: number
  storeId?: string // Add storeId prop for filtering products by store
}

export function ProductSelectorWithPricing({ 
  selectedProducts, 
  onSelectionChange, 
  promotionType,
  maxSelection = 50,
  storeId: propStoreId // Rename to avoid conflict
}: ProductSelectorWithPricingProps) {
  const { userStore } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSelector, setShowSelector] = useState(false)

  // Use prop storeId if provided, otherwise fall back to user's store
  const storeId = propStoreId || userStore?._id

  const fetchProducts = useCallback(async () => {
    const token = tokenStorage.getAccessToken()
    if (!token || !storeId) return

    try {
      setLoading(true)
            const response = await fetch(`${API_BASE_URL}/products?store=${storeId}&limit=50`);

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [storeId]) // Use storeId directly instead of userStore?._id

  // Filter products based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
      return
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [products, searchTerm])

  // Initial data fetch
  useEffect(() => {
    if (showSelector && storeId) {
      fetchProducts()
    }
  }, [showSelector, fetchProducts]) // Include fetchProducts in dependencies now that it's properly memoized

  const handleProductToggle = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.product._id === product._id)
    
    if (isSelected) {
      // Remove from selection
      const newSelection = selectedProducts.filter(p => p.product._id !== product._id)
      onSelectionChange(newSelection)
    } else {
      // Add to selection (check max limit)
      if (selectedProducts.length >= maxSelection) {
        toast.error(`Maximum ${maxSelection} products can be selected`)
        return
      }
      
      const newProduct: ProductWithPricing = {
        product,
        promotionalPrice: product.price,
        discountType: 'percentage',
        discountValue: promotionType === 'flash_sale' ? 10 : 0,
        isActive: true
      }
      
      const newSelection = [...selectedProducts, newProduct]
      onSelectionChange(newSelection)
    }
  }

  const handleRemoveProduct = (productId: string) => {
    const newSelection = selectedProducts.filter(p => p.product._id !== productId)
    onSelectionChange(newSelection)
  }

  const handlePricingUpdate = (productId: string, field: string, value: any) => {
    const newSelection = selectedProducts.map(item => {
      if (item.product._id === productId) {
        const updated = { ...item, [field]: value }
        
        // Auto-calculate promotional price based on discount
        if (field === 'discountType' || field === 'discountValue') {
          const originalPrice = item.product.basePrice || item.product.price
          
          if (updated.discountType === 'percentage' && updated.discountValue) {
            updated.promotionalPrice = originalPrice * (1 - updated.discountValue / 100)
          } else if (updated.discountType === 'fixed_amount' && updated.discountValue) {
            updated.promotionalPrice = Math.max(0, originalPrice - updated.discountValue)
          }
        }
        
        return updated
      }
      return item
    })
    
    onSelectionChange(newSelection)
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.product._id === productId)
  }

  return (
    <div className="space-y-4">
      {/* Header with selection summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {promotionType === 'flash_sale' ? 'Flash Sale Products' : 'Featured Products'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedProducts.length} of {maxSelection} products selected
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Products
        </Button>
      </div>

      {/* Selected products with pricing configuration */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selected Products with Pricing ({selectedProducts.length})
            </CardTitle>
            <CardDescription>
              Configure pricing and discounts for each selected product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedProducts.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  {/* Product Info */}
                  <div className="flex items-center gap-3 flex-1">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={getImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder')
                          if (placeholder) (placeholder as HTMLElement).style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="placeholder hidden w-16 h-16 bg-gray-100 rounded border items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.product.name || 'No Name'}</p>
                      <p className="text-xs text-muted-foreground">SKU: {item.product.sku || 'No SKU'}</p>
                      <p className="text-xs text-muted-foreground">
                        Original: ฿{(item.product.basePrice || item.product.price || 0).toLocaleString()}
                      </p>
                      {item.product.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.product.category.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Pricing Configuration - Hide for Buy X Get Y and Quantity Discount */}
                  {promotionType !== 'buy_x_get_y' && promotionType !== 'quantity_discount' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                      {promotionType === 'flash_sale' && (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs">Discount Type</Label>
                            <Select 
                              value={item.discountType} 
                              onValueChange={(value) => handlePricingUpdate(item.product._id, 'discountType', value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed_amount">Fixed Amount (฿)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">
                              Discount Value {item.discountType === 'percentage' ? '(%)' : '(฿)'}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max={item.discountType === 'percentage' ? 100 : undefined}
                              value={item.discountValue || 0}
                              onChange={(e) => handlePricingUpdate(item.product._id, 'discountValue', parseFloat(e.target.value) || 0)}
                              className="h-8"
                              placeholder="0"
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-1">
                        <Label className="text-xs">
                          {promotionType === 'flash_sale' ? 'Sale Price (฿)' : 'Promotional Price (฿)'}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.promotionalPrice || 0}
                          onChange={(e) => handlePricingUpdate(item.product._id, 'promotionalPrice', parseFloat(e.target.value) || 0)}
                          className="h-8"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Savings Display */}
                      {item.promotionalPrice && item.promotionalPrice < (item.product.basePrice || item.product.price) && (
                        <div className="flex items-center gap-2 text-green-600">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Save ฿{((item.product.basePrice || item.product.price) - item.promotionalPrice).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buy X Get Y - Show only product info */}
                  {promotionType === 'buy_x_get_y' && (
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">
                        <p><span className="font-medium">Original Price:</span> ฿{(item.product.basePrice || item.product.price).toLocaleString()}</p>
                        <p className="text-xs mt-1">Discount will be applied based on Buy X Get Y settings</p>
                      </div>
                    </div>
                  )}

                  {/* Quantity Discount - Show only product info */}
                  {promotionType === 'quantity_discount' && (
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground">
                        <p><span className="font-medium">Original Price:</span> ฿{(item.product.basePrice || item.product.price).toLocaleString()}</p>
                        <p className="text-xs mt-1">Bulk discount will be applied based on quantity tiers</p>
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduct(item.product._id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product selection modal/dialog */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-7xl max-h-[90vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Products</CardTitle>
                  <CardDescription>
                    Choose products for your {promotionType.replace('_', ' ')} promotion
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selection summary */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {selectedProducts.length} / {maxSelection} selected
                </span>
                <span>
                  {filteredProducts.length} products shown
                </span>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">Loading products...</div>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">No products found</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => {
                      const isSelected = isProductSelected(product._id)
                      
                      return (
                        <div
                          key={product._id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent ${
                            isSelected ? 'border-primary bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleProductToggle(product)}
                              className="mt-1"
                            />
                            
                            <div className="flex-1 min-w-0">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={getImageUrl(product.images[0])}
                                  alt={product.name}
                                  className="w-full h-32 object-cover rounded mb-3 border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder')
                                    if (placeholder) (placeholder as HTMLElement).style.display = 'flex'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-32 bg-gray-100 rounded mb-3 border flex items-center justify-center">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div className="placeholder hidden w-full h-32 bg-gray-100 rounded mb-3 border items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm line-clamp-2">
                                  {product.name || 'No Name'}
                                </h4>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-primary">
                                    ฿{(product.basePrice || product.price || 0).toLocaleString()}
                                  </span>
                                  {product.stock !== undefined && (
                                    <Badge variant="secondary" className="text-xs">
                                      Stock: {product.stock}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.sku || 'No SKU'}
                                </p>
                                
                                {product.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {product.category.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            <div className="flex-shrink-0 p-6 border-t">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSelector(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowSelector(false)}
                >
                  Done ({selectedProducts.length} selected)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
