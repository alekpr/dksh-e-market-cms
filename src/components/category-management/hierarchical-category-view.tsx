import React from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Search, 
  Plus, 
  Edit, 
  Link2, 
  Unlink, 
  Store,
  TreePine,
  Building2,
  Package
} from 'lucide-react'
import { useHierarchicalCategories, type HierarchicalViewMode } from './use-hierarchical-categories'
import type { Category } from '@/lib/api'

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
    assignToMaster,
    removeFromMaster,
    resetMasterForm
  } = useHierarchicalCategories()

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
                  {category.icon && (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <i className={category.icon} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  {item.masterCategory.icon && (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <i className={item.masterCategory.icon} />
                    </div>
                  )}
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {item.stores.map((store) => (
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
                          <span className="text-sm">{category.name}</span>
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
                            >
                              <Unlink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
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
                  {category.icon && (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <i className={category.icon} />
                    </div>
                  )}
                  <div>
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
                    value={typeof category.parent === 'string' ? category.parent : category.parent?._id || ""}
                    onValueChange={(masterId) => {
                      console.log('Assigning category:', category._id, 'to master:', masterId)
                      assignToMaster(category._id, masterId)
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
      <Dialog open={showMasterForm} onOpenChange={setShowMasterForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Master Category</DialogTitle>
            <DialogDescription>
              Create a new master category that stores can organize their categories under.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={masterFormData.name}
                onChange={(e) => setMasterFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Electronics & Technology"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
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
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Input
                id="icon"
                value={masterFormData.icon}
                onChange={(e) => setMasterFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., fas fa-laptop"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowMasterForm(false)
                resetMasterForm()
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={createMasterCategory} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
