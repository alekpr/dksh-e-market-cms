'use client'

import { useUserManagement } from '@/components/user-management/use-user-management'
import { UserListView } from '@/components/user-management/user-list-view'
import { UserFormView } from '@/components/user-management/user-form-view'
import { UserDetailView } from '@/components/user-management/user-detail-view'
import type { User } from '@/lib/api'
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

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    currentView,
    selectedUser,
    formData,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleSave,
    handleCancel,
    setFormData,
    handleStatusChange,
    handleRoleChange,
    handleAccountLock,
    handleAddNote,
  } = useUserManagement()

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
                    <BreadcrumbPage>User Management</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-center h-[50vh]">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-destructive mb-2">
                  Error Loading Users
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
          <UserFormView
            currentView={currentView}
            formData={formData}
            onFormDataChange={setFormData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )

      case 'view':
        return selectedUser ? (
          <UserDetailView
            user={selectedUser}
            onEdit={() => handleEdit(selectedUser)}
            onBack={handleCancel}
            onStatusChange={handleStatusChange}
            onRoleChange={handleRoleChange}
            onAccountLock={handleAccountLock}
            onAddNote={handleAddNote}
          />
        ) : null

      case 'list':
      default:
        return (
          <UserListView
            users={users}
            loading={loading}
            onAdd={handleAdd}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={(user: User) => handleDelete(user._id)}
            onStatusChange={handleStatusChange}
            onRoleChange={handleRoleChange}
            onAccountLock={handleAccountLock}
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
                  <BreadcrumbPage>User Management</BreadcrumbPage>
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
