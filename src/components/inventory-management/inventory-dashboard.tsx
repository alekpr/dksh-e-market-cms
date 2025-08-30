import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, TrendingDown, DollarSign, Eye, BarChart3 } from 'lucide-react'
import type { InventoryStats, InventoryItem, InventoryViewMode } from './use-inventory-management'

interface InventoryDashboardProps {
  stats: InventoryStats
  lowStockItems: InventoryItem[]
  outOfStockItems: InventoryItem[]
  loading: boolean
  storeName?: string
  isAdmin: boolean
  onViewChange: (view: InventoryViewMode) => void
  onViewItem: (item: InventoryItem) => void
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  stats,
  lowStockItems,
  outOfStockItems,
  loading,
  storeName,
  isAdmin,
  onViewChange,
  onViewItem
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading inventory dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Monitor inventory across all stores' : `Monitor inventory for ${storeName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onViewChange('stock-tracking')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Stock Tracking
          </Button>
          <Button variant="outline" onClick={() => onViewChange('bulk-update')}>
            <Package className="mr-2 h-4 w-4" />
            Bulk Update
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalVariants} variants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.inStock / stats.totalVariants) * 100).toFixed(1)}% of variants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.outOfStock / stats.totalVariants) * 100).toFixed(1)}% of variants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Low Stock Alerts ({lowStockItems.length})
              </CardTitle>
              {lowStockItems.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewChange('low-stock')}
                >
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No low stock items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.productName}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">
                        {item.currentStock} left
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Threshold: {item.lowStockThreshold}
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => onViewChange('low-stock')}
                  >
                    View {lowStockItems.length - 5} more items
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Out of Stock */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Out of Stock ({outOfStockItems.length})
              </CardTitle>
              {outOfStockItems.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewChange('stock-tracking')}
                >
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {outOfStockItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No out of stock items</p>
              </div>
            ) : (
              <div className="space-y-3">
                {outOfStockItems.slice(0, 5).map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.productName}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        Out of Stock
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1"
                        onClick={() => onViewItem(item)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
                {outOfStockItems.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => onViewChange('stock-tracking')}
                  >
                    View {outOfStockItems.length - 5} more items
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onViewChange('stock-tracking')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>View All Stock</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onViewChange('low-stock')}
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Low Stock Items</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onViewChange('bulk-update')}
            >
              <Package className="h-6 w-6" />
              <span>Bulk Update</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
