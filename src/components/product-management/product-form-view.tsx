import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MultiImageUpload } from "@/components/ui/image-upload"
import { ArrowLeft, Save, X, Plus, Trash2, Package } from 'lucide-react'
import type { Product, Category, Store } from '@/lib/api'
import type { ProductFormData, ViewMode } from './use-product-management'

interface ProductFormViewProps {
  currentView: ViewMode
  formData: ProductFormData
  categories: Category[]
  stores: Store[]
  loading: boolean
  selectedProduct?: Product | null
  storeName?: string
  isAdmin: boolean
  onFormDataChange: (data: ProductFormData) => void
  onSave: () => void
  onCancel: () => void
}

export const ProductFormView: React.FC<ProductFormViewProps> = ({
  currentView,
  formData,
  categories,
  stores,
  loading,
  selectedProduct,
  storeName,
  isAdmin,
  onFormDataChange,
  onSave,
  onCancel
}) => {
  const isEditing = currentView === 'edit'
  const title = isEditing ? 'Edit Product' : 'Add New Product'

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

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    if (field.startsWith('description.')) {
      const descField = field.replace('description.', '')
      const currentDescription = formData.description || { short: '', detailed: '' }
      onFormDataChange({
        ...formData,
        description: {
          ...currentDescription,
          [descField]: value
        }
      })
    } else if (field.startsWith('meta.')) {
      const metaField = field.replace('meta.', '')
      onFormDataChange({
        ...formData,
        meta: {
          ...formData.meta!,
          [metaField]: value
        }
      })
    } else {
      onFormDataChange({
        ...formData,
        [field]: value
      })
    }
  }

  // Handle variant changes
  const handleVariantChange = (index: number, field: string, value: any) => {
    const updatedVariants = [...formData.variants]
    
    if (field.startsWith('inventory.')) {
      const invField = field.replace('inventory.', '')
      updatedVariants[index] = {
        ...updatedVariants[index],
        inventory: {
          ...updatedVariants[index].inventory,
          [invField]: value
        }
      }
    } else if (field.startsWith('weight.')) {
      const weightField = field.replace('weight.', '')
      updatedVariants[index] = {
        ...updatedVariants[index],
        weight: {
          ...(updatedVariants[index] as any).weight,
          [weightField]: value
        }
      } as any
    } else if (field.startsWith('dimensions.')) {
      const dimensionField = field.replace('dimensions.', '')
      updatedVariants[index] = {
        ...updatedVariants[index],
        dimensions: {
          ...(updatedVariants[index] as any).dimensions,
          [dimensionField]: value
        }
      } as any
    } else {
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: value
      }
    }
    
    onFormDataChange({
      ...formData,
      variants: updatedVariants
    })
  }

  // Add new variant
  const addVariant = () => {
    onFormDataChange({
      ...formData,
      variants: [
        ...formData.variants,
        {
          name: `Variant ${formData.variants.length + 1}`,
          sku: '',
          price: formData.basePrice,
          packageType: 'piece',
          packageUnit: 'ชิ้น',
          packageQuantity: 1,
          inventory: {
            quantity: 0,
            trackInventory: true,
            lowStockThreshold: 5
          },
          weight: {
            value: 0,
            unit: 'g'
          },
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'cm'
          },
          attributes: {}
        } as any
      ]
    })
  }

  // Remove variant
  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      onFormDataChange({
        ...formData,
        variants: formData.variants.filter((_, i) => i !== index)
      })
    }
  }

  // Handle category selection
  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = formData.categories.includes(categoryId)
    if (isSelected) {
      onFormDataChange({
        ...formData,
        categories: formData.categories.filter(id => id !== categoryId)
      })
    } else {
      onFormDataChange({
        ...formData,
        categories: [...formData.categories, categoryId]
      })
    }
  }

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update product information' : 'Create a new product'} for {storeName || 'your store'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing">Pricing & Variants</TabsTrigger>
                <TabsTrigger value="media">Images</TabsTrigger>
                <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  {isAdmin && (
                    <div className="space-y-2">
                      <Label htmlFor="store">Store *</Label>
                      <Select 
                        value={formData.store} 
                        onValueChange={(value) => handleFieldChange('store', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select store" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store._id} value={store._id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short-description">Short Description *</Label>
                  <Input
                    id="short-description"
                    value={formData.description?.short || ''}
                    onChange={(e) => handleFieldChange('description.short', e.target.value)}
                    placeholder="Brief product description"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detailed-description">Detailed Description</Label>
                  <Textarea
                    id="detailed-description"
                    value={formData.description?.detailed || ''}
                    onChange={(e) => handleFieldChange('description.detailed', e.target.value)}
                    placeholder="Detailed product description"
                    rows={4}
                  />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                    {categories.map((category) => (
                      <div key={category._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`category-${category._id}`}
                          checked={formData.categories.includes(category._id)}
                          onChange={() => handleCategoryToggle(category._id)}
                          className="rounded"
                        />
                        <Label 
                          htmlFor={`category-${category._id}`} 
                          className="text-sm cursor-pointer"
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.categories.map(catId => {
                        const category = categories.find(c => c._id === catId)
                        return category ? (
                          <Badge key={catId} variant="secondary">
                            {category.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleFieldChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleFieldChange('featured', checked)}
                      disabled={!isAdmin}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-6 mt-6">
                {/* Pricing & Variants */}
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (THB) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => handleFieldChange('basePrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-medium">Product Variants</Label>
                    <Button type="button" variant="outline" onClick={addVariant}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Variant
                    </Button>
                  </div>

                  {formData.variants.map((variant, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Variant {index + 1}</CardTitle>
                          {formData.variants.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Variant Name</Label>
                            <Input
                              value={variant.name}
                              onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                              placeholder="Variant name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>SKU</Label>
                            <Input
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                              placeholder="SKU-001"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Price (THB)</Label>
                            <Input
                              type="number"
                              value={variant.price}
                              onChange={(e) => handleVariantChange(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Package Type Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="space-y-2">
                            <Label className="text-blue-700 font-medium">Package Type</Label>
                            <Select 
                              value={(variant as any).packageType || 'piece'} 
                              onValueChange={(value) => handleVariantChange(index, 'packageType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select package type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="piece">Piece (ชิ้น)</SelectItem>
                                <SelectItem value="box">Box (กล่อง)</SelectItem>
                                <SelectItem value="pack">Pack (แพ็ค)</SelectItem>
                                <SelectItem value="bottle">Bottle (ขวด)</SelectItem>
                                <SelectItem value="bag">Bag (ถุง)</SelectItem>
                                <SelectItem value="case">Case (ลัง)</SelectItem>
                                <SelectItem value="carton">Carton (แคร์ตัน)</SelectItem>
                                <SelectItem value="unit">Unit (หน่วย)</SelectItem>
                                <SelectItem value="set">Set (ชุด)</SelectItem>
                                <SelectItem value="kg">Kilogram (กิโลกรัม)</SelectItem>
                                <SelectItem value="gram">Gram (กรัม)</SelectItem>
                                <SelectItem value="liter">Liter (ลิตร)</SelectItem>
                                <SelectItem value="ml">Milliliter (มิลลิลิตร)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-blue-700 font-medium">Package Unit (Display)</Label>
                            <Input
                              value={(variant as any).packageUnit || ''}
                              onChange={(e) => handleVariantChange(index, 'packageUnit', e.target.value)}
                              placeholder="e.g., ชิ้น, กล่อง, แพ็ค"
                            />
                            <p className="text-xs text-muted-foreground">Thai display name for this package</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-blue-700 font-medium">Package Quantity</Label>
                            <Input
                              type="number"
                              value={(variant as any).packageQuantity || 1}
                              onChange={(e) => handleVariantChange(index, 'packageQuantity', parseInt(e.target.value) || 1)}
                              placeholder="1"
                              min="1"
                            />
                            <p className="text-xs text-muted-foreground">Number of units in this package</p>
                          </div>
                        </div>

                        {/* Weight and Dimensions Section */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
                          <h4 className="text-green-700 font-medium">Weight & Dimensions (for Shipping Calculation)</h4>
                          
                          {/* Weight Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-green-700 font-medium">Weight</Label>
                              <Input
                                type="number"
                                value={(variant as any).weight?.value || ''}
                                onChange={(e) => handleVariantChange(index, 'weight.value', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-green-700 font-medium">Weight Unit</Label>
                              <Select 
                                value={(variant as any).weight?.unit || 'g'} 
                                onValueChange={(value) => handleVariantChange(index, 'weight.unit', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select weight unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="g">Gram (กรัม)</SelectItem>
                                  <SelectItem value="kg">Kilogram (กิโลกรัม)</SelectItem>
                                  <SelectItem value="lb">Pound (ปอนด์)</SelectItem>
                                  <SelectItem value="oz">Ounce (ออนซ์)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Dimensions Section */}
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <Label className="text-green-700 font-medium">Length (ความยาว)</Label>
                                <Input
                                  type="number"
                                  value={(variant as any).dimensions?.length || ''}
                                  onChange={(e) => handleVariantChange(index, 'dimensions.length', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-green-700 font-medium">Width (ความกว้าง)</Label>
                                <Input
                                  type="number"
                                  value={(variant as any).dimensions?.width || ''}
                                  onChange={(e) => handleVariantChange(index, 'dimensions.width', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-green-700 font-medium">Height (ความสูง)</Label>
                                <Input
                                  type="number"
                                  value={(variant as any).dimensions?.height || ''}
                                  onChange={(e) => handleVariantChange(index, 'dimensions.height', parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-green-700 font-medium">Dimension Unit</Label>
                                <Select 
                                  value={(variant as any).dimensions?.unit || 'cm'} 
                                  onValueChange={(value) => handleVariantChange(index, 'dimensions.unit', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select dimension unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="cm">Centimeter (เซนติเมตร)</SelectItem>
                                    <SelectItem value="in">Inch (นิ้ว)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <p className="text-xs text-green-600">
                              📦 ข้อมูลเหล่านี้จะใช้ในการคำนวณค่าส่งสินค้าร่วมกับระยะทางของผู้ซื้อกับร้านค้า
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={variant.inventory.quantity}
                              onChange={(e) => handleVariantChange(index, 'inventory.quantity', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Low Stock Threshold</Label>
                            <Input
                              type="number"
                              value={variant.inventory.lowStockThreshold || 5}
                              onChange={(e) => handleVariantChange(index, 'inventory.lowStockThreshold', parseInt(e.target.value) || 5)}
                              placeholder="5"
                              min="0"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              checked={variant.inventory.trackInventory}
                              onCheckedChange={(checked) => handleVariantChange(index, 'inventory.trackInventory', checked)}
                            />
                            <Label>Track Inventory</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6 mt-6">
                {/* Images */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Product Images</h3>
                  
                  <MultiImageUpload
                    images={formData.images}
                    onChange={(images) => onFormDataChange({ ...formData, images })}
                    maxImages={10}
                    maxSize={5}
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6 mt-6">
                {/* SEO & Metadata */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="meta-title">SEO Title</Label>
                    <Input
                      id="meta-title"
                      value={formData.meta?.title || ''}
                      onChange={(e) => handleFieldChange('meta.title', e.target.value)}
                      placeholder="SEO title for this product"
                      maxLength={60}
                    />
                    <p className="text-sm text-muted-foreground">
                      Recommended: 50-60 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta-description">SEO Description</Label>
                    <Textarea
                      id="meta-description"
                      value={formData.meta?.description || ''}
                      onChange={(e) => handleFieldChange('meta.description', e.target.value)}
                      placeholder="SEO description for this product"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-sm text-muted-foreground">
                      Recommended: 150-160 characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta-keywords">SEO Keywords</Label>
                    <Input
                      id="meta-keywords"
                      value={formData.meta?.keywords || ''}
                      onChange={(e) => handleFieldChange('meta.keywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-sm text-muted-foreground">
                      Separate keywords with commas
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.name.trim()}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(formData.name || formData.description?.short) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {formData.images.length > 0 && formData.images[0] ? (
                  <img 
                    src={getImageUrl(formData.images[0])} 
                    alt="Product preview" 
                    className="w-16 h-16 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{formData.name || 'Product Name'}</h3>
                  {formData.description?.short && (
                    <p className="text-sm text-muted-foreground">{formData.description.short}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-medium text-lg">{formatPrice(formData.basePrice)}</span>
                    <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                      {formData.status}
                    </Badge>
                    {formData.featured && (
                      <Badge variant="outline" className="text-yellow-600">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.categories.map(catId => {
                    const category = categories.find(c => c._id === catId)
                    return category ? (
                      <Badge key={catId} variant="outline">
                        {category.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
              
              <div className="text-sm text-muted-foreground">
                <span>Variants: {formData.variants.length}</span>
                <span className="mx-2">•</span>
                <span>Total Stock: {formData.variants.reduce((sum, v) => sum + v.inventory.quantity, 0)}</span>
                <span className="mx-2">•</span>
                <span>Images: {formData.images.filter(img => 
                  img && (typeof img === 'string' ? img.trim() : (img as any).url)
                ).length}</span>
              </div>
              
              {/* Package Types Summary */}
              {formData.variants.some(v => (v as any).packageType) && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm font-medium text-blue-700 mb-2">Package Types Available:</div>
                  <div className="flex flex-wrap gap-1">
                    {formData.variants
                      .filter(v => (v as any).packageType && (v as any).packageUnit)
                      .map((variant, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {(variant as any).packageQuantity} {(variant as any).packageUnit} • {formatPrice(variant.price)}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
