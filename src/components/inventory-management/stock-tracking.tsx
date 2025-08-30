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
  Search, 
  X, 
  Edit, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Save,
  AlertTriangle
} from 'lucide-react'
import type { InventoryItem } from './use-inventory-management'

interface StockTrackingProps {
  items: InventoryItem[]
  loading: boolean
  searchTerm: string
  filterStatus: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalPages: number
  storeName?: string
  isAdmin: boolean
  onSearch: (query: string) => void
  onFilterChange: (status: string) => void
  onSortChange: (field: string, order: 'asc' | 'desc') => void
  onPageChange: (page: number) => void
  onUpdateInventory: (productId: string, variantId: string, newQuantity: number) => Promise<boolean>
  onBack: () => void
}

export const StockTracking: React.FC<StockTrackingProps> = ({
  items,
  loading,
  searchTerm,
  filterStatus,
  sortBy,
  sortOrder,
  currentPage,
  totalPages,
  storeName,
  isAdmin,
  onSearch,
  onFilterChange,
  onSortChange,
  onPageChange,
  onUpdateInventory,
  onBack
}) => {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [newQuantity, setNewQuantity] = useState<number>(0)
  const [updating, setUpdating] = useState(false)

  // Get status badge
  const getStockBadge = (item: InventoryItem) => {
    if (item.isOutOfStock) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (item.isLowStock) {
      return <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">Low Stock</Badge>
    }
    return <Badge variant="default" className="text-green-700 bg-green-100">In Stock</Badge>
  }

  // Handle sort click
  const handleSortClick = (field: string) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(field, 'asc')
    }
  }

  // Get sort icon
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  // Handle edit
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setNewQuantity(item.currentStock)
  }

  // Handle update
  const handleUpdate = async () => {
    if (!editingItem) return

    setUpdating(true)
    try {
      const success = await onUpdateInventory(editingItem.productId, editingItem.variantId, newQuantity)
      if (success) {
        setEditingItem(null)
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading inventory data...</p>
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Tracking</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Monitor inventory levels across all stores' : `Monitor inventory for ${storeName}`}
          </p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, variants, SKUs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => onSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Stock Status</Label>
            <Select value={filterStatus} onValueChange={onFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select 
              value={`${sortBy}-${sortOrder}`} 
              onValueChange={(value) => {
                const [field, order] = value.split('-')
                onSortChange(field, order as 'asc' | 'desc')
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="productName-asc">Product Name A-Z</SelectItem>
                <SelectItem value="productName-desc">Product Name Z-A</SelectItem>
                <SelectItem value="currentStock-asc">Stock Low-High</SelectItem>
                <SelectItem value="currentStock-desc">Stock High-Low</SelectItem>
                <SelectItem value="variantName-asc">Variant Name A-Z</SelectItem>
                <SelectItem value="sku-asc">SKU A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No inventory items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No items match your search criteria." : "No inventory items available."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSortClick('variantName')}
                      >
                        Variant {getSortIcon('variantName')}
                      </Button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSortClick('sku')}
                      >
                        SKU {getSortIcon('sku')}
                      </Button>
                    </th>
                    <th className="text-left p-4 font-medium">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium"
                        onClick={() => handleSortClick('currentStock')}
                      >
                        Stock {getSortIcon('currentStock')}
                      </Button>
                    </th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={`${item.productId}-${item.variantId}`} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.productName}
                              className="w-12 h-12 rounded object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            {isAdmin && item.storeName && (
                              <p className="text-sm text-muted-foreground">{item.storeName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{item.variantName}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-sm">{item.sku || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{item.currentStock}</p>
                          <p className="text-sm text-muted-foreground">
                            Threshold: {item.lowStockThreshold}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStockBadge(item)}
                        {item.isLowStock && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-yellow-600">Low stock</span>
                          </div>
                        )}
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
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Inventory</DialogTitle>
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
                              
                              <div className="space-y-2">
                                <Label htmlFor="quantity">New Quantity</Label>
                                <Input
                                  id="quantity"
                                  type="number"
                                  value={newQuantity}
                                  onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                                  min="0"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Current quantity: {item.currentStock}
                                </p>
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
                                  onClick={handleUpdate}
                                  disabled={updating}
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  {updating ? 'Updating...' : 'Update'}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
