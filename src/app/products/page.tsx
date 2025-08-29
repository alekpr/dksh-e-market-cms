'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Star, Package, TrendingUp, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { productApi, categoryApi, storeApi, type Product, type Category, type Store } from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import { ProductForm } from '@/components/product-form'

interface ProductStats {
  total: number
  active: number
  draft: number
  outOfStock: number
  featured: number
}

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    draft: 0,
    outOfStock: 0,
    featured: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const isAdmin = user?.role === 'admin'
  const isMerchant = user?.role === 'merchant'

  // Load initial data
  useEffect(() => {
    loadData()
  }, [currentPage, selectedStatus, selectedCategory, selectedStore, sortBy, sortOrder])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build filters
      const filters: any = {
        page: currentPage,
        limit: 20,
        sort: sortBy,
        order: sortOrder,
      }

      if (selectedStatus !== 'all') filters.status = selectedStatus
      if (selectedCategory !== 'all') filters.category = selectedCategory
      if (selectedStore !== 'all') filters.store = selectedStore

      // For merchants, only show their own products
      if (isMerchant && user?.merchantInfo?.storeId) {
        filters.store = user.merchantInfo.storeId
      }

      // Load products
      const productResponse = await productApi.getProducts(filters)
      if (productResponse.status === 'success' && productResponse.data) {
        setProducts(productResponse.data.data || [])
        // Mock pagination for now
        setTotalPages(Math.ceil((productResponse.data.count || 0) / 20))
        
        // Calculate stats from the products
        const productStats = calculateStats(productResponse.data.data || [])
        setStats(productStats)
      }

      // Load categories (only once)
      if (categories.length === 0) {
        const categoryResponse = await categoryApi.getCategories({ 
          isActive: true, 
          limit: 100,
          sort: 'name',
          order: 'asc'
        })
        if (categoryResponse.status === 'success' && categoryResponse.data) {
          setCategories(categoryResponse.data.data || [])
        }
      }

      // Load stores (admin only)
      if (isAdmin && stores.length === 0) {
        const storeResponse = await storeApi.getStores({
          limit: 100,
          status: 'active',
          sortBy: 'businessName',
          sortOrder: 'asc'
        })
        if (storeResponse.status === 'success' && storeResponse.data) {
          setStores(storeResponse.data.data || [])
        }
      }

    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (productList: Product[]): ProductStats => {
    return {
      total: productList.length,
      active: productList.filter(p => p.status === 'active').length,
      draft: productList.filter(p => p.status === 'draft').length,
      outOfStock: productList.filter(p => 
        p.variants.every(v => v.inventory.quantity === 0)
      ).length,
      featured: productList.filter(p => p.featured).length,
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData()
      return
    }

    try {
      setLoading(true)
      const response = await productApi.searchProducts(searchQuery, {
        page: currentPage,
        limit: 20,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        store: selectedStore !== 'all' ? selectedStore : undefined,
      })

      if (response.status === 'success' && response.data) {
        setProducts(response.data.data || [])
        setTotalPages(Math.ceil((response.data.count || 0) / 20))
      }
    } catch (err) {
      console.error('Error searching products:', err)
      setError('Failed to search products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (productId: string, newStatus: Product['status']) => {
    try {
      const response = await productApi.updateProductStatus(productId, newStatus)
      if (response.status === 'success') {
        setProducts(products.map(p => 
          p._id === productId ? { ...p, status: newStatus } : p
        ))
      }
    } catch (err) {
      console.error('Error updating product status:', err)
      setError('Failed to update product status.')
    }
  }

  const handleToggleFeatured = async (productId: string) => {
    if (!isAdmin) return

    try {
      const response = await productApi.toggleProductFeatured(productId)
      if (response.status === 'success' && response.data) {
        setProducts(products.map(p => 
          p._id === productId ? { ...p, featured: response.data?.data?.featured || false } : p
        ))
      }
    } catch (err) {
      console.error('Error toggling featured status:', err)
      setError('Failed to update featured status.')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await productApi.deleteProduct(productId)
      if (response.status === 'success') {
        setProducts(products.filter(p => p._id !== productId))
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product.')
    }
  }

  const getStatusBadge = (status: Product['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
      deleted: 'bg-red-100 text-red-800',
    }
    return variants[status] || variants.draft
  }

  const getStoreName = (store: Store | string) => {
    if (typeof store === 'string') {
      const storeObj = stores.find(s => s._id === store)
      return storeObj?.businessName || 'Unknown Store'
    }
    return store.businessName
  }

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price)
  }

  const getInventoryStatus = (product: Product) => {
    const totalStock = product.variants.reduce((sum, v) => sum + v.inventory.quantity, 0)
    if (totalStock === 0) return { status: 'Out of Stock', color: 'text-red-600' }
    if (totalStock < 10) return { status: 'Low Stock', color: 'text-yellow-600' }
    return { status: 'In Stock', color: 'text-green-600' }
  }

  if (loading && products.length === 0) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Product Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Product Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Page Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
                <p className="text-muted-foreground">
                  {isAdmin ? 'Manage all products across the platform' : 'Manage your store products'}
                </p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Edit className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.featured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
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
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Stores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stores</SelectItem>
                      {stores.map((store) => (
                        <SelectItem key={store._id} value={store._id}>
                          {store.businessName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  setSortBy(field)
                  setSortOrder(order as 'asc' | 'desc')
                }}>
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
          )}
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                {isAdmin && <TableHead>Store</TableHead>}
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const inventoryStatus = getInventoryStatus(product)
                return (
                  <TableRow key={product._id}>
                    <TableCell>
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
                            {product.description.short}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getCategoryNames(product.categories)}
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="text-sm">
                          {getStoreName(product.store)}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="font-medium">
                        {formatPrice(product.basePrice)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${inventoryStatus.color}`}>
                        {inventoryStatus.status}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.variants.reduce((sum, v) => sum + v.inventory.quantity, 0)} units
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <Switch
                          checked={product.featured}
                          onCheckedChange={() => handleToggleFeatured(product._id)}
                        />
                      ) : (
                        <div className="flex items-center">
                          {product.featured && <Star className="h-4 w-4 text-yellow-500" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(
                              product._id, 
                              product.status === 'active' ? 'inactive' : 'active'
                            )}
                          >
                            {product.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {products.length === 0 && !loading && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first product'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

            {/* Create Product Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>
                <ProductForm
                  categories={categories}
                  stores={stores}
                  currentUserStore={isMerchant ? user?.merchantInfo?.storeId : undefined}
                  onSubmit={async (data: any) => {
                    try {
                      const response = await productApi.createProduct(data)
                      if (response.status === 'success') {
                        setIsCreateModalOpen(false)
                        loadData() // Reload the products list
                      }
                    } catch (err) {
                      console.error('Error creating product:', err)
                      setError('Failed to create product.')
                    }
                  }}
                  onCancel={() => setIsCreateModalOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Product Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                {selectedProduct && (
                  <ProductForm
                    product={selectedProduct}
                    categories={categories}
                    stores={stores}
                    currentUserStore={isMerchant ? user?.merchantInfo?.storeId : undefined}
                    onSubmit={async (data: any) => {
                      try {
                        const response = await productApi.updateProduct(selectedProduct._id, data)
                        if (response.status === 'success') {
                          setIsEditModalOpen(false)
                          setSelectedProduct(null)
                          loadData() // Reload the products list
                        }
                      } catch (err) {
                        console.error('Error updating product:', err)
                        setError('Failed to update product.')
                      }
                    }}
                    onCancel={() => {
                      setIsEditModalOpen(false)
                      setSelectedProduct(null)
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
