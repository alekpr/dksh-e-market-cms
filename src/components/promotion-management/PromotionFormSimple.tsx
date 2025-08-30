/**
 * Simplified Promotion Form Component
 * Basic form for creating and editing promotions
 */
import { useState, useCallback } from 'react'
import { CalendarDays, Percent, Tag, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import type { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '@/lib/api'

interface PromotionFormProps {
  promotion?: Promotion
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

// Options for selects
const promotionTypes = [
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'flash_sale', label: 'Flash Sale' },
  { value: 'promotional_banner', label: 'Promotional Banner' },
  { value: 'discount_coupon', label: 'Discount Coupon' }
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' }
]

const discountTypes = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed_amount', label: 'Fixed Amount' },
  { value: 'none', label: 'No Discount' }
]

export function PromotionForm({ promotion, onSubmit, onCancel, loading = false }: PromotionFormProps) {
  const [formData, setFormData] = useState({
    title: promotion?.title || '',
    description: promotion?.description || '',
    type: promotion?.type || 'featured_products',
    status: promotion?.status || 'draft',
    startDate: promotion?.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : '',
    endDate: promotion?.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : '',
    discountType: promotion?.discount?.type || 'fixed_amount',
    discountValue: promotion?.discount?.value || 0,
    maxDiscount: promotion?.discount?.maxDiscount || 0,
    usageTotal: promotion?.usageLimit?.total || 0,
    usagePerUser: promotion?.usageLimit?.perUser || 0,
    priority: promotion?.priority || 0,
    isActive: promotion?.isActive !== false,
    // Flash Sale fields
    flashSaleOriginalPrice: promotion?.flashSale?.originalPrice || 0,
    flashSaleSalePrice: promotion?.flashSale?.salePrice || 0,
    flashSaleAvailableQuantity: promotion?.flashSale?.availableQuantity || 0,
    // Banner fields
    bannerImage: promotion?.banner?.image || '',
    bannerLink: promotion?.banner?.link || '',
    bannerPosition: promotion?.banner?.position || 'header',
    bannerDisplayOrder: promotion?.banner?.displayOrder || 1,
    // Featured Products fields
    maxProducts: promotion?.featuredProducts?.maxProducts || 10,
    autoSelect: promotion?.featuredProducts?.autoSelect || false,
    selectionCriteria: promotion?.featuredProducts?.selectionCriteria || 'best_selling',
    // Targeting fields
    minimumOrderValue: promotion?.targeting?.minimumOrderValue || 0,
    newUsersOnly: promotion?.targeting?.newUsersOnly || false
  })

  const [metadata, setMetadata] = useState<Record<string, any>>(promotion?.metadata || {})
  const [newTag, setNewTag] = useState('')

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        discount: {
          type: formData.discountType,
          value: formData.discountValue,
          maxDiscount: formData.maxDiscount || undefined
        },
        usageLimit: formData.usageTotal > 0 || formData.usagePerUser > 0 ? {
          total: formData.usageTotal || undefined,
          perUser: formData.usagePerUser || undefined
        } : undefined,
        targeting: {
          minimumOrderValue: formData.minimumOrderValue || undefined,
          newUsersOnly: formData.newUsersOnly,
          userRoles: [],
          stores: [],
          categories: [],
          locations: []
        },
        flashSale: formData.type === 'flash_sale' ? {
          originalPrice: formData.flashSaleOriginalPrice,
          salePrice: formData.flashSaleSalePrice,
          availableQuantity: formData.flashSaleAvailableQuantity,
          soldQuantity: 0,
          notifyBeforeStart: 15,
          showCountdown: true
        } : undefined,
        banner: formData.type === 'promotional_banner' ? {
          image: formData.bannerImage,
          link: formData.bannerLink,
          position: formData.bannerPosition,
          displayOrder: formData.bannerDisplayOrder
        } : undefined,
        featuredProducts: formData.type === 'featured_products' ? {
          productIds: [],
          maxProducts: formData.maxProducts,
          autoSelect: formData.autoSelect,
          selectionCriteria: formData.selectionCriteria
        } : undefined
      }

      await onSubmit(submissionData)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to submit form')
    }
  }, [formData, tags, onSubmit])

  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }, [newTag, tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }, [tags])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {promotion ? 'Edit Promotion' : 'Create New Promotion'}
          </h1>
          <p className="text-muted-foreground">
            {promotion ? 'Update promotion details and settings' : 'Set up a new promotional campaign'}
          </p>
        </div>
      </div>

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
                <Label htmlFor="name">Promotion Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter promotion name"
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
                        {type.label}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="priority">Priority (0-100)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                  placeholder="Enter priority level"
                />
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

        {/* Discount Configuration */}
        {(formData.type === 'flash_sale' || formData.type === 'discount_coupon') && (
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

                {formData.discountType !== 'none' && (
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Discount Value {formData.discountType === 'percentage' ? '(%)' : '(฿)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      min="0"
                      max={formData.discountType === 'percentage' ? 100 : undefined}
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                      placeholder="Enter discount value"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumOrderAmount">Minimum Order Amount (฿)</Label>
                  <Input
                    id="minimumOrderAmount"
                    type="number"
                    min="0"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => handleInputChange('minimumOrderAmount', parseFloat(e.target.value) || 0)}
                    placeholder="Minimum order amount"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flash Sale Configuration */}
        {formData.type === 'flash_sale' && (
          <Card>
            <CardHeader>
              <CardTitle>Flash Sale Settings</CardTitle>
              <CardDescription>Configure flash sale specific options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="flashSalePrice">Flash Sale Price (฿)</Label>
                  <Input
                    id="flashSalePrice"
                    type="number"
                    min="0"
                    value={formData.flashSalePrice}
                    onChange={(e) => handleInputChange('flashSalePrice', parseFloat(e.target.value) || 0)}
                    placeholder="Special price for flash sale"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flashSaleQuantity">Available Quantity</Label>
                  <Input
                    id="flashSaleQuantity"
                    type="number"
                    min="0"
                    value={formData.flashSaleQuantity}
                    onChange={(e) => handleInputChange('flashSaleQuantity', parseInt(e.target.value) || 0)}
                    placeholder="Limited quantity for flash sale"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner Configuration */}
        {formData.type === 'promotional_banner' && (
          <Card>
            <CardHeader>
              <CardTitle>Banner Settings</CardTitle>
              <CardDescription>Configure banner display options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="home_slider">Home Slider</SelectItem>
                      <SelectItem value="category_top">Category Top</SelectItem>
                      <SelectItem value="product_detail">Product Detail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerUrl">Banner Link URL</Label>
                  <Input
                    id="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={(e) => handleInputChange('bannerUrl', e.target.value)}
                    placeholder="Where should the banner link to?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bannerAltText">Banner Alt Text</Label>
                <Input
                  id="bannerAltText"
                  value={formData.bannerAltText}
                  onChange={(e) => handleInputChange('bannerAltText', e.target.value)}
                  placeholder="Describe the banner for accessibility"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Usage Limits & Options
            </CardTitle>
            <CardDescription>
              Control how the promotion can be used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="usageLimit">Total Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || 0)}
                  placeholder="Leave 0 for unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
                <Input
                  id="usageLimitPerUser"
                  type="number"
                  min="0"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => handleInputChange('usageLimitPerUser', parseInt(e.target.value) || 0)}
                  placeholder="Leave 0 for unlimited"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isVisible">Visible to Users</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this promotion in public listings
                  </p>
                </div>
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => handleInputChange('isVisible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stackable">Stackable</Label>
                  <p className="text-sm text-muted-foreground">
                    Can be combined with other promotions
                  </p>
                </div>
                <Switch
                  id="stackable"
                  checked={formData.stackable}
                  onCheckedChange={(checked) => handleInputChange('stackable', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoApply">Auto Apply</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically apply when conditions are met
                  </p>
                </div>
                <Switch
                  id="autoApply"
                  checked={formData.autoApply}
                  onCheckedChange={(checked) => handleInputChange('autoApply', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requiresCouponCode">Requires Coupon Code</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must enter a code to use this promotion
                  </p>
                </div>
                <Switch
                  id="requiresCouponCode"
                  checked={formData.requiresCouponCode}
                  onCheckedChange={(checked) => handleInputChange('requiresCouponCode', checked)}
                />
              </div>

              {formData.requiresCouponCode && (
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <Input
                    id="couponCode"
                    value={formData.couponCode}
                    onChange={(e) => handleInputChange('couponCode', e.target.value)}
                    placeholder="Enter coupon code"
                    required={formData.requiresCouponCode}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to help organize and categorize this promotion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag}>Add</Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
