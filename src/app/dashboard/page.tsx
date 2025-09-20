'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { ROLE_DESCRIPTIONS, NAVIGATION_PERMISSIONS, type UserRole } from "@/lib/constants/roles"
import { API_BASE_URL, promotionApi } from "@/lib/api"
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
  Activity,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  PackageX
} from "lucide-react"
import { DebugPanel } from '@/components/debug-panel'

// Helper function to get store order status for merchants
const getStoreOrderStatus = (order: RecentOrder, merchantStoreId: string | undefined, isAdmin: boolean): string => {
  if (isAdmin || !merchantStoreId) {
    return order.status
  }
  
  // Find the store order for this merchant's store
  const storeOrder = order.storeOrders?.find(so => {
    const storeId = so.store && typeof so.store === 'object' ? (so.store as any)._id : so.store
    return storeId === merchantStoreId
  })
  
  return storeOrder?.status || order.status
}

interface MerchantStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  activePromotions: number
  lowStockProducts: number
  outOfStockProducts: number
  averageOrderValue: number
  totalProductsSold: number
}

interface RecentOrder {
  _id: string
  totalAmount: number
  status: string
  createdAt: string
  customerName?: string
  items: any[]
  storeOrders?: Array<{
    store: string;
    items: string[];
    subtotal: number;
    status: string;
    _id: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<MerchantStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activePromotions: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    averageOrderValue: 0,
    totalProductsSold: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [recentPromotions, setRecentPromotions] = useState<any[]>([])

  const userRole = user?.role as UserRole
  const roleDescription = userRole ? ROLE_DESCRIPTIONS[userRole] : null
  const userPermissions = userRole ? NAVIGATION_PERMISSIONS[userRole] : []
  const canManageStores = (userPermissions as string[]).includes('stores')
  const canManageUsers = (userPermissions as string[]).includes('users')
  const isMerchant = userRole === 'merchant'
  const isAdmin = userRole === 'admin'

  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!isMerchant) {
        // For admin, use mock data as before
        setStats({
          totalRevenue: 0,
          totalOrders: 156,
          totalProducts: 450,
          activePromotions: 12,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          averageOrderValue: 0,
          totalProductsSold: 0
        })
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('authToken')
        
        if (!token) {
          setLoading(false)
          return
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Fetch multiple endpoints in parallel - using merchant-specific routes
        const [summaryRes, inventoryRes, productsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/analytics/merchant/summary`, { headers }),
          fetch(`${API_BASE_URL}/analytics/merchant/inventory`, { headers }),
          fetch(`${API_BASE_URL}/products?store=${user?.merchantInfo?.storeId}&status=active&limit=1`, { headers }),
          fetch(`${API_BASE_URL}/stores/${user?.merchantInfo?.storeId}/orders?limit=5&sortBy=createdAt&sortOrder=desc`, { headers })
        ])

        // Use promotionApi for merchant-specific promotion filtering
        const promotionsPromise = promotionApi.getPromotions({ limit: 100, active: true })

        const [summaryData, inventoryData, productsData, ordersData, promotionsData] = await Promise.all([
          summaryRes.json(),
          inventoryRes.json(),
          productsRes.json(),
          ordersRes.json(),
          promotionsPromise
        ])

        console.log('📊 Dashboard API Data:', { 
          summaryData, 
          inventoryData, 
          productsData, 
          promotionsData: {
            total: promotionsData.data?.pagination?.total || promotionsData.data?.results || 0,
            promotionsCount: (promotionsData.data as any)?.promotions?.length || 0
          }, 
          ordersData 
        })

        // Extract stats from API responses
        const summary = summaryData.data?.summary || {}
        const inventory = inventoryData.data?.stockLevels?.[0] || {}
        
        setStats({
          totalRevenue: summary.totalRevenue || 0,
          totalOrders: summary.totalOrders || 0,
          totalProducts: productsData.pagination?.total || 0,
          activePromotions: promotionsData.data?.pagination?.total || promotionsData.data?.results || 0,
          lowStockProducts: inventory.lowStockProducts || 0,
          outOfStockProducts: inventory.outOfStockProducts || 0,
          averageOrderValue: summary.averageOrderValue || 0,
          totalProductsSold: summary.totalProductsSold || 0
        })

        // Set recent orders
        setRecentOrders(ordersData.data || [])

        // Set recent promotions
        setRecentPromotions((promotionsData.data as any)?.promotions || [])

      } catch (error) {
        console.error('Error fetching merchant data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMerchantData()
  }, [isMerchant, user?.merchantInfo?.storeId])

  const getDashboardCards = () => {
    const cards = []

    if (isAdmin) {
      cards.push(
        {
          title: "Total Stores",
          value: 25,
          description: "Active merchant stores",
          icon: Store,
          color: "text-blue-600"
        },
        {
          title: "Total Users", 
          value: 1250,
          description: "All system users",
          icon: Users,
          color: "text-green-600"
        }
      )
    } else if (isMerchant) {
      cards.push(
        {
          title: "Total Revenue",
          value: `฿${stats.totalRevenue.toLocaleString()}`,
          description: "This month",
          icon: DollarSign,
          color: "text-green-600"
        },
        {
          title: "Total Orders",
          value: stats.totalOrders,
          description: "All completed orders",
          icon: ShoppingCart,
          color: "text-blue-600"
        },
        {
          title: "Products",
          value: stats.totalProducts,
          description: "Active products",
          icon: Package,
          color: "text-purple-600"
        },
        {
          title: "Average Order",
          value: `฿${Math.round(stats.averageOrderValue).toLocaleString()}`,
          description: "Per order value",
          icon: TrendingUp,
          color: "text-teal-600"
        },
        {
          title: "Products Sold",
          value: stats.totalProductsSold,
          description: "Total quantity sold",
          icon: BarChart3,
          color: "text-orange-600"
        }
      )

      // Add inventory alerts if needed
      if (stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) {
        cards.push({
          title: "Inventory Alerts",
          value: stats.lowStockProducts + stats.outOfStockProducts,
          description: `${stats.outOfStockProducts} out of stock, ${stats.lowStockProducts} low stock`,
          icon: AlertTriangle,
          color: "text-yellow-600"
        })
      }
    }

    return cards
  }

  const getWelcomeMessage = () => {
    if (isAdmin) {
      return {
        title: `Welcome back, ${user?.name}!`,
        subtitle: "System Administrator Dashboard",
        description: "Manage stores and users across the entire platform"
      }
    } else if (isMerchant) {
      return {
        title: `Welcome to your store, ${user?.name}!`,
        subtitle: `${user?.merchantInfo?.storeName || 'Your Store'} Dashboard`, 
        description: "Monitor your business performance and manage your operations"
      }
    }
    
    return {
      title: `Welcome, ${user?.name}!`,
      subtitle: "Dashboard",
      description: "Your account overview"
    }
  }

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
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Loading dashboard...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
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
                {roleDescription && !isMerchant && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {roleDescription.name}
                  </span>
                )}
              </div>
            </div>

            {/* Show role permissions only for non-merchant users */}
            {roleDescription && !isMerchant && (
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

            {/* Recent Activity for Merchants */}
            {isMerchant && (
              <div className="grid gap-4 md:grid-cols-2">
                {/* Recent Orders */}
                {recentOrders.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Recent Orders
                      </CardTitle>
                      <CardDescription>
                        Latest orders from your store
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentOrders.slice(0, 5).map((order) => {
                          // Get the appropriate status to display (store order status for merchants, main order status for admins)
                          const displayStatus = getStoreOrderStatus(order, user?.merchantInfo?.storeId, isAdmin)
                          
                          return (
                            <div key={order._id} className="flex items-center gap-3 p-3 border rounded-lg">
                              <ShoppingCart className={`h-4 w-4 ${
                                displayStatus === 'completed' ? 'text-green-600' :
                                displayStatus === 'pending' ? 'text-yellow-600' :
                                displayStatus === 'cancelled' ? 'text-red-600' :
                                'text-blue-600'
                              }`} />
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  Order #{order._id.slice(-8)} - ฿{order.totalAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {displayStatus} • {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                displayStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                displayStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                displayStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {displayStatus}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Promotions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Active Promotions
                    </CardTitle>
                    <CardDescription>
                      Your store's current promotions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentPromotions.length > 0 ? (
                      <div className="space-y-4">
                        {recentPromotions.slice(0, 3).map((promotion) => (
                          <div key={promotion._id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Percent className={`h-4 w-4 ${
                              promotion.status === 'active' ? 'text-green-600' :
                              promotion.status === 'scheduled' ? 'text-blue-600' :
                              'text-gray-600'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{promotion.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {promotion.type} • {promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : `฿${promotion.discountValue}`} off
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              promotion.status === 'active' ? 'bg-green-100 text-green-800' :
                              promotion.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {promotion.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Percent className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">No active promotions</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Create promotions to boost your sales
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity for Admin */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    System-wide activity overview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
