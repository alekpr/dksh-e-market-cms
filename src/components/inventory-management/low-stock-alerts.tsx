import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Package, 
  ChevronLeft,
  AlertTriangle,
  Edit,
  Save,
  TrendingDown,
  RefreshCw,
  Bell,
  BellOff,
  Eye,
  EyeOff
} from 'lucide-react'
import type { InventoryItem } from './use-inventory-management'

interface LowStockAlertsProps {
  items: InventoryItem[]
  loading: boolean
  isAdmin: boolean
  storeName?: string
  onBack: () => void
  onUpdateInventory: (productId: string, variantId: string, newQuantity: number) => Promise<boolean>
  onUpdateThreshold: (productId: string, variantId: string, newThreshold: number) => Promise<boolean>
  onRefresh: () => void
}

interface AlertItem extends InventoryItem {
  urgency: 'critical' | 'warning' | 'low'
  daysSinceLastStock?: number
  averageDailySales?: number
  daysUntilOutOfStock?: number
}

export const LowStockAlerts: React.FC<LowStockAlertsProps> = ({
  items,
  loading,
  isAdmin,
  storeName,
  onBack,
  onUpdateInventory,
  onUpdateThreshold,
  onRefresh
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('urgency')
  const [editingItem, setEditingItem] = useState<AlertItem | null>(null)
  const [newQuantity, setNewQuantity] = useState<number>(0)
  const [newThreshold, setNewThreshold] = useState<number>(0)
  const [updating, setUpdating] = useState(false)
  const [showResolved, setShowResolved] = useState(false)

  // Process items into alert items
  const alertItems: AlertItem[] = React.useMemo(() => {
    return items
      .filter(item => showResolved || item.isLowStock || item.isOutOfStock)
      .map(item => {
        let urgency: 'critical' | 'warning' | 'low'
        
        if (item.isOutOfStock) {
          urgency = 'critical'
        } else if (item.currentStock <= item.lowStockThreshold * 0.5) {
          urgency = 'critical'
        } else if (item.currentStock <= item.lowStockThreshold * 0.8) {
          urgency = 'warning'
        } else {
          urgency = 'low'
        }

        // Simulate some analytics data (in real app, this would come from API)
        const averageDailySales = Math.floor(Math.random() * 10) + 1
        const daysUntilOutOfStock = item.currentStock > 0 ? Math.floor(item.currentStock / averageDailySales) : 0

        return {
          ...item,
          urgency,
          averageDailySales,
          daysUntilOutOfStock
        }
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'urgency':
            const urgencyOrder = { critical: 3, warning: 2, low: 1 }
            return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
          case 'stock':
            return a.currentStock - b.currentStock
          case 'days':
            return (a.daysUntilOutOfStock || 0) - (b.daysUntilOutOfStock || 0)
          case 'product':
            return a.productName.localeCompare(b.productName)
          default:
            return 0
        }
      })
      .filter(item => {
        if (filterUrgency === 'all') return true
        return item.urgency === filterUrgency
      })
  }, [items, filterUrgency, sortBy, showResolved])

  // Get urgency badge
  const getUrgencyBadge = (urgency: 'critical' | 'warning' | 'low') => {
    switch (urgency) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'warning':
        return <Badge variant="secondary" className="text-orange-700 bg-orange-100">Warning</Badge>
      case 'low':
        return <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">Low</Badge>
    }
  }

  // Handle edit
  const handleEdit = (item: AlertItem) => {
    setEditingItem(item)
    setNewQuantity(item.currentStock)
    setNewThreshold(item.lowStockThreshold)
  }

  // Handle update inventory
  const handleUpdateInventory = async () => {
    if (!editingItem) return

    setUpdating(true)
    try {
      const success = await onUpdateInventory(editingItem.productId, editingItem.variantId, newQuantity)
      if (success) {
        setEditingItem(null)
        onRefresh()
      } else {
        alert('Failed to update inventory. Please try again.')
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert('Failed to update inventory. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  // Handle update threshold
  const handleUpdateThreshold = async () => {
    if (!editingItem) return

    setUpdating(true)
    try {
      const success = await onUpdateThreshold(editingItem.productId, editingItem.variantId, newThreshold)
      if (success) {
        setEditingItem(null)
        onRefresh()
      } else {
        alert('Failed to update threshold. Please try again.')
      }
    } catch (error) {
      console.error('Error updating threshold:', error)
      alert('Failed to update threshold. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const criticalCount = alertItems.filter(item => item.urgency === 'critical').length
  const warningCount = alertItems.filter(item => item.urgency === 'warning').length
  const lowCount = alertItems.filter(item => item.urgency === 'low').length

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading inventory alerts...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Low Stock Alerts</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Monitor stock alerts across all stores' : `Monitor stock alerts for ${storeName}`}
          </p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={criticalCount > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={warningCount > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Warning</p>
                <p className="text-2xl font-bold text-orange-700">{warningCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={lowCount > 0 ? "border-yellow-200 bg-yellow-50" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-700">{lowCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-700">{alertItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div className="space-y-2">
            <Label>Filter by Urgency</Label>
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
                <SelectItem value="warning">Warning Only</SelectItem>
                <SelectItem value="low">Low Stock Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgency">Urgency Level</SelectItem>
                <SelectItem value="stock">Stock Level</SelectItem>
                <SelectItem value="days">Days Until Out</SelectItem>
                <SelectItem value="product">Product Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>View Options</Label>
            <Button
              variant="outline"
              onClick={() => setShowResolved(!showResolved)}
              className="w-full justify-start"
            >
              {showResolved ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showResolved ? 'Hide Resolved' : 'Show Resolved'}
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alertItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              {filterUrgency === 'all' ? (
                <>
                  <BellOff className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2 text-green-700">No Active Alerts</h3>
                  <p className="text-muted-foreground">All items are well-stocked!</p>
                </>
              ) : (
                <>
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No alerts for selected filter</h3>
                  <p className="text-muted-foreground">Try changing the filter criteria.</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Urgency</th>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Variant</th>
                    <th className="text-left p-4 font-medium">Current Stock</th>
                    <th className="text-left p-4 font-medium">Threshold</th>
                    <th className="text-left p-4 font-medium">Est. Days Left</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alertItems.map((item) => (
                    <tr 
                      key={`${item.productId}-${item.variantId}`} 
                      className={`border-b hover:bg-muted/50 ${
                        item.urgency === 'critical' ? 'bg-red-50' : 
                        item.urgency === 'warning' ? 'bg-orange-50' : 
                        'bg-yellow-50'
                      }`}
                    >
                      <td className="p-4">
                        {getUrgencyBadge(item.urgency)}
                      </td>
                      <td className="p-4">
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
                            {isAdmin && item.storeName && (
                              <p className="text-xs text-muted-foreground">{item.storeName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium">{item.variantName}</p>
                        {item.sku && (
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-center">
                          <p className={`font-bold ${
                            item.urgency === 'critical' ? 'text-red-700' : 
                            item.urgency === 'warning' ? 'text-orange-700' : 
                            'text-yellow-700'
                          }`}>
                            {item.currentStock}
                          </p>
                          {item.isOutOfStock && (
                            <p className="text-xs text-red-600 font-medium">OUT OF STOCK</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-center">{item.lowStockThreshold}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-center">
                          {item.daysUntilOutOfStock !== undefined ? (
                            <p className={`font-medium ${
                              item.daysUntilOutOfStock <= 3 ? 'text-red-600' :
                              item.daysUntilOutOfStock <= 7 ? 'text-orange-600' :
                              'text-yellow-600'
                            }`}>
                              {item.daysUntilOutOfStock === 0 ? 'Now' : `${item.daysUntilOutOfStock} days`}
                            </p>
                          ) : (
                            <p className="text-muted-foreground">-</p>
                          )}
                          {item.averageDailySales && (
                            <p className="text-xs text-muted-foreground">
                              ~{item.averageDailySales}/day
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Update
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Update Stock Alert</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                {item.images.length > 0 ? (
                                  <img
                                    src={item.images[0]}
                                    alt={item.productName}
                                    className="w-16 h-16 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                    <Package className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-medium">{item.productName}</h3>
                                  <p className="text-sm text-muted-foreground">{item.variantName}</p>
                                  {item.sku && (
                                    <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="quantity">New Quantity</Label>
                                  <Input
                                    id="quantity"
                                    type="number"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                                    min="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="threshold">Alert Threshold</Label>
                                  <Input
                                    id="threshold"
                                    type="number"
                                    value={newThreshold}
                                    onChange={(e) => setNewThreshold(parseInt(e.target.value) || 0)}
                                    min="0"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingItem(null)}
                                  disabled={updating}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleUpdateThreshold}
                                  disabled={updating}
                                  variant="outline"
                                >
                                  Update Threshold
                                </Button>
                                <Button
                                  onClick={handleUpdateInventory}
                                  disabled={updating}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {updating ? 'Updating...' : 'Update Stock'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
