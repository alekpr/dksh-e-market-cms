/**
 * Enhanced Promotion Form with Product Selection
 * Complete form for creating and editing promotions with product selection
 */
import { useState, useCallback } from 'react'
import { CalendarDays, Percent, Tag, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ProductSelector } from './ProductSelector'
import type { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '@/lib/api'

interface PromotionFormEnhancedProps {
  promotion?: Promotion
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

// Options for selects - Only Flash Sale and Featured Products
const promotionTypes = [
  { value: 'featured_products', label: 'Featured Products', description: 'Highlight and promote specific products' },
  { value: 'flash_sale', label: 'Flash Sale', description: 'Time-limited special pricing on selected products' }
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' }
]

const discountTypes = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed_amount', label: 'Fixed Amount (฿)' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y' },
  { value: 'free_shipping', label: 'Free Shipping' }
]

const bannerPositions = [
  { value: 'header', label: 'Header Banner' },
  { value: 'home_slider', label: 'Homepage Slider' },
  { value: 'category_top', label: 'Category Page Top' },
  { value: 'product_detail', label: 'Product Detail Page' },
  { value: 'footer', label: 'Footer Banner' }
]

export function PromotionFormEnhanced({ promotion, onSubmit, onCancel, loading = false }: PromotionFormEnhancedProps) {
  const [formData, setFormData] = useState({
    // Basic info
    title: promotion?.title || '',
    description: promotion?.description || '',
    type: promotion?.type || 'featured_products',
    status: promotion?.status || 'draft',
    priority: promotion?.priority || 1,
    isActive: promotion?.isActive !== false,
    
    // Schedule
    startDate: promotion?.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : '',
    endDate: promotion?.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : '',
    
    // Discount
    discountType: promotion?.discount?.type || 'fixed_amount',
    discountValue: promotion?.discount?.value || 0,
    maxDiscount: promotion?.discount?.maxDiscount || 0,
    
    // Buy X Get Y
    buyQuantity: promotion?.discount?.buyQuantity || 1,
    getQuantity: promotion?.discount?.getQuantity || 1,
    
    // Usage limits
    totalUsageLimit: promotion?.usageLimit?.total || 0,
    perUserLimit: promotion?.usageLimit?.perUser || 0,
    perDayLimit: promotion?.usageLimit?.perDay || 0,
    
    // Banner settings
    bannerImage: promotion?.banner?.image || '',
    bannerLink: promotion?.banner?.link || '',
    bannerPosition: promotion?.banner?.position || 'home_slider',
    displayOrder: promotion?.banner?.displayOrder || 1,
    
    // Featured products settings
    maxProducts: promotion?.featuredProducts?.maxProducts || 10,
    autoSelect: promotion?.featuredProducts?.autoSelect || false,
    selectionCriteria: promotion?.featuredProducts?.selectionCriteria || 'manual',
    
    // Flash sale settings
    originalPrice: promotion?.flashSale?.originalPrice || 0,
    salePrice: promotion?.flashSale?.salePrice || 0,
    availableQuantity: promotion?.flashSale?.availableQuantity || 0,
    showCountdown: promotion?.flashSale?.showCountdown !== false,
    
    // Product selection
    selectedProducts: promotion?.featuredProducts?.productIds?.map(id => id.toString()) || []
  })

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleProductSelectionChange = useCallback((productIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: productIds
    }))
  }, [])

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

    // Type-specific validation
    if (formData.type === 'featured_products' && !formData.autoSelect && formData.selectedProducts.length === 0) {
      toast.error('Please select at least one product for featured products promotion')
      return
    }
    
    if (formData.type === 'flash_sale' && formData.selectedProducts.length === 0) {
      toast.error('Please select products for flash sale')
      return
    }
    
    if (formData.type === 'promotional_banner' && !formData.bannerImage.trim()) {
      toast.error('Please provide a banner image URL')
      return
    }

    try {
      const submissionData: CreatePromotionRequest | UpdatePromotionRequest = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        isActive: formData.isActive,
        
        // Discount configuration
        discount: {
          type: formData.discountType,
          value: formData.discountValue,
          maxDiscount: formData.maxDiscount > 0 ? formData.maxDiscount : undefined,
          buyQuantity: formData.discountType === 'buy_x_get_y' ? formData.buyQuantity : undefined,
          getQuantity: formData.discountType === 'buy_x_get_y' ? formData.getQuantity : undefined,
          getDiscountType: formData.discountType === 'buy_x_get_y' ? 'free' : undefined
        },
        
        // Usage limits
        usageLimit: {
          total: formData.totalUsageLimit > 0 ? formData.totalUsageLimit : undefined,
          perUser: formData.perUserLimit > 0 ? formData.perUserLimit : undefined,
          perDay: formData.perDayLimit > 0 ? formData.perDayLimit : undefined
        },
        
        // Applicable items (products)
        applicableItems: formData.selectedProducts.length > 0 ? 
          formData.selectedProducts.map(productId => ({
            itemType: 'product',
            itemId: productId,
            includeVariants: true
          })) : [],
        
        // Banner settings
        banner: formData.type === 'promotional_banner' ? {
          image: formData.bannerImage,
          link: formData.bannerLink,
          position: formData.bannerPosition,
          displayOrder: formData.displayOrder
        } : undefined,
        
        // Featured products settings
        featuredProducts: formData.type === 'featured_products' ? {
          productIds: formData.selectedProducts,
          maxProducts: formData.maxProducts,
          autoSelect: formData.autoSelect,
          selectionCriteria: formData.selectionCriteria
        } : undefined,
        
        // Flash sale settings
        flashSale: formData.type === 'flash_sale' ? {
          originalPrice: formData.originalPrice,
          salePrice: formData.salePrice,
          availableQuantity: formData.availableQuantity,
          soldQuantity: 0,
          notifyBeforeStart: 60,
          showCountdown: formData.showCountdown
        } : undefined
      }

      await onSubmit(submissionData)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to submit form')
    }
  }, [formData, onSubmit])

  // Show different sections based on promotion type
  const showDiscountSection = ['flash_sale', 'discount_coupon'].includes(formData.type)
  const showProductSection = ['featured_products', 'flash_sale'].includes(formData.type)
  const showBannerSection = formData.type === 'promotional_banner'
  const showFlashSaleSection = formData.type === 'flash_sale'
  const showFeaturedSection = formData.type === 'featured_products'

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
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
                  placeholder="Enter priority level"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="1"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 1)}
                  placeholder="Display order"
                />
              </div>

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

        {/* Product Selection */}
        {showProductSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Selection
              </CardTitle>
              <CardDescription>
                Choose which products this promotion applies to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductSelector
                selectedProducts={formData.selectedProducts}
                onSelectionChange={handleProductSelectionChange}
                maxSelection={formData.type === 'featured_products' ? formData.maxProducts : 50}
                promotionType={formData.type}
              />
            </CardContent>
          </Card>
        )}

        {/* Featured Products Settings */}
        {showFeaturedSection && (
          <Card>
            <CardHeader>
              <CardTitle>Featured Products Settings</CardTitle>
              <CardDescription>
                Configure how featured products are selected and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxProducts">Maximum Products to Show</Label>
                  <Input
                    id="maxProducts"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxProducts}
                    onChange={(e) => handleInputChange('maxProducts', parseInt(e.target.value) || 10)}
                    placeholder="Maximum number of products"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selectionCriteria">Selection Criteria</Label>
                  <Select 
                    value={formData.selectionCriteria} 
                    onValueChange={(value) => handleInputChange('selectionCriteria', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How to select products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Selection</SelectItem>
                      <SelectItem value="best_selling">Best Selling</SelectItem>
                      <SelectItem value="highest_rated">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest Products</SelectItem>
                      <SelectItem value="random">Random Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoSelect"
                  checked={formData.autoSelect}
                  onCheckedChange={(checked) => handleInputChange('autoSelect', checked)}
                />
                <Label htmlFor="autoSelect" className="text-sm font-medium">
                  Auto-select products based on criteria
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Discount Configuration */}
        {showDiscountSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Discount Configuration
              </CardTitle>
              <CardDescription>
                Configure discount amounts and limitations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(value) => handleInputChange('discountType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value 
                    {formData.discountType === 'percentage' ? ' (%)' : 
                     formData.discountType === 'fixed_amount' ? ' (฿)' : ''}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    min="0"
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    value={formData.discountValue}
                    onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                    placeholder="Enter discount value"
                    disabled={formData.discountType === 'free_shipping'}
                  />
                </div>
              </div>

              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscount">Maximum Discount Amount (฿) - Optional</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => handleInputChange('maxDiscount', parseFloat(e.target.value) || 0)}
                    placeholder="Maximum discount amount in baht"
                  />
                </div>
              )}

              {formData.discountType === 'buy_x_get_y' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="buyQuantity">Buy Quantity</Label>
                    <Input
                      id="buyQuantity"
                      type="number"
                      min="1"
                      value={formData.buyQuantity}
                      onChange={(e) => handleInputChange('buyQuantity', parseInt(e.target.value) || 1)}
                      placeholder="Number of items to buy"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="getQuantity">Get Quantity (Free)</Label>
                    <Input
                      id="getQuantity"
                      type="number"
                      min="1"
                      value={formData.getQuantity}
                      onChange={(e) => handleInputChange('getQuantity', parseInt(e.target.value) || 1)}
                      placeholder="Number of free items"
                    />
                  </div>
                </div>
              )}

              {/* Usage Limits */}
              <div className="space-y-4">
                <h4 className="font-medium">Usage Limits (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="totalUsageLimit">Total Usage Limit</Label>
                    <Input
                      id="totalUsageLimit"
                      type="number"
                      min="0"
                      value={formData.totalUsageLimit}
                      onChange={(e) => handleInputChange('totalUsageLimit', parseInt(e.target.value) || 0)}
                      placeholder="Total uses allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perUserLimit">Per User Limit</Label>
                    <Input
                      id="perUserLimit"
                      type="number"
                      min="0"
                      value={formData.perUserLimit}
                      onChange={(e) => handleInputChange('perUserLimit', parseInt(e.target.value) || 0)}
                      placeholder="Uses per user"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perDayLimit">Per Day Limit</Label>
                    <Input
                      id="perDayLimit"
                      type="number"
                      min="0"
                      value={formData.perDayLimit}
                      onChange={(e) => handleInputChange('perDayLimit', parseInt(e.target.value) || 0)}
                      placeholder="Uses per day"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flash Sale Settings */}
        {showFlashSaleSection && (
          <Card>
            <CardHeader>
              <CardTitle>Flash Sale Settings</CardTitle>
              <CardDescription>
                Configure flash sale specific options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">Original Price (฿)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                    placeholder="Original price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price (฿)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                    placeholder="Sale price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availableQuantity">Available Quantity</Label>
                  <Input
                    id="availableQuantity"
                    type="number"
                    min="0"
                    value={formData.availableQuantity}
                    onChange={(e) => handleInputChange('availableQuantity', parseInt(e.target.value) || 0)}
                    placeholder="Quantity available"
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
                  Show countdown timer
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner Settings */}
        {showBannerSection && (
          <Card>
            <CardHeader>
              <CardTitle>Banner Settings</CardTitle>
              <CardDescription>
                Configure banner display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Image URL</Label>
                <Input
                  id="bannerImage"
                  value={formData.bannerImage}
                  onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  required={formData.type === 'promotional_banner'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bannerLink">Click Link (Optional)</Label>
                  <Input
                    id="bannerLink"
                    value={formData.bannerLink}
                    onChange={(e) => handleInputChange('bannerLink', e.target.value)}
                    placeholder="https://example.com/target-page"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerPosition">Banner Position</Label>
                  <Select 
                    value={formData.bannerPosition} 
                    onValueChange={(value) => handleInputChange('bannerPosition', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select banner position" />
                    </SelectTrigger>
                    <SelectContent>
                      {bannerPositions.map((position) => (
                        <SelectItem key={position.value} value={position.value}>
                          {position.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
