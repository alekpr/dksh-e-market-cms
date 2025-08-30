import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Package, 
  ChevronLeft,
  Download,
  Upload,
  Save,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react'
import type { InventoryItem } from './use-inventory-management'

interface BulkUpdateProps {
  items: InventoryItem[]
  loading: boolean
  isAdmin: boolean
  storeName?: string
  onBack: () => void
  onBulkUpdate: (updates: Array<{ productId: string; variantId: string; newQuantity: number }>) => Promise<boolean>
}

interface BulkUpdateItem extends InventoryItem {
  selected: boolean
  newQuantity: number
  originalQuantity: number
}

export const BulkUpdate: React.FC<BulkUpdateProps> = ({
  items,
  loading,
  isAdmin,
  storeName,
  onBack,
  onBulkUpdate
}) => {
  const [bulkItems, setBulkItems] = useState<BulkUpdateItem[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [bulkQuantity, setBulkQuantity] = useState<string>('')
  const [adjustmentType, setAdjustmentType] = useState<'set' | 'increase' | 'decrease'>('set')
  const [notes, setNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [csvData, setCsvData] = useState('')

  // Initialize bulk items when items change
  React.useEffect(() => {
    setBulkItems(items.map(item => ({
      ...item,
      selected: false,
      newQuantity: item.currentStock,
      originalQuantity: item.currentStock
    })))
  }, [items])

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    setBulkItems(bulkItems.map(item => ({ ...item, selected: checked })))
  }

  // Handle individual selection
  const handleSelectItem = (index: number, checked: boolean) => {
    const newItems = [...bulkItems]
    newItems[index].selected = checked
    setBulkItems(newItems)
    
    // Update select all checkbox
    const allSelected = newItems.every(item => item.selected)
    const noneSelected = newItems.every(item => !item.selected)
    setSelectAll(allSelected ? true : noneSelected ? false : false)
  }

  // Handle quantity change for individual item
  const handleQuantityChange = (index: number, value: string) => {
    const newItems = [...bulkItems]
    newItems[index].newQuantity = parseInt(value) || 0
    setBulkItems(newItems)
  }

  // Apply bulk quantity change
  const applyBulkQuantity = () => {
    if (!bulkQuantity) return

    const quantity = parseInt(bulkQuantity)
    if (isNaN(quantity)) return

    const newItems = [...bulkItems]
    newItems.forEach(item => {
      if (item.selected) {
        switch (adjustmentType) {
          case 'set':
            item.newQuantity = quantity
            break
          case 'increase':
            item.newQuantity = item.originalQuantity + quantity
            break
          case 'decrease':
            item.newQuantity = Math.max(0, item.originalQuantity - quantity)
            break
        }
      }
    })
    setBulkItems(newItems)
  }

  // Export to CSV
  const exportToCsv = () => {
    const csvContent = [
      'Product,Variant,SKU,Current Stock,Low Stock Threshold',
      ...bulkItems.map(item => 
        `"${item.productName}","${item.variantName}","${item.sku || ''}",${item.currentStock},${item.lowStockThreshold}`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${isAdmin ? 'all-stores' : storeName}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import from CSV
  const handleCsvImport = () => {
    if (!csvData.trim()) return

    try {
      const lines = csvData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      
      const newItems = [...bulkItems]
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
        const sku = values[headers.indexOf('SKU')]
        const newQuantity = parseInt(values[headers.indexOf('New Stock')] || values[headers.indexOf('Current Stock')])
        
        if (sku && !isNaN(newQuantity)) {
          const itemIndex = newItems.findIndex(item => item.sku === sku)
          if (itemIndex !== -1) {
            newItems[itemIndex].newQuantity = newQuantity
            newItems[itemIndex].selected = true
          }
        }
      }
      
      setBulkItems(newItems)
      setCsvData('')
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Error parsing CSV. Please check the format.')
    }
  }

  // Submit bulk update
  const handleBulkUpdate = async () => {
    const selectedItems = bulkItems.filter(item => item.selected && item.newQuantity !== item.originalQuantity)
    
    if (selectedItems.length === 0) {
      alert('No items selected or no changes made.')
      return
    }

    setUpdating(true)
    try {
      const updates = selectedItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        newQuantity: item.newQuantity
      }))

      const success = await onBulkUpdate(updates)
      if (success) {
        // Reset form
        setBulkItems(bulkItems.map(item => ({
          ...item,
          selected: false,
          originalQuantity: item.newQuantity
        })))
        setSelectAll(false)
        setBulkQuantity('')
        setNotes('')
        alert(`Successfully updated ${updates.length} items.`)
      } else {
        alert('Some updates failed. Please check and try again.')
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
      alert('Failed to update inventory. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const selectedCount = bulkItems.filter(item => item.selected).length
  const changedCount = bulkItems.filter(item => item.selected && item.newQuantity !== item.originalQuantity).length

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
          <h1 className="text-3xl font-bold tracking-tight">Bulk Update</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Update inventory levels across all stores' : `Update inventory for ${storeName}`}
          </p>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Quantity Update */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Bulk Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Action Type</Label>
                <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="set">Set to Value</SelectItem>
                    <SelectItem value="increase">Increase by</SelectItem>
                    <SelectItem value="decrease">Decrease by</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  min="0"
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <Button 
              onClick={applyBulkQuantity} 
              className="w-full"
              disabled={!bulkQuantity || selectedCount === 0}
            >
              Apply to {selectedCount} Selected Items
            </Button>
          </CardContent>
        </Card>

        {/* CSV Import/Export */}
        <Card>
          <CardHeader>
            <CardTitle>Import/Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCsv} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => setCsvData('')} className="flex-1">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-import">Import CSV Data</Label>
              <Textarea
                id="csv-import"
                placeholder="Paste CSV data here..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={handleCsvImport} 
              className="w-full"
              disabled={!csvData.trim()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium">
                  {selectedCount} items selected, {changedCount} with changes
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAll(false)}
                >
                  Clear Selection
                </Button>
                <Button
                  onClick={handleBulkUpdate}
                  disabled={changedCount === 0 || updating}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updating ? 'Updating...' : `Update ${changedCount} Items`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all">Select All ({bulkItems.length})</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {bulkItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No inventory items found</h3>
              <p className="text-muted-foreground">No inventory items available for bulk update.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium">Variant</th>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Current</th>
                    <th className="text-left p-4 font-medium">New Quantity</th>
                    <th className="text-left p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bulkItems.map((item, index) => (
                    <tr 
                      key={`${item.productId}-${item.variantId}`} 
                      className={`border-b hover:bg-muted/50 ${item.selected ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-4">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={(checked) => handleSelectItem(index, checked as boolean)}
                        />
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
                      </td>
                      <td className="p-4">
                        <p className="font-mono text-xs">{item.sku || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-center">
                          <p className="font-medium">{item.originalQuantity}</p>
                          {item.isLowStock && (
                            <div className="flex items-center gap-1 justify-center">
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600">Low</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Input
                          type="number"
                          value={item.newQuantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          min="0"
                          className={`w-20 text-center ${item.newQuantity !== item.originalQuantity ? 'border-blue-500' : ''}`}
                          disabled={!item.selected}
                        />
                      </td>
                      <td className="p-4">
                        {item.newQuantity !== item.originalQuantity ? (
                          <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                            Changed
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            No Change
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Update Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about this bulk update (optional)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  )
}
