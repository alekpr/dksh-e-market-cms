import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/ui/image-upload'
import { 
  Search, 
  Plus, 
  Edit, 
  Link2, 
  Unlink, 
  Store,
  TreePine,
  Building2,
  Package,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Eye
} from 'lucide-react'
import { useHierarchicalCategories, type HierarchicalViewMode } from './use-hierarchical-categories'
import type { Category } from '@/lib/api'
import { toast } from 'sonner'
import { getPublicFileUrl } from '@/utils/fileUtils'

interface HierarchicalCategoryViewProps {
  onEditStoreCategory?: (category: Category) => void
}

export const HierarchicalCategoryView: React.FC<HierarchicalCategoryViewProps> = ({
  onEditStoreCategory
}) => {
  const {
    masterCategories,
    hierarchicalData,
    storeCategories,
    loading,
    error,
    viewMode,
    showMasterForm,
    searchTerm,
    masterFormData,
    stats,
    canManageMaster,
    setViewMode,
    setShowMasterForm,
    setSearchTerm,
    setMasterFormData,
    createMasterCategory,
    updateMasterCategory,
    deleteMasterCategory,
    assignToMaster,
    removeFromMaster,
    resetMasterForm
  } = useHierarchicalCategories()

  const [editingMaster, setEditingMaster] = useState<Category | null>(null)
  const [deletingMaster, setDeletingMaster] = useState<Category | null>(null)

  // Handle edit master category
  const handleEditMaster = (category: Category) => {
    setEditingMaster(category)
    setMasterFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      icon: category.icon || '',
      order: category.order || 0,
      meta: {
        title: category.meta?.title || '',
        description: category.meta?.description || '',
        keywords: category.meta?.keywords || ''
      }
    })
    setShowMasterForm(true)
  }

  // Handle save master category (create or update)
  const handleSaveMaster = async () => {
    if (editingMaster) {
      await updateMasterCategory(editingMaster._id)
    } else {
      await createMasterCategory()
    }
    setEditingMaster(null)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingMaster(null)
    setShowMasterForm(false)
    resetMasterForm()
  }

  // Handle delete master category
  const handleDeleteMaster = async (category: Category) => {
    if (!category._id) return
    await deleteMasterCategory(category._id)
    setDeletingMaster(null)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderMasterCategoriesView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Master Categories</h3>
          <p className="text-sm text-muted-foreground">
            Global categories that organize store-specific categories
          </p>
        </div>
        {canManageMaster && (
          <Button onClick={() => setShowMasterForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Master Category
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {masterCategories.map((category) => (
          <Card key={category._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img
                        src={getPublicFileUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', category.image ? getPublicFileUrl(category.image) : 'no image url')
                          const fallbackElement = document.createElement('div')
                          fallbackElement.className = 'w-full h-full flex items-center justify-center bg-muted text-muted-foreground'
                          fallbackElement.innerHTML = '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>'
                          e.currentTarget.parentElement!.replaceChild(fallbackElement, e.currentTarget)
                        }}
                      />
                    ) : category.icon ? (
                      <i className={category.icon} />
                    ) : (
                      <TreePine className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">
                        <TreePine className="w-3 h-3 mr-1" />
                        Master
                      </Badge>
                      {category.productCount && (
                        <Badge variant="outline">
                          <Package className="w-3 h-3 mr-1" />
                          {category.productCount.total} products
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {canManageMaster && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMaster(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Master Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{category.name}"? This action cannot be undone.
                            All store categories assigned to this master category will become orphaned.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteMaster(category)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {category.image && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getPublicFileUrl(category.image!), '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderHierarchicalView = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Hierarchical Structure</h3>
        <p className="text-sm text-muted-foreground">
          Master categories with their associated store categories
        </p>
      </div>

      <div className="grid gap-6">
        {hierarchicalData.map((item) => (
          <Card key={item.masterCategory._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                    {item.masterCategory.image ? (
                      <img
                        src={getPublicFileUrl(item.masterCategory.image)}
                        alt={item.masterCategory.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : item.masterCategory.icon ? (
                      <i className={item.masterCategory.icon} />
                    ) : (
                      <TreePine className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.masterCategory.name}</CardTitle>
                    {item.masterCategory.description && (
                      <CardDescription>{item.masterCategory.description}</CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    <Store className="w-3 h-3 mr-1" />
                    {item.storeCount} stores
                  </Badge>
                  <Badge variant="outline">
                    <Package className="w-3 h-3 mr-1" />
                    {item.totalProductCount} products
                  </Badge>
                  {canManageMaster && (
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditMaster(item.masterCategory)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {item.masterCategory.image && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getPublicFileUrl(item.masterCategory.image!), '_blank')}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.stores.length > 0 ? (
                  item.stores.map((store) => (
                    <div key={store.storeId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">{store.storeName}</span>
                        </div>
                        <Badge variant="outline">
                          {store.categories.length} categories
                        </Badge>
                      </div>
                      <div className="grid gap-2">
                        {store.categories.map((category) => (
                          <div key={category._id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center overflow-hidden">
                                {category.image ? (
                                  <img
                                    src={getPublicFileUrl(category.image)}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none'
                                    }}
                                  />
                                ) : category.icon ? (
                                  <i className={category.icon} style={{ fontSize: '10px' }} />
                                ) : (
                                  <Package className="w-3 h-3 text-muted-foreground" />
                                )}
                              </div>
                              <span className="text-sm">{category.name}</span>
                              {category.productCount && (
                                <Badge variant="outline" className="text-xs">
                                  {category.productCount.total}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {onEditStoreCategory && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditStoreCategory(category)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromMaster(category._id)}
                                title="Remove from master category"
                              >
                                <Unlink className="w-3 h-3" />
                              </Button>
                              {category.image && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(getPublicFileUrl(category.image!), '_blank')}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No store categories assigned to this master category yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {hierarchicalData.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <TreePine className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No Hierarchical Data</h4>
              <p className="text-muted-foreground mb-4">
                Create master categories and assign store categories to see the hierarchical structure.
              </p>
              {canManageMaster && (
                <Button onClick={() => setShowMasterForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Master Category
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  const renderStoreCategoriesView = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Store Categories</h3>
        <p className="text-sm text-muted-foreground">
          Manage your store's categories and their master assignments
        </p>
      </div>

      <div className="grid gap-4">
        {storeCategories.map((category) => (
          <Card key={category._id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img
                        src={getPublicFileUrl(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : category.icon ? (
                      <i className={category.icon} />
                    ) : (
                      <Package className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                    {category.parent && typeof category.parent === 'object' && (
                      <p className="text-xs text-blue-600">
                        Under: {category.parent.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {category.parent ? (
                    <Badge variant="default">
                      <Link2 className="w-3 h-3 mr-1" />
                      Assigned
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Unlink className="w-3 h-3 mr-1" />
                      Orphan
                    </Badge>
                  )}
                  {category.productCount && (
                    <Badge variant="outline">
                      <Package className="w-3 h-3 mr-1" />
                      {category.productCount.total} products
                    </Badge>
                  )}
                  
                  <Select
                    value={typeof category.parent === 'string' ? category.parent : category.parent?._id || "no-master"}
                    onValueChange={(masterId) => {
                      console.log('Assigning category:', category._id, 'to master:', masterId)
                      if (masterId === 'no-master') {
                        // Remove from master
                        removeFromMaster(category._id)
                      } else {
                        assignToMaster(category._id, masterId)
                      }
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign to master" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-master">No Master (Orphan)</SelectItem>
                      {masterCategories.map((master) => (
                        <SelectItem key={master._id} value={master._id}>
                          {master.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {onEditStoreCategory && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditStoreCategory(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}

                  {category.image && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getPublicFileUrl(category.image!), '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {storeCategories.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No Store Categories</h4>
              <p className="text-muted-foreground mb-4">
                You haven't created any store categories yet.
              </p>
              {onEditStoreCategory && (
                <Button onClick={() => {
                  // Navigate to category creation page or trigger creation modal
                  toast.info('Please use the Category Management page to create new categories')
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalMasters}</div>
            <div className="text-sm text-muted-foreground">Master Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.assignedCategories}</div>
            <div className="text-sm text-muted-foreground">Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.orphanCategories}</div>
            <div className="text-sm text-muted-foreground">Orphan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalStoreCategories}</div>
            <div className="text-sm text-muted-foreground">Store Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalProducts}</div>
            <div className="text-sm text-muted-foreground">Total Products</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as HierarchicalViewMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarchical">Hierarchical View</TabsTrigger>
          <TabsTrigger value="master">Master Categories</TabsTrigger>
          <TabsTrigger value="store">Store Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchical" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading hierarchical data...</div>
          ) : (
            renderHierarchicalView()
          )}
        </TabsContent>

        <TabsContent value="master" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading master categories...</div>
          ) : (
            renderMasterCategoriesView()
          )}
        </TabsContent>

        <TabsContent value="store" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading store categories...</div>
          ) : (
            renderStoreCategoriesView()
          )}
        </TabsContent>
      </Tabs>

      {/* Master Category Form Dialog */}
      <Dialog open={showMasterForm} onOpenChange={(open) => {
        if (!open) handleCancelEdit()
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMaster ? 'Edit Master Category' : 'Create Master Category'}
            </DialogTitle>
            <DialogDescription>
              {editingMaster 
                ? 'Update the master category details below.'
                : 'Create a new master category that stores can organize their categories under.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Basic Information</h4>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={masterFormData.name}
                  onChange={(e) => setMasterFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  placeholder="e.g., Electronics & Technology"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={masterFormData.description}
                  onChange={(e) => setMasterFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="Brief description of the category"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right">
                  Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  value={masterFormData.order}
                  onChange={(e) => setMasterFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="col-span-3"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Visual Elements */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Visual Elements</h4>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Category Image
                </Label>
                <div className="col-span-3">
                  <ImageUpload
                    value={masterFormData.image}
                    onChange={(value) => setMasterFormData(prev => ({ ...prev, image: value || '' }))}
                    onRemove={() => setMasterFormData(prev => ({ ...prev, image: '' }))}
                    label=""
                    maxSize={5}
                    preview={true}
                    className=""
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="icon" className="text-right">
                  Icon Class
                </Label>
                <Input
                  id="icon"
                  value={masterFormData.icon}
                  onChange={(e) => setMasterFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="col-span-3"
                  placeholder="e.g., fas fa-laptop, lucide:laptop"
                />
              </div>
            </div>

            {/* SEO Meta */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">SEO Meta (Optional)</h4>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metaTitle" className="text-right">
                  Meta Title
                </Label>
                <Input
                  id="metaTitle"
                  value={masterFormData.meta.title}
                  onChange={(e) => setMasterFormData(prev => ({ 
                    ...prev, 
                    meta: { ...prev.meta, title: e.target.value }
                  }))}
                  className="col-span-3"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="metaDescription" className="text-right pt-2">
                  Meta Description
                </Label>
                <Textarea
                  id="metaDescription"
                  value={masterFormData.meta.description}
                  onChange={(e) => setMasterFormData(prev => ({ 
                    ...prev, 
                    meta: { ...prev.meta, description: e.target.value }
                  }))}
                  className="col-span-3"
                  placeholder="SEO description for search engines"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metaKeywords" className="text-right">
                  Meta Keywords
                </Label>
                <Input
                  id="metaKeywords"
                  value={masterFormData.meta.keywords}
                  onChange={(e) => setMasterFormData(prev => ({ 
                    ...prev, 
                    meta: { ...prev.meta, keywords: e.target.value }
                  }))}
                  className="col-span-3"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveMaster} 
              disabled={loading || !masterFormData.name.trim()}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  {editingMaster ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingMaster ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
