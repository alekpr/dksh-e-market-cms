import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save, ArrowLeft } from 'lucide-react'

import { type Product, type CreateProductRequest, type UpdateProductRequest, type Category, type Store } from '@/lib/api'

interface ProductFormProps {
  product?: Product
  stores: Store[]
  categories: Category[]
  onSave: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  stores,
  categories,
  onSave,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    basePrice: product?.basePrice || 0,
    shortDescription: typeof product?.description === 'object' ? product.description.short : '',
    detailedDescription: typeof product?.description === 'object' ? product.description.detailed : '',
    store: typeof product?.store === 'string' ? product.store : product?.store?.id || '',
    categories: product?.categories?.map(cat => typeof cat === 'string' ? cat : cat._id) || [],
    status: (product?.status === 'archived' || product?.status === 'deleted') ? 'draft' : (product?.status || 'draft'),
    images: product?.images || [],
    hasVariants: product?.hasVariants || false,
    variants: product?.variants || [{
      name: 'Default',
      price: product?.basePrice || 0,
      attributes: {},
      inventory: {
        quantity: 0,
        trackInventory: true,
        lowStockThreshold: 5
      },
      isDefault: true,
      images: []
    }]
  })

  const [newImage, setNewImage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      name: formData.name,
      basePrice: formData.basePrice,
      description: {
        short: formData.shortDescription,
        detailed: formData.detailedDescription
      },
      store: formData.store,
      categories: formData.categories,
      status: formData.status as 'active' | 'draft',
      images: formData.images,
      hasVariants: formData.hasVariants,
      variants: formData.variants.map(v => ({
        name: v.name,
        price: v.price,
        attributes: v.attributes || {},
        sku: 'sku' in v ? v.sku : undefined,
        barcode: 'barcode' in v ? v.barcode : undefined,
        inventory: v.inventory,
        isDefault: v.isDefault,
        images: v.images || []
      }))
    }

    await onSave(submitData)
  }

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }))
      setNewImage('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {product ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-muted-foreground">
            {product ? 'Update product information' : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief product description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <Textarea
                id="detailedDescription"
                value={formData.detailedDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, detailedDescription: e.target.value }))}
                placeholder="Detailed product information"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Store & Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Store & Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store">Store *</Label>
              <Select value={formData.store} onValueChange={(value) => setFormData(prev => ({ ...prev, store: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
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

            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category._id}
                    variant={formData.categories.includes(category._id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category._id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="Enter image URL"
              />
              <Button type="button" onClick={addImage}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <img src={image} alt="" className="w-12 h-12 object-cover rounded" />
                    <span className="flex-1 truncate">{image}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Product Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'draft') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
