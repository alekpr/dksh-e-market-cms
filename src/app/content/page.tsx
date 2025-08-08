import React from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ContentListView } from '@/components/content-management/content-list-view'
import { ContentFormView } from '@/components/content-management/content-form-view'
import { ContentDetailView } from '@/components/content-management/content-detail-view'
import { useContentManagement } from '@/components/content-management/use-content-management'

const ContentManagement: React.FC = () => {
  const {
    currentView,
    selectedContent,
    searchTerm,
    filterStatus,
    filterCategory,
    formData,
    filteredContents,
    categories,
    setSearchTerm,
    setFilterStatus,
    setFilterCategory,
    setFormData,
    handleAdd,
    handleEdit,
    handleView,
    handleSave,
    handleDelete,
    handleClearFilters,
    handleCancel
  } = useContentManagement()

  // Render current view based on state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <ContentListView
            filteredContents={filteredContents}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            filterCategory={filterCategory}
            categories={categories}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setFilterStatus}
            onCategoryFilterChange={setFilterCategory}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onClearFilters={handleClearFilters}
          />
        )
      
      case 'add':
      case 'edit':
        return (
          <ContentFormView
            currentView={currentView}
            formData={formData}
            onFormDataChange={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )
      
      case 'view':
        return selectedContent ? (
          <ContentDetailView
            content={selectedContent}
            onEdit={handleEdit}
            onBack={handleCancel}
          />
        ) : null
      
      default:
        return null
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {renderCurrentView()}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ContentManagement
