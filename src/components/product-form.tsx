'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'

import { type Product, type CreateProductRequest, type UpdateProductRequest, type Category, type Store, type ProductVariant } from '@/lib/api'

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  attributes: z.record(z.string()).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  inventory: z.object({
    quantity: z.number().min(0, 'Quantity must be non-negative'),
    trackInventory: z.boolean().default(true),
    lowStockThreshold: z.number().min(0).optional(),
  }),
  isDefault: z.boolean().default(false),
  images: z.array(z.string()).optional(),
})

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
  description: z.object({
    short: z.string().min(1, 'Short description is required'),
    detailed: z.string().min(1, 'Detailed description is required'),
  }),
  store: z.string().min(1, 'Store is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  status: z.enum(['draft', 'active']).default('draft'),
  images: z.array(z.string()).optional(),
  hasVariants: z.boolean().default(false),
  variants: z.array(variantSchema).optional(),
})

interface ProductFormProps {
  product?: Product
  categories: Category[]
  stores: Store[]
  currentUserStore?: string
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>
  onCancel: () => void
}

export function ProductForm({
  product,
  categories,
  stores,
  currentUserStore,
  onSubmit,
  onCancel
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>(product?.images || [])
  const [newImageUrl, setNewImageUrl] = useState('')

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      basePrice: product?.basePrice || 0,
      description: {
        short: product?.description?.short || '',
        detailed: product?.description?.detailed || '',
      },
      store: product ? (typeof product.store === 'string' ? product.store : product.store._id) : currentUserStore || '',
      categories: product ? 
        (Array.isArray(product.categories) && typeof product.categories[0] === 'string' 
          ? product.categories as string[]
          : (product.categories as Category[]).map(c => c._id)
        ) : [],
      status: product?.status || 'draft',
      images: product?.images || [],
      hasVariants: product?.hasVariants || false,
      variants: product?.variants || [
        {
          name: 'Default',
          price: product?.basePrice || 0,
          attributes: {},
          inventory: {
            quantity: 0,
            trackInventory: true,
          },
          isDefault: true,
        }
      ],
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const watchHasVariants = form.watch('hasVariants')
  const watchBasePrice = form.watch('basePrice')

  // Update variant prices when base price changes
  useEffect(() => {
    const variants = form.getValues('variants')
    if (variants && variants.length > 0 && !watchHasVariants) {
      form.setValue('variants.0.price', watchBasePrice)
    }
  }, [watchBasePrice, watchHasVariants, form])

  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      setIsLoading(true)
      setError(null)

      // Include images
      const submitData = {
        ...data,
        images: selectedImages,
      }

      await onSubmit(submitData as CreateProductRequest | UpdateProductRequest)
    } catch (err) {
      console.error('Error submitting product:', err)
      setError('Failed to save product. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setSelectedImages([...selectedImages, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    appendVariant({
      name: '',
      price: watchBasePrice,
      attributes: {},
      inventory: {
        quantity: 0,
        trackInventory: true,
      },
      isDefault: false,
    })
  }

  const addAttributeToVariant = (variantIndex: number, key: string, value: string) => {
    const currentAttributes = form.getValues(`variants.${variantIndex}.attributes`) || {}
    form.setValue(`variants.${variantIndex}.attributes`, {
      ...currentAttributes,
      [key]: value,
    })
  }

  const removeAttributeFromVariant = (variantIndex: number, key: string) => {
    const currentAttributes = form.getValues(`variants.${variantIndex}.attributes`) || {}
    const newAttributes = { ...currentAttributes }
    delete newAttributes[key]
    form.setValue(`variants.${variantIndex}.attributes`, newAttributes)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (THB)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description.short"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Brief description for product listings"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description.detailed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detailed product description with specifications"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Store and Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Store & Categories</CardTitle>
            <CardDescription>
              Assign the product to a store and categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!currentUserStore && (
              <FormField
                control={form.control}
                name="store"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select store" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store._id} value={store._id}>
                            {store.businessName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormDescription>
                    Select one or more categories for this product
                  </FormDescription>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {categories.map((category) => (
                      <div key={category._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={category._id}
                          checked={field.value.includes(category._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange([...field.value, category._id])
                            } else {
                              field.onChange(field.value.filter(id => id !== category._id))
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={category._id} className="text-sm">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Add images to showcase your product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1"
              />
              <Button type="button" onClick={addImage} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+'
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Product Variants</CardTitle>
            <CardDescription>
              Configure product variants like size, color, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hasVariants"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Variants</FormLabel>
                    <FormDescription>
                      Create multiple variants of this product with different attributes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {variantFields.map((variant, index) => (
              <Card key={variant.id} className="border-dashed">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Variant {index + 1}
                      {!watchHasVariants && ' (Default)'}
                    </CardTitle>
                    {watchHasVariants && variantFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Variant Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={watchHasVariants ? "e.g., Red/Large" : "Default"}
                              disabled={!watchHasVariants}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (THB)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              disabled={!watchHasVariants}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Product SKU" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variants.${index}.barcode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barcode (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Product barcode" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`variants.${index}.inventory.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {watchHasVariants && (
                    <div className="space-y-2">
                      <Label>Attributes</Label>
                      <div className="space-y-2">
                        {Object.entries(form.getValues(`variants.${index}.attributes`) || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Input value={key} readOnly className="w-32" />
                            <Input value={value} readOnly className="flex-1" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttributeFromVariant(index, key)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="Attribute name"
                            id={`attr-key-${index}`}
                            className="w-32"
                          />
                          <Input
                            placeholder="Attribute value"
                            id={`attr-value-${index}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const keyInput = document.getElementById(`attr-key-${index}`) as HTMLInputElement
                              const valueInput = document.getElementById(`attr-value-${index}`) as HTMLInputElement
                              if (keyInput.value && valueInput.value) {
                                addAttributeToVariant(index, keyInput.value, valueInput.value)
                                keyInput.value = ''
                                valueInput.value = ''
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {watchHasVariants && (
              <Button type="button" variant="outline" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
