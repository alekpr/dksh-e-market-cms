import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash2, Package, Star, Eye } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Product, Category, Store } from '@/lib/api'

interface ProductDetailViewProps {
  product: Product
  categories: Category[]
  stores: Store[]
  storeName?: string
  isAdmin: boolean
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleStatus: (product: Product) => void
  onToggleFeatured: (product: Product) => void
  onBack: () => void
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  categories,
  stores,
  storeName,
  isAdmin,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onBack
}) => {
  
  // Helper function to get image URL (handle both string and object formats)
  const getImageUrl = (imageItem: string | {url: string; alt?: string; position?: number; isMain?: boolean}): string => {
    if (typeof imageItem === 'string') {
      // If it's already a full URL, use it as is
      if (imageItem.startsWith('http')) return imageItem
      // If it's a relative URL, make it absolute
      return `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${imageItem}`
    }
    
    // If it's an object, get the URL property
    const url = imageItem.url
    if (url?.startsWith('http')) return url
    return `${import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${url}`
  }
  
  // Get status badge variant
  const getStatusBadge = (status: Product['status']): "default" | "secondary" | "outline" | "destructive" => {
    const variants = {
      active: 'default' as const,
      draft: 'secondary' as const,
      pending: 'outline' as const,
      archived: 'destructive' as const,
      deleted: 'destructive' as const,
    }
    return variants[status] || 'secondary'
  }

  // Get store name helper
  const getStoreName = (store: Store | string) => {
    if (typeof store === 'string') {
      const storeObj = stores.find(s => s._id === store)
      return storeObj?.name || 'Unknown Store'
    }
    return store.name
  }

  // Get category names helper
  const getCategoryNames = (categories: Category[] | string[]) => {
    if (!categories || categories.length === 0) return []
    
    if (typeof categories[0] === 'string') {
      return categories.map(catId => {
        const category = categories.find((c: any) => c._id === catId)
        return category ? (category as any).name : 'Unknown'
      }).filter(Boolean)
    }
    
    return (categories as Category[]).map(c => c.name)
  }

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price)
  }

  // Get inventory status helper
  const getInventoryStatus = (product: Product) => {
    const totalStock = product.variants.reduce((sum, v) => sum + v.inventory.quantity, 0)
    if (totalStock === 0) return { status: 'Out of Stock', color: 'text-red-600' }
    if (totalStock < 10) return { status: 'Low Stock', color: 'text-yellow-600' }
    return { status: 'In Stock', color: 'text-green-600' }
  }

  const inventoryStatus = getInventoryStatus(product)
  
  // Handle both categories (array) and category (single) structures
  const productCategories = product.categories || (product.category ? [product.category] : [])
  const categoryNames = getCategoryNames(productCategories)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground">
            Product details for {storeName || 'your store'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onEdit(product)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onToggleStatus(product)}
          >
            {product.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(product._id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                <div className="aspect-square w-full">
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder')
                      if (placeholder) (placeholder as HTMLElement).style.display = 'flex'
                    }}
                  />
                  <div className="placeholder hidden aspect-square w-full bg-gray-100 rounded-lg items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-3 gap-2">
                    {product.images.slice(1, 4).map((image, index) => (
                      <img
                        key={index}
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 2}`}
                        className="aspect-square w-full object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ))}
                  </div>
                )}
                {product.images.length > 4 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{product.images.length - 4} more images
                  </p>
                )}
              </div>
            ) : (
              <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant={getStatusBadge(product.status)} className="text-sm">
                  {product.status.toUpperCase()}
                </Badge>
                <Badge variant={inventoryStatus.status === 'In Stock' ? 'default' : 'destructive'}>
                  {inventoryStatus.status}
                </Badge>
                {product.featured && (
                  <Badge variant="outline" className="text-yellow-600">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleFeatured(product)}
                >
                  {product.featured ? 'Remove Featured' : 'Make Featured'}
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground mt-1">
                    {typeof product.description === 'string' 
                      ? product.description 
                      : product.description?.short || 'No description available'
                    }
                  </p>
                </div>
                
                {typeof product.description === 'object' && product.description?.detailed && (
                  <div>
                    <span className="font-medium">Detailed Description:</span>
                    <p className="text-muted-foreground mt-1 whitespace-pre-wrap">
                      {product.description.detailed}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Base Price:</span>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {formatPrice(product.basePrice)}
                    </p>
                  </div>
                  
                  {isAdmin && (
                    <div>
                      <span className="font-medium">Store:</span>
                      <p className="text-muted-foreground mt-1">
                        {getStoreName(product.store)}
                      </p>
                    </div>
                  )}
                </div>

                {categoryNames.length > 0 && (
                  <div>
                    <span className="font-medium">Categories:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {categoryNames.map((name, index) => (
                        <Badge key={index} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {product.variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Variant Name</span>
                        <p className="font-medium">{variant.name}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">SKU</span>
                        <p className="font-mono text-sm">{variant.sku || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Price</span>
                        <p className="font-medium">{formatPrice(variant.price)}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Stock</span>
                        <p className={`font-medium ${
                          (typeof variant.inventory === 'number' ? variant.inventory : variant.inventory.quantity) === 0 ? 'text-red-600' :
                          (typeof variant.inventory === 'number' ? variant.inventory : variant.inventory.quantity) < ((typeof variant.inventory === 'object' ? variant.inventory.lowStockThreshold : null) || 5) ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {typeof variant.inventory === 'number' ? variant.inventory : variant.inventory.quantity} units
                        </p>
                        {typeof variant.inventory === 'object' && variant.inventory.lowStockThreshold && (
                          <p className="text-xs text-muted-foreground">
                            Low stock at: {variant.inventory.lowStockThreshold}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Package Type Information */}
                    {((variant as any).packageType || (variant as any).packageUnit || (variant as any).packageQuantity) && (
                      <div className="mt-3 pt-3 border-t bg-blue-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-blue-700 mb-2 block">Package Information:</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {(variant as any).packageType && (
                            <div>
                              <span className="text-xs text-blue-600">Package Type</span>
                              <p className="text-sm font-medium">{(variant as any).packageType}</p>
                            </div>
                          )}
                          
                          {(variant as any).packageUnit && (
                            <div>
                              <span className="text-xs text-blue-600">Display Unit</span>
                              <p className="text-sm font-medium">{(variant as any).packageUnit}</p>
                            </div>
                          )}
                          
                          {(variant as any).packageQuantity && (
                            <div>
                              <span className="text-xs text-blue-600">Quantity per Package</span>
                              <p className="text-sm font-medium">{(variant as any).packageQuantity}</p>
                            </div>
                          )}
                        </div>
                        
                        {(variant as any).packageType && (variant as any).packageUnit && (variant as any).packageQuantity && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">
                              {(variant as any).packageQuantity} {(variant as any).packageUnit} • {formatPrice(variant.price)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Weight & Dimensions Information */}
                    {((variant as any).weight || (variant as any).dimensions) && (
                      <div className="mt-3 pt-3 border-t bg-green-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-green-700 mb-2 block">📦 Weight & Dimensions (Shipping):</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(variant as any).weight && (variant as any).weight.value > 0 && (
                            <div>
                              <span className="text-xs text-green-600">Weight</span>
                              <p className="text-sm font-medium">
                                {(variant as any).weight.value} {(variant as any).weight.unit === 'gram' ? 'g' : (variant as any).weight.unit}
                              </p>
                            </div>
                          )}
                          
                          {(variant as any).dimensions && (
                            (variant as any).dimensions.length > 0 || 
                            (variant as any).dimensions.width > 0 || 
                            (variant as any).dimensions.height > 0
                          ) && (
                            <div>
                              <span className="text-xs text-green-600">Dimensions (L×W×H)</span>
                              <p className="text-sm font-medium">
                                {(variant as any).dimensions.length} × {(variant as any).dimensions.width} × {(variant as any).dimensions.height} {(variant as any).dimensions.unit === 'cm' ? 'cm' : (variant as any).dimensions.unit}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {(variant as any).weight && (variant as any).dimensions && (
                          <div className="mt-2 pt-2 border-t border-green-200">
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              💚 สำหรับคำนวณค่าจัดส่ง
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-sm font-medium text-muted-foreground">Attributes:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(variant.attributes || {}).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Product Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Created At</span>
                  <p>{new Date(product.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                  <p>{new Date(product.updatedAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Product ID</span>
                <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {product._id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
