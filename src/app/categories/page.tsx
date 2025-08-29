import { useCategoryManagement } from '@/components/category-management/use-category-management'
import { CategoryListView } from '@/components/category-management/category-list-view'
import { CategoryFormView } from '@/components/category-management/category-form-view'
import { CategoryDetailView } from '@/components/category-management/category-detail-view'
import { StoreValidation } from '@/components/store-validation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function CategoriesPage() {
  // Check if category management hook exists
  let categoryData
  try {
    categoryData = useCategoryManagement()
  } catch (error) {
    console.error('Category management hook not available:', error)
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
                    <Link to="/dashboard" className="hover:text-foreground">
                      Dashboard
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Category Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <div className="p-6">
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold mb-4">Category Management</h1>
                  <p className="text-muted-foreground mb-4">
                    Category management functionality is being set up.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>This page will allow you to:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Create and manage product categories</li>
                      <li>Organize categories in hierarchies</li>
                      <li>Set category images and descriptions</li>
                      <li>Control category visibility</li>
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
    categories = [],
    flatCategories = [],
    loading = false,
    error = null,
    currentView = 'list',
    selectedCategory = null,
    searchTerm = '',
    filterStatus = 'all',
    viewMode = 'tree',
    formData = {
      name: '',
      description: '',
      parent: '',
      image: '',
      icon: '',
      isActive: true,
      order: 0,
      meta: {
        title: '',
        description: '',
        keywords: ''
      }
    },
    categoryStats = {
      total: 0,
      active: 0,
      inactive: 0,
      withProducts: 0,
      featured: 0
    },
    canManageCategories = true,
    storeName = 'Your Store',
    handleAdd = () => {},
    handleEdit = () => {},
    handleView = () => {},
    handleSave = () => {},
    handleDelete = () => {},
    handleToggleStatus = () => {},
    handleCancel = () => {},
    setSearchTerm = () => {},
    setFilterStatus = () => {},
    setViewMode = () => {},
    setFormData = () => {},
  } = categoryData

  // Show access denied if user cannot manage categories
  if (!canManageCategories) {
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
                    <Link to="/dashboard" className="hover:text-foreground">
                      Dashboard
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Category Management</BreadcrumbPage>
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
                      You need to be a merchant with an active store or an admin to manage categories.
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
                    <Link to="/dashboard" className="hover:text-foreground">
                      Dashboard
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Category Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-destructive mb-2">
                  Error Loading Categories
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
    try {
      switch (currentView) {
        case 'add':
        case 'edit':
          return (
            <CategoryFormView
              currentView={currentView}
              formData={formData}
              flatCategories={flatCategories}
              loading={loading}
              selectedCategory={selectedCategory}
              storeName={storeName}
              onFormDataChange={setFormData}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )

        case 'view':
          return selectedCategory ? (
            <CategoryDetailView
              category={selectedCategory}
              flatCategories={flatCategories}
              storeName={storeName}
              onEdit={() => handleEdit(selectedCategory)}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onBack={handleCancel}
            />
          ) : null

        case 'list':
        default:
          return (
            <CategoryListView
              categories={categories}
              flatCategories={flatCategories}
              loading={loading}
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              viewMode={viewMode}
              categoryStats={categoryStats}
              storeName={storeName}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onSearch={setSearchTerm}
              onFilterStatus={setFilterStatus}
              onViewModeChange={setViewMode}
            />
          )
      }
    } catch (error) {
      console.error('Error rendering category content:', error)
      return (
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Component Error
          </h2>
          <p className="text-muted-foreground">
            There was an error loading the category management components.
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              The category management feature is available for merchants who have access to manage their store categories.
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
                  <Link to="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Category Management</BreadcrumbPage>
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
              
              {renderContent()}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
