import { HierarchicalCategoryView } from '@/components/category-management/hierarchical-category-view'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminHierarchicalCategoriesPage() {
  const { user } = useAuth()

  // Admin access only
  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
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
                  <BreadcrumbItem className="hidden md:block">
                    <Link to="/admin" className="hover:text-foreground">
                      Admin
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Hierarchical Categories</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
              <div className="p-6">
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-4">
                      <AlertTriangle className="h-12 w-12 text-destructive" />
                      <div className="text-center">
                        <h2 className="text-xl font-semibold text-destructive mb-2">
                          Admin Access Required
                        </h2>
                        <p className="text-muted-foreground">
                          Hierarchical Category Management is restricted to administrators only.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Contact your system administrator for access.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                  <Link to="/dashboard" className="hover:text-foreground">
                    Dashboard
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <Link to="/admin" className="hover:text-foreground">
                    Admin
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Hierarchical Categories</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
            <div className="p-6">
              {/* Admin Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Hierarchical Category Management</h1>
                    <p className="text-muted-foreground">
                      Admin-only management of master categories and global category structure
                    </p>
                  </div>
                </div>
                
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-900">Administrator Privileges Required</p>
                        <p className="text-xs text-blue-700">
                          This section allows you to create master categories that organize all store categories across the platform.
                          Changes here affect the entire marketplace structure.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Hierarchical Category Management */}
              <HierarchicalCategoryView />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
