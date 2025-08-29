import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GenericDataTable } from "../store-management/generic-data-table"
import { Plus, MoreHorizontal, Edit, Eye, Trash, Search, X, Folder, FolderOpen, Star, StarOff } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import type { ColumnDef } from '@tanstack/react-table'

interface CategoryListViewProps {
  categories: Category[]
  flatCategories: Category[]
  loading: boolean
  searchTerm: string
  filterStatus: string
  viewMode: 'tree' | 'table'
  categoryStats: {
    total: number
    active: number
    inactive: number
    withProducts: number
    featured: number
  }
  storeName?: string
  onAdd: () => void
  onView: (category: Category) => void
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onToggleStatus: (category: Category) => void
  onSearch: (query: string) => void
  onFilterStatus: (status: string) => void
  onViewModeChange: (mode: 'tree' | 'table') => void
}

export const CategoryListView: React.FC<CategoryListViewProps> = ({
  categories,
  flatCategories,
  loading,
  searchTerm,
  filterStatus,
  viewMode,
  categoryStats,
  storeName,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onSearch,
  onFilterStatus,
  onViewModeChange
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Toggle expanded category in tree view
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Render tree item for tree view
  const renderTreeItem = (category: Category, level: number = 0) => {
    const isExpanded = expandedCategories.has(category._id)
    const hasChildren = category.children && category.children.length > 0
    const isFeatured = category.featuredOrder && category.featuredOrder > 0

    return (
      <div key={category._id} className="w-full">
        <div 
          className="flex items-center gap-2 p-3 hover:bg-muted/50 rounded-lg group border-b border-border/50"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={() => toggleExpanded(category._id)}
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500" />
              )}
            </Button>
          ) : (
            <div className="w-6 flex justify-center">
              <Folder className="w-4 h-4 text-gray-400" />
            </div>
          )}
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{category.name}</span>
                {isFeatured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              {category.description && (
                <span className="text-sm text-muted-foreground truncate">
                  {category.description}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? "Active" : "Inactive"}
              </Badge>
              
              {category.productCount && (
                <Badge variant="outline">
                  {category.productCount.total} products
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(category)}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              title="Edit category"
            >
              <Edit className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(category)}
              title={category.isActive ? "Deactivate" : "Activate"}
            >
              {category.isActive ? (
                <StarOff className="w-4 h-4" />
              ) : (
                <Star className="w-4 h-4" />
              )}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive" title="Delete category">
                  <Trash className="w-4 h-4" />
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
        
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Table columns for table view
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Category Name",
      cell: ({ row }) => {
        const category = row.original
        const isFeatured = category.featuredOrder && category.featuredOrder > 0
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{category.name}</span>
              {isFeatured && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            {category.description && (
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {category.description}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "parent",
      header: "Parent",
      cell: ({ row }) => {
        const category = row.original
        const parentCategory = typeof category.parent === 'string' 
          ? flatCategories.find(cat => cat._id === category.parent)
          : category.parent
        
        return parentCategory ? (
          <Badge variant="outline">{parentCategory.name}</Badge>
        ) : (
          <span className="text-muted-foreground">Root</span>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "productCount",
      header: "Products",
      cell: ({ row }) => {
        const productCount = row.original.productCount
        return productCount ? (
          <Badge variant="outline">
            {productCount.total}
          </Badge>
        ) : (
          <span className="text-muted-foreground">0</span>
        )
      },
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => {
        return <span className="text-sm">{row.getValue("order")}</span>
      },
    },
    {
      accessorKey: "featuredOrder",
      header: "Featured",
      cell: ({ row }) => {
        const featuredOrder = row.getValue("featuredOrder") as number
        return featuredOrder ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm">{featuredOrder}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(category)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(category)}>
                {category.isActive ? (
                  <>
                    <StarOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{category.name}"? This action cannot be undone.
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
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading categories...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayCategories = viewMode === 'tree' ? categories : flatCategories

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">
            Manage categories for {storeName || 'your store'}
          </p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.withProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8 w-[300px]"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => onSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Select value={filterStatus} onValueChange={onFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={(value: string) => onViewModeChange(value as 'tree' | 'table')}>
          <TabsList>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Categories Display */}
      <Card>
        <CardContent className="p-0">
          {displayCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No categories match your search." : "Get started by creating your first category."}
              </p>
              {!searchTerm && (
                <Button onClick={onAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Category
                </Button>
              )}
            </div>
          ) : viewMode === 'tree' ? (
            <div className="p-4">
              <div className="space-y-1">
                {displayCategories.map(category => renderTreeItem(category))}
              </div>
            </div>
          ) : (
            <GenericDataTable 
              columns={columns} 
              data={displayCategories} 
              searchKey="name"
              searchPlaceholder="Search categories..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
