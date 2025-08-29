import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Trash, Star, Calendar, Folder, Package, Eye, EyeOff } from 'lucide-react'
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
} from "@/components/ui/alert-dialog"
import type { Category } from '@/lib/api'

interface CategoryDetailViewProps {
  category: Category
  flatCategories: Category[]
  storeName?: string
  onEdit: () => void
  onDelete: (id: string) => void
  onToggleStatus: (category: Category) => void
  onBack: () => void
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  category,
  flatCategories,
  storeName,
  onEdit,
  onDelete,
  onToggleStatus,
  onBack
}) => {
  const isFeatured = category.featuredOrder && category.featuredOrder > 0
  const hasChildren = category.children && category.children.length > 0
  const parentCategory = typeof category.parent === 'string' 
    ? flatCategories.find(cat => cat._id === category.parent)
    : category.parent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">
              Category details for {storeName || 'your store'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => onToggleStatus(category)}>
            {category.isActive ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Category
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{category.name}"? This action cannot be undone.
                  {hasChildren && " All subcategories will also be affected."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(category._id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {category.icon && (
                  <img 
                    src={category.icon} 
                    alt="Category icon" 
                    className="w-12 h-12 object-contain rounded-lg border p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-semibold">{category.name}</h2>
                    {isFeatured && (
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {isFeatured && (
                      <Badge variant="outline">
                        Featured #{category.featuredOrder}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {category.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              )}

              {category.image && (
                <div>
                  <h3 className="font-medium mb-2">Category Image</h3>
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hierarchy Information */}
          <Card>
            <CardHeader>
              <CardTitle>Hierarchy & Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Level</h3>
                  <p className="text-muted-foreground">Level {category.level}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Display Order</h3>
                  <p className="text-muted-foreground">{category.order}</p>
                </div>
              </div>

              {parentCategory && (
                <div>
                  <h3 className="font-medium mb-2">Parent Category</h3>
                  <Badge variant="outline">{parentCategory.name}</Badge>
                </div>
              )}

              {category.ancestors && category.ancestors.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Category Path</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {category.ancestors.map((ancestor, index) => (
                      <React.Fragment key={ancestor._id}>
                        <Badge variant="outline">{ancestor.name}</Badge>
                        {index < category.ancestors.length - 1 && (
                          <span className="text-muted-foreground">→</span>
                        )}
                      </React.Fragment>
                    ))}
                    <span className="text-muted-foreground">→</span>
                    <Badge>{category.name}</Badge>
                  </div>
                </div>
              )}

              {hasChildren && (
                <div>
                  <h3 className="font-medium mb-2">Subcategories ({category.children!.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.children!.map((child) => (
                      <Badge key={child._id} variant="outline">
                        {child.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Information */}
          {category.meta && (category.meta.title || category.meta.description || category.meta.keywords) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.meta.title && (
                  <div>
                    <h3 className="font-medium mb-2">SEO Title</h3>
                    <p className="text-muted-foreground">{category.meta.title}</p>
                  </div>
                )}

                {category.meta.description && (
                  <div>
                    <h3 className="font-medium mb-2">SEO Description</h3>
                    <p className="text-muted-foreground">{category.meta.description}</p>
                  </div>
                )}

                {category.meta.keywords && (
                  <div>
                    <h3 className="font-medium mb-2">SEO Keywords</h3>
                    <div className="flex flex-wrap gap-1">
                      {category.meta.keywords.split(',').map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.productCount ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {category.productCount.total}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Direct Products:</span>
                      <span className="text-sm font-medium">{category.productCount.direct}</span>
                    </div>
                    {category.productCount.children !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm">From Subcategories:</span>
                        <span className="text-sm font-medium">{category.productCount.children}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products in this category</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-sm">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(category.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm">Last Updated</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(category.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={onEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Category
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onToggleStatus(category)}
              >
                {category.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Deactivate Category
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activate Category
                  </>
                )}
              </Button>
              
              <Separator />
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Category
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{category.name}"? This action cannot be undone.
                      {hasChildren && " All subcategories will also be affected."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(category._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
