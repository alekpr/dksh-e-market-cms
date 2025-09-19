import * as React from "react"
import {
  IconHome,
  IconFileText,
  IconSettings,
  IconUsers,
  IconShoppingBag,
  IconPackage,
  IconFolder,
  IconPercentage,
  IconShoppingCart,
  IconBox,
  IconChartBar,
  IconTruck,
  IconPhoto,
  IconLayout,
} from "@tabler/icons-react"
import { useAuth } from "@/contexts/AuthContext"
import { StoreStatusBadge } from "@/components/store-validation"
import { getNavigationItems, NAVIGATION_CONFIG, type UserRole } from "@/lib/constants/roles"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Icon mapping
const ICON_MAP = {
  dashboard: IconHome,
  stores: IconShoppingBag,
  'store-info': IconShoppingBag,
  'store-layout': IconLayout,
  users: IconUsers,
  products: IconPackage,
  categories: IconFolder,
  promotions: IconPercentage,
  orders: IconShoppingCart,
  inventory: IconBox,
  analytics: IconChartBar,
  settings: IconSettings,
  content: IconFileText,
  truck: IconTruck,
  image: IconPhoto,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  if (!user) return null

  // Get navigation items based on user role
  const allowedNavItems = getNavigationItems(user.role as UserRole)
  
  // Build navigation menu based on user permissions
  const navItems = allowedNavItems.map(item => {
    const config = NAVIGATION_CONFIG[item as keyof typeof NAVIGATION_CONFIG]
    return {
      title: config.title,
      url: config.path,
      icon: ICON_MAP[item as keyof typeof ICON_MAP] || IconHome,
    }
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <h2 className="text-lg font-semibold">CMS Admin</h2>
        <p className="text-xs text-muted-foreground capitalize">{user.role} Dashboard</p>
        {user.role === 'merchant' && (
          <div className="mt-2">
            <StoreStatusBadge />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user.name,
          email: user.email,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`
        }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
