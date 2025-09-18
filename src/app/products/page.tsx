'use client'

import { useProductManagement } from '@/components/product-management/use-product-management'
import { ProductListView } from '@/components/product-management/product-list-view'
import { ProductFormView } from '@/components/product-management/product-form-view'
import { ProductDetailView } from '@/components/product-management/product-detail-view'
import { StoreValidation } from '@/components/store-validation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function ProductsPage() {
  // Check if product management hook exists
  let productData
  try {
    productData = useProductManagement()
  } catch (error) {
    console.error('Product management hook not available:', error)
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
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <div className="p-6">
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold mb-4">Product Management</h1>
                  <p className="text-muted-foreground mb-4">
                    Product management functionality is being set up.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>This page will allow you to:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Create and manage products</li>
                      <li>Set up product variants and inventory</li>
                      <li>Upload product images</li>
                      <li>Control product visibility and status</li>
                      <li>Organize products by categories</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const {
    products = [],
    categories = [],
    stores = [],
    loading = false,
    error = null,
    currentView = 'list',
    selectedProduct = null,
    searchTerm = '',
    filterStatus = 'all',
    filterCategory = 'all',
    filterStore = 'all',
    sortBy = 'updatedAt',
    sortOrder = 'desc',
    currentPage = 1,
    totalPages = 1,
    formData = {
      name: '',
      description: { short: '', detailed: '' },
      basePrice: 0,
      categories: [],
      store: '',
      variants: [],
      images: [],
      status: 'draft' as const,
      featured: false,
      meta: { title: '', description: '', keywords: '' }
    },
    productStats = {
      total: 0,
      active: 0,
      draft: 0,
      archived: 0,
      outOfStock: 0,
      featured: 0
    },
    canManageProducts = true,
    isAdmin = false,
    storeName = 'Your Store',
    handleAdd = () => {},
    handleEdit = () => {},
    handleView = () => {},
    handleSave = () => {},
    handleDelete = () => {},
    handleToggleStatus = () => {},
    handleToggleFeatured,
    handleCancel,
    handleSearch,
    loadProducts,
    setSearchTerm = () => {},
    setFilterStatus = () => {},
    setFilterCategory = () => {},
    setFilterStore = () => {},
    setSortBy = () => {},
    setSortOrder = () => {},
    setCurrentPage = () => {},
    setFormData = () => {},
  } = productData

  // Show access denied if user cannot manage products
  if (!canManageProducts) {
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
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <div className="p-6">
                <StoreValidation />
                <div className="flex items-center justify-center h-[50vh]">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-destructive mb-2">
                      Access Denied
                    </h2>
                    <p className="text-muted-foreground">
                      You need to be a merchant with an active store or an admin to manage products.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Function to render content based on view mode
  const renderContent = () => {
    try {
      switch (currentView) {
        case 'add':
        case 'edit':
          return (
            <ProductFormView
              currentView={currentView}
              formData={formData}
              categories={categories}
              stores={stores}
              loading={loading}
              selectedProduct={selectedProduct}
              storeName={storeName}
              isAdmin={isAdmin}
              onFormDataChange={setFormData}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )

        case 'view':
          return selectedProduct ? (
            <ProductDetailView
              product={selectedProduct}
              categories={categories}
              stores={stores}
              storeName={storeName}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
              onBack={handleCancel}
            />
          ) : null

        case 'list':
        default:
          return (
            <ProductListView
              products={products}
              categories={categories}
              stores={stores}
              loading={loading}
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              filterCategory={filterCategory}
              filterStore={filterStore}
              sortBy={sortBy}
              sortOrder={sortOrder}
              currentPage={currentPage}
              totalPages={totalPages}
              productStats={productStats}
              storeName={storeName}
              isAdmin={isAdmin}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
              onSearch={handleSearch}
              onFilterStatusChange={setFilterStatus}
              onFilterCategoryChange={setFilterCategory}
              onFilterStoreChange={setFilterStore}
              onSortChange={(field, order) => {
                setSortBy(field)
                setSortOrder(order)
              }}
              onPageChange={setCurrentPage}
              onRefresh={loadProducts}
            />
          )
      }
    } catch (error) {
      console.error('Error rendering product content:', error)
      return (
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Component Error
          </h2>
          <p className="text-muted-foreground">
            There was an error loading the product management components.
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              The product management feature is available for merchants who have access to manage their store products.
            </p>
          </div>
        </div>
      )
    }
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
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <div className="p-6">
              {/* Store validation for merchants */}
              <StoreValidation className="mb-6" />
              
              {/* Error display */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {renderContent()}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
