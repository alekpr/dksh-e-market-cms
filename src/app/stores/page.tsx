'use client'

import { useStoreManagement } from '@/components/store-management/use-store-management'
import { StoreListView } from '@/components/store-management/store-list-view'
import { StoreFormView } from '@/components/store-management/store-form-view'
import { StoreDetailView } from '@/components/store-management/store-detail-view'
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

export default function StoresPage() {
  const {
    stores,
    loading,
    error,
    currentView,
    selectedStore,
    formData,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleSave,
    handleCancel,
    setFormData,
  } = useStoreManagement()

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
                    <BreadcrumbPage>Store Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-destructive mb-2">
                  Error Loading Stores
                </h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Function to render content based on view mode
  const renderContent = () => {
    switch (currentView) {
      case 'add':
      case 'edit':
        return (
          <StoreFormView
            currentView={currentView}
            formData={formData}
            onFormDataChange={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )

      case 'view':
        return selectedStore ? (
          <StoreDetailView
            store={selectedStore}
            onEdit={() => handleEdit(selectedStore)}
            onBack={handleCancel}
          />
        ) : null

      case 'list':
      default:
        return (
          <StoreListView
            stores={stores}
            loading={loading}
            onAdd={handleAdd}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(store) => handleDelete(store._id)}
          />
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
                  <BreadcrumbPage>Store Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
