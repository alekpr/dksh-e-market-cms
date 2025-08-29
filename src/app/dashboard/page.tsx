import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { ROLE_DESCRIPTIONS, NAVIGATION_PERMISSIONS, type UserRole } from "@/lib/constants/roles"
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { 
  Store, 
  Users, 
  Package, 
  TagIcon as Tag,
  Percent,
  BarChart3,
  TrendingUp,
  Activity
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    stores: 0,
    users: 0,
    products: 0,
    categories: 0,
    promotions: 0,
    orders: 0
  })

  const userRole = user?.role as UserRole
  const roleDescription = userRole ? ROLE_DESCRIPTIONS[userRole] : null
  const userPermissions = userRole ? NAVIGATION_PERMISSIONS[userRole] : []
  const canManageStores = (userPermissions as string[]).includes('stores')
  const canManageUsers = (userPermissions as string[]).includes('users')

  useEffect(() => {
    // Simulate API call to fetch stats
    const fetchStats = async () => {
      // Mock data based on role
      setStats({
        stores: canManageStores ? 25 : 1,
        users: canManageUsers ? 1250 : 15,
        products: 450,
        categories: 28,
        promotions: 12,
        orders: 156
      })
    }

    fetchStats()
  }, [canManageStores, canManageUsers])

  const getDashboardCards = () => {
    const cards = []

    if (userRole === 'admin') {
      cards.push(
        {
          title: "Total Stores",
          value: stats.stores,
          description: "Active merchant stores",
          icon: Store,
          color: "text-blue-600"
        },
        {
          title: "Total Users", 
          value: stats.users,
          description: "All system users",
          icon: Users,
          color: "text-green-600"
        }
      )
    } else if (userRole === 'merchant') {
      cards.push(
        {
          title: "Products",
          value: stats.products,
          description: "Items in your store",
          icon: Package,
          color: "text-purple-600"
        },
        {
          title: "Categories",
          value: stats.categories,
          description: "Product categories",
          icon: Tag,
          color: "text-orange-600"
        },
        {
          title: "Active Promotions",
          value: stats.promotions,
          description: "Running campaigns",
          icon: Percent,
          color: "text-red-600"
        },
        {
          title: "Orders",
          value: stats.orders,
          description: "This month",
          icon: BarChart3,
          color: "text-teal-600"
        }
      )
    }

    return cards
  }

  const getWelcomeMessage = () => {
    if (userRole === 'admin') {
      return {
        title: `Welcome back, ${user?.name}!`,
        subtitle: "System Administrator Dashboard",
        description: "Manage stores and users across the entire platform"
      }
    } else if (userRole === 'merchant') {
      return {
        title: `Welcome to your store, ${user?.name}!`,
        subtitle: "Merchant Dashboard", 
        description: "Manage your products, categories, and promotions"
      }
    }
    
    return {
      title: `Welcome, ${user?.name}!`,
      subtitle: "Dashboard",
      description: "Your account overview"
    }
  }

  const dashboardCards = getDashboardCards()
  const welcomeMsg = getWelcomeMessage()

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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{welcomeMsg.title}</h1>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">{welcomeMsg.description}</p>
                {roleDescription && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {roleDescription.name}
                  </span>
                )}
              </div>
            </div>

            {/* Role Information */}
            {roleDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Your Role & Permissions
                  </CardTitle>
                  <CardDescription>
                    What you can do with your {roleDescription.name} account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {roleDescription.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{permission}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            {dashboardCards.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {dashboardCards.map((card, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {card.title}
                      </CardTitle>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{card.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  {userRole === 'admin' 
                    ? "System-wide activity overview"
                    : "Your store activity"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRole === 'admin' ? (
                    <>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Store className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New store registered</p>
                          <p className="text-xs text-muted-foreground">TechMart added 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Users className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">User accounts updated</p>
                          <p className="text-xs text-muted-foreground">5 new merchants this week</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Package className="h-4 w-4 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">New products added</p>
                          <p className="text-xs text-muted-foreground">3 products added today</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <BarChart3 className="h-4 w-4 text-teal-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Orders received</p>
                          <p className="text-xs text-muted-foreground">12 new orders this week</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
