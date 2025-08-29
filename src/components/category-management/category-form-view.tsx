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
import { ArrowLeft, Save, X } from 'lucide-react'
import type { Category } from '@/lib/api'
import type { CategoryFormData, ViewMode } from './use-category-management'

interface CategoryFormViewProps {
  currentView: ViewMode
  formData: CategoryFormData
  flatCategories: Category[]
  loading: boolean
  selectedCategory?: Category | null
  storeName?: string
  onFormDataChange: (data: CategoryFormData) => void
  onSave: () => void
  onCancel: () => void
}

export const CategoryFormView: React.FC<CategoryFormViewProps> = ({
  currentView,
  formData,
  flatCategories,
  loading,
  selectedCategory,
  storeName,
  onFormDataChange,
  onSave,
  onCancel
}) => {
  const isEditing = currentView === 'edit'
  const title = isEditing ? 'Edit Category' : 'Add New Category'

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    if (field.startsWith('meta.')) {
      const metaField = field.replace('meta.', '')
      onFormDataChange({
        ...formData,
        meta: {
          ...formData.meta,
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

  // Get parent category options (exclude current category and its descendants if editing)
  const getParentOptions = () => {
    if (!isEditing || !selectedCategory) {
      return flatCategories.filter(cat => cat.isActive)
    }
    
    // Filter out current category and its descendants
    return flatCategories.filter(cat => {
      // Exclude current category
      if (cat._id === selectedCategory._id) return false
      
      // Exclude descendants (categories that have current category in ancestors)
      const isDescendant = cat.ancestors.some(ancestor => ancestor._id === selectedCategory._id)
      if (isDescendant) return false
      
      return cat.isActive
    })
  }

  const parentOptions = getParentOptions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update category information' : 'Create a new category'} for {storeName || 'your store'}
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="seo">SEO & Metadata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent Category</Label>
                    <Select 
                      value={formData.parent || "none"} 
                      onValueChange={(value) => handleFieldChange('parent', value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Root Category)</SelectItem>
                        {parentOptions.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {'  '.repeat(category.level)}{category.name}
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
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => handleFieldChange('image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon URL</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => handleFieldChange('icon', e.target.value)}
                      placeholder="https://example.com/icon.svg"
                      type="url"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      Lower numbers appear first
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-muted-foreground ml-2">
                      {formData.isActive ? 'Category is visible' : 'Category is hidden'}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="seo" className="space-y-6 mt-6">
                {/* SEO & Metadata */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="meta-title">SEO Title</Label>
                    <Input
                      id="meta-title"
                      value={formData.meta.title}
                      onChange={(e) => handleFieldChange('meta.title', e.target.value)}
                      placeholder="SEO title for this category"
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
                      value={formData.meta.description}
                      onChange={(e) => handleFieldChange('meta.description', e.target.value)}
                      placeholder="SEO description for this category"
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
                      value={formData.meta.keywords}
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
                {loading ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(formData.name || formData.description) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {formData.icon && (
                  <img 
                    src={formData.icon} 
                    alt="Category icon" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div>
                  <h3 className="font-semibold">{formData.name || 'Category Name'}</h3>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground">{formData.description}</p>
                  )}
                </div>
              </div>
              
              {formData.image && (
                <div className="mt-4">
                  <img 
                    src={formData.image} 
                    alt="Category preview" 
                    className="w-full max-w-md h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Status: </span>
                <span className={formData.isActive ? 'text-green-600' : 'text-gray-500'}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
                {formData.parent && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Parent: {parentOptions.find(cat => cat._id === formData.parent)?.name || 'Unknown'}</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span>Order: {formData.order}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
