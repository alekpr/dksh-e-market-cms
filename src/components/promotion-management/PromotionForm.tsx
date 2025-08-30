/**
 * Promotion Form Component
 * Comprehensive form for creating and editing promotions
 */
import { useState, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CalendarDays, Percent, Tag, Clock, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '@/lib/api'

// Form validation schema
const promotionFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  type: z.enum(['featured_products', 'flash_sale', 'banner', 'coupon']),
  status: z.enum(['draft', 'active', 'paused', 'expired']),
  
  // Date fields
  startDate: z.date({
    required_error: 'Start date is required'
  }),
  endDate: z.date({
    required_error: 'End date is required'
  }),
  
  // Discount configuration
  discountType: z.enum(['percentage', 'fixed', 'none']).optional(),
  discountValue: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  
  // Usage limits
  usageLimit: z.number().min(0).optional(),
  usageLimitPerUser: z.number().min(0).optional(),
  
  // Minimum requirements
  minimumOrderAmount: z.number().min(0).optional(),
  minimumQuantity: z.number().min(0).optional(),
  
  // Media
  bannerImage: z.string().optional(),
  thumbnailImage: z.string().optional(),
  
  // Targeting
  targetCategories: z.array(z.string()).optional(),
  targetProducts: z.array(z.string()).optional(),
  targetStores: z.array(z.string()).optional(),
  targetUserGroups: z.array(z.string()).optional(),
  
  // SEO and visibility
  tags: z.array(z.string()).optional(),
  priority: z.number().min(0).max(100).default(0),
  isVisible: z.boolean().default(true),
  
  // Additional settings
  stackable: z.boolean().default(false),
  autoApply: z.boolean().default(false),
  requiresCouponCode: z.boolean().default(false),
  couponCode: z.string().optional(),
  
  // Flash sale specific
  flashSalePrice: z.number().min(0).optional(),
  flashSaleQuantity: z.number().min(0).optional(),
  
  // Banner specific
  bannerPosition: z.enum(['top', 'middle', 'bottom', 'sidebar']).optional(),
  bannerUrl: z.string().optional(),
  bannerAltText: z.string().optional()
}).refine((data) => {
  return data.endDate > data.startDate
}, {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine((data) => {
  if (data.requiresCouponCode && !data.couponCode) {
    return false
  }
  return true
}, {
  message: "Coupon code is required when 'Requires Coupon Code' is enabled",
  path: ["couponCode"]
})

type PromotionFormData = z.infer<typeof promotionFormSchema>

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
  { value: 'banner', label: 'Promotional Banner' },
  { value: 'coupon', label: 'Discount Coupon' }
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' }
]

const discountTypes = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'none', label: 'No Discount' }
]

const bannerPositions = [
  { value: 'top', label: 'Top of Page' },
  { value: 'middle', label: 'Middle Section' },
  { value: 'bottom', label: 'Bottom Section' },
  { value: 'sidebar', label: 'Sidebar' }
]

export function PromotionForm({ promotion, onSubmit, onCancel, loading = false }: PromotionFormProps) {
  const [tags, setTags] = useState<string[]>(promotion?.tags || [])
  const [newTag, setNewTag] = useState('')

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      name: promotion?.name || '',
      description: promotion?.description || '',
      type: promotion?.type || 'featured_products',
      status: promotion?.status || 'draft',
      startDate: promotion?.startDate ? new Date(promotion.startDate) : new Date(),
      endDate: promotion?.endDate ? new Date(promotion.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      discountType: promotion?.discount?.type || 'none',
      discountValue: promotion?.discount?.value || 0,
      maxDiscountAmount: promotion?.discount?.maxAmount || undefined,
      usageLimit: promotion?.usageLimit || undefined,
      usageLimitPerUser: promotion?.usageLimitPerUser || undefined,
      minimumOrderAmount: promotion?.minimumOrderAmount || undefined,
      minimumQuantity: promotion?.minimumQuantity || undefined,
      bannerImage: promotion?.media?.bannerImage || '',
      thumbnailImage: promotion?.media?.thumbnailImage || '',
      targetCategories: promotion?.targeting?.categories || [],
      targetProducts: promotion?.targeting?.products || [],
      targetStores: promotion?.targeting?.stores || [],
      targetUserGroups: promotion?.targeting?.userGroups || [],
      tags: promotion?.tags || [],
      priority: promotion?.priority || 0,
      isVisible: promotion?.isVisible !== false,
      stackable: promotion?.stackable || false,
      autoApply: promotion?.autoApply || false,
      requiresCouponCode: promotion?.requiresCouponCode || false,
      couponCode: promotion?.couponCode || '',
      flashSalePrice: promotion?.flashSale?.price || undefined,
      flashSaleQuantity: promotion?.flashSale?.quantity || undefined,
      bannerPosition: promotion?.banner?.position || 'top',
      bannerUrl: promotion?.banner?.url || '',
      bannerAltText: promotion?.banner?.altText || ''
    }
  })

  const watchedType = form.watch('type')
  const watchedDiscountType = form.watch('discountType')
  const watchedRequiresCouponCode = form.watch('requiresCouponCode')

  // Handle form submission
  const handleSubmit = useCallback(async (data: PromotionFormData) => {
    try {
      const formattedData: CreatePromotionRequest | UpdatePromotionRequest = {
        name: data.name,
        description: data.description,
        type: data.type,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        discount: data.discountType && data.discountType !== 'none' ? {
          type: data.discountType,
          value: data.discountValue || 0,
          maxAmount: data.maxDiscountAmount
        } : undefined,
        usageLimit: data.usageLimit,
        usageLimitPerUser: data.usageLimitPerUser,
        minimumOrderAmount: data.minimumOrderAmount,
        minimumQuantity: data.minimumQuantity,
        media: {
          bannerImage: data.bannerImage,
          thumbnailImage: data.thumbnailImage
        },
        targeting: {
          categories: data.targetCategories || [],
          products: data.targetProducts || [],
          stores: data.targetStores || [],
          userGroups: data.targetUserGroups || []
        },
        tags: tags,
        priority: data.priority,
        isVisible: data.isVisible,
        stackable: data.stackable,
        autoApply: data.autoApply,
        requiresCouponCode: data.requiresCouponCode,
        couponCode: data.requiresCouponCode ? data.couponCode : undefined,
        flashSale: data.type === 'flash_sale' ? {
          price: data.flashSalePrice || 0,
          quantity: data.flashSaleQuantity || 0
        } : undefined,
        banner: data.type === 'banner' ? {
          position: data.bannerPosition || 'top',
          url: data.bannerUrl,
          altText: data.bannerAltText
        } : undefined
      }

      await onSubmit(formattedData)
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Failed to submit form')
    }
  }, [tags, onSubmit])

  // Handle tag management
  const addTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()]
      setTags(updatedTags)
      form.setValue('tags', updatedTags)
      setNewTag('')
    }
  }, [newTag, tags, form])

  const removeTag = useCallback((tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove)
    setTags(updatedTags)
    form.setValue('tags', updatedTags)
  }, [tags, form])

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter promotion name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select promotion type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {promotionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your promotion..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (0-100)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Enter priority level"
                          min={0}
                          max={100}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Higher priority promotions are displayed first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          {(watchedType === 'flash_sale' || watchedType === 'coupon') && (
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select discount type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {discountTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedDiscountType && watchedDiscountType !== 'none' && (
                    <FormField
                      control={form.control}
                      name="discountValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Discount Value {watchedDiscountType === 'percentage' ? '(%)' : '(฿)'}
                          </FormLabel>
                          <FormControl>
                            <NumberInput 
                              placeholder="Enter discount value"
                              min={0}
                              max={watchedDiscountType === 'percentage' ? 100 : undefined}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchedDiscountType === 'percentage' && (
                    <FormField
                      control={form.control}
                      name="maxDiscountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Discount (฿)</FormLabel>
                          <FormControl>
                            <NumberInput 
                              placeholder="Maximum discount amount"
                              min={0}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum discount amount for percentage discounts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="minimumOrderAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Amount (฿)</FormLabel>
                        <FormControl>
                          <NumberInput 
                            placeholder="Minimum order amount"
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minimumQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Quantity</FormLabel>
                        <FormControl>
                          <NumberInput 
                            placeholder="Minimum quantity required"
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                Usage Limits
              </CardTitle>
              <CardDescription>
                Control how many times this promotion can be used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Usage Limit</FormLabel>
                      <FormControl>
                        <NumberInput 
                          placeholder="Total number of uses allowed"
                          min={0}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited uses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usageLimitPerUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usage Limit Per User</FormLabel>
                      <FormControl>
                        <NumberInput 
                          placeholder="Uses per user"
                          min={0}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum uses per individual user
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Continue in next part... */}
