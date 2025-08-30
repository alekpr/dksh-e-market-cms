import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GenericDataTable } from "../store-management/generic-data-table"
import { Plus, Search, X, Package, Star, MoreHorizontal, Edit, Eye, Trash, TrendingUp } from 'lucide-react'
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
import { Switch } from "@/components/ui/switch"
import type { Product, Category, Store } from '@/lib/api'
import type { ColumnDef } from '@tanstack/react-table'
import type { ProductStats } from './use-product-management'

interface ProductListViewProps {
  products: Product[]
  categories: Category[]
  stores: Store[]
  loading: boolean
  searchTerm: string
  filterStatus: string
  filterCategory: string
  filterStore: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalPages: number
  productStats: ProductStats
  storeName?: string
  isAdmin: boolean
  onAdd: () => void
  onView: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleStatus: (product: Product) => void
  onToggleFeatured: (product: Product) => void
  onSearch: (query: string) => void
  onFilterStatusChange: (status: string) => void
  onFilterCategoryChange: (category: string) => void
  onFilterStoreChange: (store: string) => void
  onSortChange: (field: string, order: 'asc' | 'desc') => void
  onPageChange: (page: number) => void
}

export const ProductListView: React.FC<ProductListViewProps> = ({
  products,
  categories,
  stores,
  loading,
  searchTerm,
  filterStatus,
  filterCategory,
  filterStore,
  sortBy,
  sortOrder,
  currentPage,
  totalPages,
  productStats,
  storeName,
  isAdmin,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onSearch,
  onFilterStatusChange,
  onFilterCategoryChange,
  onFilterStoreChange,
  onSortChange,
  onPageChange
}) => {
  
  // Get status badge variant
  const getStatusBadge = (status: Product['status']): "default" | "secondary" | "outline" | "destructive" => {
    const variants = {
      active: 'default' as const,
      draft: 'secondary' as const,
      pending: 'outline' as const,
      archived: 'destructive' as const,
      deleted: 'destructive' as const,
    }
    return variants[status] || 'secondary'
  }

  // Get store name helper
  const getStoreName = (store: Store | string) => {
    if (typeof store === 'string') {
      const storeObj = stores.find(s => s._id === store)
      return storeObj?.name || 'Unknown Store'
    }
    return store.name
  }

  // Get category names helper
  const getCategoryNames = (categories: Category[] | string[]) => {
    if (!categories || categories.length === 0) return 'No categories'
    
    if (typeof categories[0] === 'string') {
      return categories.map(catId => {
        const category = categories.find((c: any) => c._id === catId)
        return category ? (category as any).name : 'Unknown'
      }).join(', ')
    }
    
    return (categories as Category[]).map(c => c.name).join(', ')
  }

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price)
  }

  // Get inventory status helper
  const getInventoryStatus = (product: Product) => {
    const totalStock = product.variants.reduce((sum, v) => sum + v.inventory.quantity, 0)
    if (totalStock === 0) return { status: 'Out of Stock', color: 'text-red-600' }
    if (totalStock < 10) return { status: 'Low Stock', color: 'text-yellow-600' }
    return { status: 'In Stock', color: 'text-green-600' }
  }

  // Table columns for table view
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center space-x-3">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div>
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-muted-foreground">
                {typeof product.description === 'string' 
                  ? (product.description as string).substring(0, 60) + ((product.description as string).length > 60 ? '...' : '')
                  : (product.description as any)?.short || 'No description'}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "categories",
      header: "Category",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="text-sm">
            {product.category 
              ? (typeof product.category === 'string' ? product.category : (product.category as any)?.name || 'Unknown')
              : (product.categories ? getCategoryNames(product.categories) : 'No category')}
          </div>
        )
      },
    },
    ...(isAdmin ? [{
      accessorKey: "store",
      header: "Store",
      cell: ({ row }: { row: any }) => {
        const product = row.original
        return (
          <div className="text-sm">
            {getStoreName(product.store)}
          </div>
        )
      },
    }] : []),
    {
      accessorKey: "basePrice",
      header: "Price",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="font-medium">
            {formatPrice(product.basePrice)}
          </div>
        )
      },
    },
    {
      accessorKey: "inventory",
      header: "Stock",
      cell: ({ row }) => {
        const product = row.original
        const inventoryStatus = getInventoryStatus(product)
        return (
          <div>
            <div className={`text-sm font-medium ${inventoryStatus.color}`}>
              {inventoryStatus.status}
            </div>
            <div className="text-xs text-muted-foreground">
              {product.variants.reduce((sum, v) => sum + v.inventory.quantity, 0)} units
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Product['status']
        return (
          <Badge variant={getStatusBadge(status)}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => {
        const product = row.original
        return isAdmin ? (
          <Switch
            checked={product.featured}
            onCheckedChange={() => onToggleFeatured(product)}
          />
        ) : (
          <div className="flex items-center">
            {product.featured && <Star className="h-4 w-4 text-yellow-500" />}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(product)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                {product.status === 'active' ? 'Deactivate' : 'Activate'}
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
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{product.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(product._id)}
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
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all products across the platform' : `Manage products for ${storeName}`}
          </p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{productStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{productStats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{productStats.archived}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{productStats.outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{productStats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={filterCategory} onValueChange={onFilterCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label>Store</Label>
              <Select value={filterStore} onValueChange={onFilterStoreChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store._id} value={store._id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select 
              value={`${sortBy}-${sortOrder}`} 
              onValueChange={(value) => {
                const [field, order] = value.split('-')
                onSortChange(field, order as 'asc' | 'desc')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt-desc">Last Updated</SelectItem>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="basePrice-asc">Price Low-High</SelectItem>
                <SelectItem value="basePrice-desc">Price High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No products match your search." : "Get started by creating your first product."}
              </p>
              {!searchTerm && (
                <Button onClick={onAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
              )}
            </div>
          ) : (
            <GenericDataTable 
              columns={columns} 
              data={products} 
              searchKey="name"
              searchPlaceholder="Search products..."
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
