'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StoreValidation } from '@/components/store-validation'
import { useOrderManagement } from '@/hooks/use-order-management'
import { OrderListView } from '@/components/orders/OrderListView'
import { OrderDetailView } from '@/components/orders/OrderDetailView'

export default function OrdersPage() {
  // Check if order management hook exists
  const orderData = useOrderManagement()

  const {
    orders = [],
    loading = false,
    error = null,
    currentView = 'list',
    selectedOrder = null,
    searchTerm = '',
    filterStatus = 'all',
    filterPaymentStatus = 'all',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    currentPage = 1,
    totalPages = 1,
    orderStats = {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    },
    canManageOrders = true,
    isAdmin = false,
    storeName = 'Your Store',
    handleView = () => {},
    handleUpdateStatus = () => {},
    handleAssignOrder = () => {},
    handleCancelOrder = () => {},
    handleBack = () => {},
    handleSearch = () => {},
    // setSearchTerm = () => {}, // Not used in this implementation
    setFilterStatus = () => {},
    setFilterPaymentStatus = () => {},
    setSortBy = () => {},
    setSortOrder = () => {},
    setCurrentPage = () => {},
  } = orderData

  // Show access denied if user cannot manage orders
  if (!canManageOrders) {
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
                    <BreadcrumbPage>Order Management</BreadcrumbPage>
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
                      You need to be a merchant with an active store or an admin to manage orders.
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
        case 'view':
          return selectedOrder ? (
            <OrderDetailView
              order={selectedOrder}
              storeName={storeName}
              isAdmin={isAdmin}
              onUpdateStatus={handleUpdateStatus}
              onAssignOrder={handleAssignOrder}
              onCancelOrder={handleCancelOrder}
              onBack={handleBack}
            />
          ) : null

        case 'list':
        default:
          return (
            <OrderListView
              orders={orders}
              loading={loading}
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              filterPaymentStatus={filterPaymentStatus}
              sortBy={sortBy}
              sortOrder={sortOrder}
              currentPage={currentPage}
              totalPages={totalPages}
              orderStats={orderStats}
              storeName={storeName}
              isAdmin={isAdmin}
              onView={handleView}
              onUpdateStatus={handleUpdateStatus}
              onAssignOrder={handleAssignOrder}
              onCancelOrder={handleCancelOrder}
              onSearch={handleSearch}
              onFilterStatusChange={setFilterStatus}
              onFilterPaymentStatusChange={setFilterPaymentStatus}
              onSortChange={(field: string, order: string) => {
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}
              onPageChange={setCurrentPage}
            />
          )
      }
    } catch (error) {
      console.error('Error rendering order content:', error)
      return (
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Component Error
          </h2>
          <p className="text-muted-foreground">
            There was an error loading the order management components.
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              The order management feature is available for merchants who have access to manage their store orders.
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
                  <BreadcrumbPage>Order Management</BreadcrumbPage>
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
