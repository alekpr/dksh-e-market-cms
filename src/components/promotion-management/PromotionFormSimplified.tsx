/**
 * Simplified Promotion Form for Flash Sales and Featured Products Only
 * Complete form with product selection and pricing management
 */
import { useState, useCallback } from 'react'
import { CalendarDays, Package, Tag, Zap, Gift } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ProductSelectorWithPricing } from './ProductSelectorWithPricing'
import { QuantityDiscountConfig } from './QuantityDiscountConfig'
import type { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '@/lib/api'
import { API_BASE_URL } from '@/lib/api'

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

interface ProductWithPricing {
  product: {
    _id: string
    name: string
    price: number
    basePrice?: number
    sku: string
    category?: { _id: string; name: string }
    images?: string[]
    stock?: number
  }
  promotionalPrice?: number
  discountType?: 'percentage' | 'fixed_amount'
  discountValue?: number
  isActive?: boolean
}

interface PromotionFormSimplifiedProps {
  promotion?: Promotion
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
  storeId?: string // Add storeId prop for product filtering
}

// Options for selects
const promotionTypes = [
  { value: 'featured_products', label: 'Featured Products', description: 'Highlight and promote specific products with optional discounts' },
  { value: 'flash_sale', label: 'Flash Sale', description: 'Time-limited special pricing on selected products' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y', description: 'Buy certain quantity and get additional items free or discounted' },
  { value: 'quantity_discount', label: 'Quantity Discount', description: 'Bulk discount: buy X items get fixed amount discount' }
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' }
]

export function PromotionFormSimplified({ promotion, onSubmit, onCancel, loading = false, storeId }: PromotionFormSimplifiedProps) {
  const [formData, setFormData] = useState({
    // Basic info
    title: promotion?.title || '',
    description: promotion?.description || '',
    type: (promotion?.type as 'featured_products' | 'flash_sale' | 'buy_x_get_y' | 'quantity_discount') || 'featured_products',
    status: promotion?.status || 'draft',
    priority: promotion?.priority || 1,
    isActive: promotion?.isActive !== false,
    
    // Schedule
    startDate: promotion?.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : '',
    endDate: promotion?.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : '',
    
    // Featured products settings
    maxProducts: promotion?.featuredProducts?.maxProducts || 10,
    autoSelect: promotion?.featuredProducts?.autoSelect || false,
    
    // Flash sale settings
    availableQuantity: promotion?.flashSale?.availableQuantity || 0,
    showCountdown: promotion?.flashSale?.showCountdown !== false,
    notifyBeforeStart: 60, // minutes
    
        // Buy X Get Y settings
    buyQuantity: promotion?.discount?.buyQuantity || 3,
    getQuantity: promotion?.discount?.getQuantity || 1,
    getDiscountType: promotion?.discount?.getDiscountType || 'free',
    getDiscountValue: promotion?.discount?.getDiscountValue || 0,
    
    // Quantity Discount settings
    quantityDiscount: {
      tiers: promotion?.quantityDiscount?.tiers || [{ minQuantity: 5, discountAmount: 100 }],
      applyTo: promotion?.quantityDiscount?.applyTo || 'total_order',
      description: promotion?.quantityDiscount?.description || ''
    }
  })

  // Convert promotion data to ProductWithPricing format
  const initializeSelectedProducts = (): ProductWithPricing[] => {
    if (!promotion?.featuredProducts?.productIds) return []
    
    return promotion.featuredProducts.productIds.map((product: any) => {
      // Try to get promotional price from metadata first
      const productMetadata = promotion.metadata?.productPricing?.find(
        (p: any) => p.productId === (product._id || product)
      )
      
      const originalPrice = product.basePrice || product.price || 0
      const promotionalPrice = productMetadata?.promotionalPrice || 
                               promotion.flashSale?.salePrice || 
                               originalPrice
      
      return {
        product: {
          _id: product._id || product,
          name: product.name || '',
          price: product.price || product.basePrice || 0,
          basePrice: product.basePrice || product.price || 0,
          sku: product.sku || '',
          category: product.category,
          images: product.images,
          stock: product.stock
        },
        promotionalPrice: promotionalPrice,
        discountType: productMetadata?.discountType || 'percentage',
        discountValue: productMetadata?.discountValue || 0,
        isActive: true
      }
    })
  }

  const [selectedProducts, setSelectedProducts] = useState<ProductWithPricing[]>(initializeSelectedProducts())

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleProductSelectionChange = useCallback((products: ProductWithPricing[]) => {
    setSelectedProducts(products)
  }, [])

  // Calculate promotional price for Buy X Get Y promotion
  const calculatePromotionalPrice = useCallback((item: ProductWithPricing) => {
    const originalPrice = item.product.basePrice || item.product.price;
    
    // For Buy X Get Y, calculate promotional price based on current discount settings
    if (formData.type === 'buy_x_get_y') {
      if (formData.getDiscountType === 'free') {
        return 0;
      } else if (formData.getDiscountType === 'fixed_amount') {
        return Math.max(0, originalPrice - formData.getDiscountValue);
      } else if (formData.getDiscountType === 'percentage') {
        return originalPrice * (1 - formData.getDiscountValue / 100);
      }
    }
    
    // For other promotion types, use existing promotional price or original price
    return item.promotionalPrice || originalPrice;
  }, [formData.type, formData.getDiscountType, formData.getDiscountValue])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.title.trim()) {
      toast.error('Please enter a promotion title')
      return
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description')
      return
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates')
      return
    }
    
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date')
      return
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product')
      return
    }

    // Validate flash sale products have promotional pricing
    if (formData.type === 'flash_sale') {
      const invalidProducts = selectedProducts.filter(item => 
        !item.promotionalPrice || 
        item.promotionalPrice >= (item.product.basePrice || item.product.price)
      )
      
      if (invalidProducts.length > 0) {
        toast.error('Flash sale products must have promotional prices lower than original prices')
        return
      }
    }

    try {
      // Debug: Log current formData values
      console.log('DEBUG: Current formData before submission:', {
        startDate: formData.startDate,
        endDate: formData.endDate,
        title: formData.title
      })

      const submissionData: CreatePromotionRequest | UpdatePromotionRequest = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        isActive: formData.isActive,
        
        // Product selection
        applicableItems: selectedProducts.map(item => ({
          itemType: 'product',
          itemId: item.product._id,
          includeVariants: true
        })),
        
        // Featured products configuration
        featuredProducts: {
          productIds: selectedProducts.map(item => item.product._id),
          maxProducts: formData.maxProducts,
          autoSelect: formData.autoSelect,
          selectionCriteria: 'manual'
        },
        
        // Flash sale configuration
        ...(formData.type === 'flash_sale' && {
          flashSale: {
            originalPrice: 0, // Will be calculated from products
            salePrice: 0, // Will be calculated from products
            availableQuantity: formData.availableQuantity,
            soldQuantity: 0,
            notifyBeforeStart: formData.notifyBeforeStart,
            showCountdown: formData.showCountdown
          },
          // For flash sales, add discount information
          discount: selectedProducts.length > 0 ? {
            type: selectedProducts[0].discountType || 'fixed_amount',
            value: selectedProducts[0].discountValue || 0
          } : undefined
        }),

        // Buy X Get Y configuration
        ...(formData.type === 'buy_x_get_y' && {
          discount: {
            type: 'buy_x_get_y',
            value: formData.getDiscountType === 'free' ? 0 : formData.getDiscountValue, // Add required value field
            buyQuantity: formData.buyQuantity,
            getQuantity: formData.getQuantity,
            getDiscountType: formData.getDiscountType,
            getDiscountValue: formData.getDiscountType === 'free' ? 0 : formData.getDiscountValue
          }
        }),

        // Quantity Discount configuration
        ...(formData.type === 'quantity_discount' && {
          quantityDiscount: {
            tiers: formData.quantityDiscount.tiers,
            applyTo: formData.quantityDiscount.applyTo,
            description: formData.quantityDiscount.description
          }
        }),
        
        // For featured products with discounts
        ...(formData.type === 'featured_products' && selectedProducts.some(p => p.promotionalPrice && p.promotionalPrice < (p.product.basePrice || p.product.price)) && {
          discount: {
            type: 'percentage',
            value: 0 // Will be calculated based on individual product discounts
          }
        }),
        
        // Add metadata for product pricing
        metadata: {
          productPricing: selectedProducts.map(item => {
            const originalPrice = item.product.basePrice || item.product.price;
            let promotionalPrice = item.promotionalPrice;
            
            // For Buy X Get Y, calculate promotional price based on discount settings
            if (formData.type === 'buy_x_get_y' && !promotionalPrice) {
              if (formData.getDiscountType === 'free') {
                promotionalPrice = 0;
              } else if (formData.getDiscountType === 'fixed_amount') {
                promotionalPrice = Math.max(0, originalPrice - formData.getDiscountValue);
              } else if (formData.getDiscountType === 'percentage') {
                promotionalPrice = originalPrice * (1 - formData.getDiscountValue / 100);
              } else {
                promotionalPrice = originalPrice; // Fallback
              }
            }
            
            return {
              productId: item.product._id,
              originalPrice: originalPrice,
              promotionalPrice: promotionalPrice || originalPrice,
              discountType: item.discountType || formData.getDiscountType || 'fixed_amount',
              discountValue: item.discountValue || formData.getDiscountValue || 0,
              savings: originalPrice - (promotionalPrice || originalPrice)
            };
          })
        }
      }

      // Debug: Log complete submissionData before onSubmit
      console.log('DEBUG: Complete submissionData being sent to onSubmit:', submissionData)
      console.log('DEBUG: submissionData.endDate specifically:', submissionData.endDate)
      console.log('DEBUG: submissionData keys:', Object.keys(submissionData))

      await onSubmit(submissionData)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to submit form')
    }
  }, [formData, selectedProducts, onSubmit])

  return (
    <div className="w-full p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Set the basic details for your promotion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Promotion Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter promotion title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Promotion Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select promotion type" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your promotion..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                  placeholder="Priority level"
                />
              </div>

              {formData.type === 'featured_products' && (
                <div className="space-y-2">
                  <Label htmlFor="maxProducts">Max Products</Label>
                  <Input
                    id="maxProducts"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxProducts}
                    onChange={(e) => handleInputChange('maxProducts', parseInt(e.target.value) || 10)}
                    placeholder="Max to show"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Schedule
            </CardTitle>
            <CardDescription>
              Set when your promotion will be active
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection with Pricing - Hide pricing for Buy X Get Y */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {formData.type === 'buy_x_get_y' || formData.type === 'quantity_discount' 
                ? 'Product Selection' 
                : 'Product Selection & Pricing'}
            </CardTitle>
            <CardDescription>
              {formData.type === 'buy_x_get_y' 
                ? 'Choose products that are eligible for this Buy X Get Y promotion'
                : formData.type === 'quantity_discount'
                  ? 'Choose products that are eligible for quantity-based bulk discount'
                : 'Choose products and set their promotional pricing'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSelectorWithPricing
              selectedProducts={selectedProducts}
              onSelectionChange={handleProductSelectionChange}
              promotionType={formData.type}
              maxSelection={formData.type === 'featured_products' ? formData.maxProducts : 50}
              storeId={storeId}
            />
          </CardContent>
        </Card>

        {/* Flash Sale Specific Settings */}
        {formData.type === 'flash_sale' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Flash Sale Settings
              </CardTitle>
              <CardDescription>
                Configure flash sale specific options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="availableQuantity">Total Available Quantity</Label>
                  <Input
                    id="availableQuantity"
                    type="number"
                    min="0"
                    value={formData.availableQuantity}
                    onChange={(e) => handleInputChange('availableQuantity', parseInt(e.target.value) || 0)}
                    placeholder="Total quantity for sale"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave 0 for unlimited quantity
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notifyBeforeStart">Notify Before Start (minutes)</Label>
                  <Input
                    id="notifyBeforeStart"
                    type="number"
                    min="0"
                    value={formData.notifyBeforeStart}
                    onChange={(e) => handleInputChange('notifyBeforeStart', parseInt(e.target.value) || 60)}
                    placeholder="Minutes before notification"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showCountdown"
                  checked={formData.showCountdown}
                  onCheckedChange={(checked) => handleInputChange('showCountdown', checked)}
                />
                <Label htmlFor="showCountdown" className="text-sm font-medium">
                  Show countdown timer to users
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Buy X Get Y Specific Settings */}
        {formData.type === 'buy_x_get_y' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Buy X Get Y Settings
              </CardTitle>
              <CardDescription>
                Configure buy and get quantities for this promotion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="buyQuantity">Buy Quantity</Label>
                  <Input
                    id="buyQuantity"
                    type="number"
                    min="1"
                    value={formData.buyQuantity}
                    onChange={(e) => handleInputChange('buyQuantity', parseInt(e.target.value) || 3)}
                    placeholder="Quantity to buy"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of items customer must buy
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="getQuantity">Get Quantity</Label>
                  <Input
                    id="getQuantity"
                    type="number"
                    min="1"
                    value={formData.getQuantity}
                    onChange={(e) => handleInputChange('getQuantity', parseInt(e.target.value) || 1)}
                    placeholder="Quantity to get"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of items customer will get
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="getDiscountType">Get Type</Label>
                  <Select 
                    value={formData.getDiscountType} 
                    onValueChange={(value) => handleInputChange('getDiscountType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (100% off)</SelectItem>
                      <SelectItem value="percentage">Percentage discount</SelectItem>
                      <SelectItem value="fixed_amount">Fixed amount discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Get Discount Value - Show only for percentage and fixed_amount */}
              {(formData.getDiscountType === 'percentage' || formData.getDiscountType === 'fixed_amount') && (
                <div className="space-y-2">
                  <Label htmlFor="getDiscountValue">
                    {formData.getDiscountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (฿)'}
                  </Label>
                  <Input
                    id="getDiscountValue"
                    type="number"
                    min="0"
                    max={formData.getDiscountType === 'percentage' ? "100" : undefined}
                    step={formData.getDiscountType === 'percentage' ? "0.1" : "1"}
                    value={formData.getDiscountValue}
                    onChange={(e) => handleInputChange('getDiscountValue', parseFloat(e.target.value) || 0)}
                    placeholder={formData.getDiscountType === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 100 for ฿100'}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.getDiscountType === 'percentage' 
                      ? 'Enter percentage discount (0-100)' 
                      : 'Enter fixed discount amount in Baht'}
                  </p>
                </div>
              )}

              {/* Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Promotion Preview</h4>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Buy {formData.buyQuantity}</span> items, 
                  <span className="font-medium text-green-600"> get {formData.getQuantity}</span> items{' '}
                  {formData.getDiscountType === 'free' 
                    ? 'FREE' 
                    : formData.getDiscountType === 'percentage'
                      ? `with ${formData.getDiscountValue || 0}% discount`
                      : formData.getDiscountType === 'fixed_amount'
                        ? `with ฿${formData.getDiscountValue || 0} discount`
                        : `with ${formData.getDiscountType} discount`
                  }
                </p>
                {(formData.getDiscountType === 'percentage' || formData.getDiscountType === 'fixed_amount') && !formData.getDiscountValue && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⚠️ Please set the discount value above
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quantity Discount Specific Settings */}
        {formData.type === 'quantity_discount' && (
          <QuantityDiscountConfig
            tiers={formData.quantityDiscount.tiers}
            onChange={(tiers) => setFormData(prev => ({
              ...prev,
              quantityDiscount: {
                ...prev.quantityDiscount,
                tiers
              }
            }))}
          />
        )}

        {/* Summary */}
        {selectedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Promotion Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-primary">{selectedProducts.length}</p>
                </div>
                <div>
                  <p className="font-medium">Total Original Value</p>
                  <p className="text-2xl font-bold">
                    ฿{selectedProducts.reduce((sum, item) => sum + (item.product.basePrice || item.product.price), 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Total Promotional Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ฿{selectedProducts.reduce((sum, item) => sum + calculatePromotionalPrice(item), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Selected Products List - Preview */}
              <div>
                <h4 className="font-medium mb-3">Selected Products</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedProducts.map((item, index) => (
                    <div key={item.product._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder')
                            if (placeholder) (placeholder as HTMLElement).style.display = 'flex'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="placeholder hidden w-12 h-12 bg-gray-200 rounded border items-center justify-center">
                        <Package className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.product.name || 'No Name'}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.product.sku || 'No SKU'}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground line-through">
                            ฿{(item.product.basePrice || item.product.price || 0).toLocaleString()}
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            ฿{calculatePromotionalPrice(item).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (promotion ? 'Update Promotion' : 'Create Promotion')}
          </Button>
        </div>
      </form>
    </div>
  )
}
