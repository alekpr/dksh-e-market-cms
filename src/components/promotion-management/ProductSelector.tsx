/**
 * Product Selector Component
 * Allows selection of products for promotions
 */
import { useState, useEffect, useCallback } from 'react'
import { Search, Package, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { tokenStorage } from '@/lib/api'

interface Product {
  _id: string
  name: string
  price: number
  sku: string
  category?: {
    _id: string
    name: string
  }
  images?: string[]
  stock?: number
}

interface ProductSelectorProps {
  selectedProducts: string[]
  onSelectionChange: (productIds: string[]) => void
  maxSelection?: number
  promotionType?: string
}

export function ProductSelector({ 
  selectedProducts, 
  onSelectionChange, 
  maxSelection = 50,
  promotionType = 'featured_products'
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSelector, setShowSelector] = useState(false)

  // Fetch products
  const fetchProducts = useCallback(async () => {
    const token = tokenStorage.getAccessToken()
    if (!token) return

    try {
      setLoading(true)
      const response = await fetch('/api/v1/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

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
    if (showSelector) {
      fetchProducts()
    }
  }, [showSelector, fetchProducts])

  // Fetch selected product details when selection changes
  useEffect(() => {
    const fetchDetails = async () => {
      const token = tokenStorage.getAccessToken()
      if (!token || selectedProducts.length === 0) {
        setSelectedProductDetails([])
        return
      }

      try {
        const promises = selectedProducts.map(productId =>
          fetch(`/api/v1/products/${productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.ok ? res.json() : null)
        )

        const results = await Promise.all(promises)
        const validProducts = results
          .filter(result => result && result.data)
          .map(result => result.data)

        setSelectedProductDetails(validProducts)
      } catch (error) {
        console.error('Error fetching selected products:', error)
      }
    }

    fetchDetails()
  }, [selectedProducts]) // Depend on selectedProducts directly

  const handleProductToggle = (productId: string) => {
    const isSelected = selectedProducts.includes(productId)
    
    if (isSelected) {
      // Remove from selection
      const newSelection = selectedProducts.filter(id => id !== productId)
      onSelectionChange(newSelection)
    } else {
      // Add to selection (check max limit)
      if (selectedProducts.length >= maxSelection) {
        toast.error(`Maximum ${maxSelection} products can be selected`)
        return
      }
      
      const newSelection = [...selectedProducts, productId]
      onSelectionChange(newSelection)
    }
  }

  const handleRemoveProduct = (productId: string) => {
    const newSelection = selectedProducts.filter(id => id !== productId)
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    const visibleProductIds = filteredProducts
      .slice(0, maxSelection)
      .map(product => product._id)
    onSelectionChange(visibleProductIds)
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className="space-y-4">
      {/* Header with selection summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Selected Products</h3>
          <p className="text-sm text-muted-foreground">
            {selectedProducts.length} of {maxSelection} products selected
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Products
        </Button>
      </div>

      {/* Selected products display */}
      {selectedProductDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Selected Products ({selectedProductDetails.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedProductDetails.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">฿{product.price?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProduct(product._id)}
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
          <Card className="w-full max-w-4xl max-h-[80vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Products</CardTitle>
                  <CardDescription>
                    Choose products for your {promotionType.replace('_', ' ')} promotion
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search and actions */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, SKU, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={filteredProducts.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={selectedProducts.length === 0}
                  >
                    Clear All
                  </Button>
                </div>
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
                      const isSelected = selectedProducts.includes(product._id)
                      
                      return (
                        <div
                          key={product._id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent ${
                            isSelected ? 'border-primary bg-primary/5' : ''
                          }`}
                          onClick={() => handleProductToggle(product._id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleProductToggle(product._id)}
                              className="mt-1"
                            />
                            
                            <div className="flex-1 min-w-0">
                              {product.images && product.images[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-32 object-cover rounded mb-3"
                                />
                              )}
                              
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm line-clamp-2">
                                  {product.name}
                                </h4>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-primary">
                                    ฿{product.price?.toLocaleString()}
                                  </span>
                                  {product.stock !== undefined && (
                                    <Badge variant="secondary" className="text-xs">
                                      Stock: {product.stock}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-xs text-muted-foreground">
                                  SKU: {product.sku}
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
                  variant="outline"
                  onClick={() => setShowSelector(false)}
                >
                  Cancel
                </Button>
                <Button
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
