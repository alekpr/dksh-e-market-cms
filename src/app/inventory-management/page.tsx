import React, { useState, useEffect } from 'react'
import { useInventoryManagement, type InventoryViewMode } from '@/components/inventory-management/use-inventory-management'
import { InventoryDashboard } from '@/components/inventory-management/inventory-dashboard'
import { StockTracking } from '@/components/inventory-management/stock-tracking'
import { BulkUpdate } from '@/components/inventory-management/bulk-update'
import { LowStockAlerts } from '@/components/inventory-management/low-stock-alerts'
import { useAuth } from '@/contexts/AuthContext'
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

type InventoryView = 'dashboard' | 'stock-tracking' | 'bulk-update' | 'low-stock-alerts'

// Map dashboard view mode to inventory view
const mapViewModeToView = (mode: InventoryViewMode): InventoryView => {
  switch (mode) {
    case 'stock-tracking':
      return 'stock-tracking'
    case 'low-stock':
      return 'low-stock-alerts'
    case 'bulk-update':
      return 'bulk-update'
    case 'dashboard':
    default:
      return 'dashboard'
  }
}

export const InventoryManagement: React.FC = () => {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<InventoryView>('dashboard')
  
  // Debug logging
  console.log('� InventoryManagement component rendered:', {
    user: user?.email,
    role: user?.role,
    currentView
  })
  
  try {
    const inventoryHook = useInventoryManagement()
    
    const {
      // Data
      inventoryItems,
      inventoryStats,
      
      // State
      loading,
      error,
      searchTerm,
      filterStatus,
      sortBy,
      sortOrder,
      currentPage,
      totalPages,
      
      // Actions
      loadInventoryData,
      updateInventory,
      bulkUpdateInventory,
      setSearchTerm,
      setFilterStatus,
      setSortBy,
      setSortOrder,
      setCurrentPage
    } = inventoryHook

    // Debug logging for hook return values
    console.log('📊 useInventoryManagement hook values:', {
      loading,
      error,
      inventoryItemsLength: inventoryItems.length,
      inventoryStats
    })

    // Load data on mount
    useEffect(() => {
      loadInventoryData()
    }, []) // Empty dependency array to run only once

    // Error handling
    if (error) {
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
                      <BreadcrumbPage>Inventory Management</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Inventory</h2>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button 
                      onClick={() => loadInventoryData()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      )
    }

    // Loading state
    if (loading) {
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
                      <BreadcrumbPage>Inventory Management</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p>Loading inventory dashboard...</p>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      )
    }

    // Determine user info
    const isAdmin = user?.role === 'admin'
    const storeName = 'Default Store' // Simplified for now

    // Default dashboard view
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
                    <BreadcrumbPage>Inventory Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <div className="p-6">
                <InventoryDashboard
                  stats={inventoryStats}
                  lowStockItems={[]}
                  outOfStockItems={[]}
                  loading={loading}
                  isAdmin={isAdmin}
                  storeName={storeName}
                  onViewChange={() => {}}
                  onViewItem={() => {}}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
    
  } catch (err) {
    console.error('Error in InventoryManagement component:', err)
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Inventory Management - Error</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Component Error</h1>
                <p>There was an error loading the inventory management component.</p>
                <pre className="mt-4 p-4 bg-gray-100 rounded">{String(err)}</pre>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
}

export default InventoryManagement
