import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  RefreshCw,
  Search,
  Truck,
  XCircle,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import { type Order } from '@/lib/api'
import { type OrderStats } from '@/hooks/use-order-management'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderListViewProps {
  orders: Order[]
  loading: boolean
  searchTerm: string
  filterStatus: string
  filterPaymentStatus: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  currentPage: number
  totalPages: number
  orderStats: OrderStats
  storeName: string
  isAdmin: boolean
  merchantStoreId?: string // Add merchant store ID for store-specific functionality
  onView: (order: Order) => void
  onUpdateStatus: (orderId: string, status: Order['status'], notes?: string) => void
  onAssignOrder: (orderId: string, assignedTo: string, notes?: string) => void
  onCancelOrder: (orderId: string, reason?: string) => void
  onSearch: (term: string) => void
  onFilterStatusChange: (status: string) => void
  onFilterPaymentStatusChange: (status: string) => void
  onSortChange: (field: string, order: 'asc' | 'desc') => void
  onPageChange: (page: number) => void
}

// Helper function to get store order status for merchants
const getStoreOrderStatus = (order: Order, merchantStoreId: string | undefined, isAdmin: boolean): Order['status'] => {
  if (isAdmin || !merchantStoreId) {
    return order.status
  }
  
  // Find the store order for this merchant's store
  const storeOrder = order.storeOrders?.find(so => {
    const storeId = so.store && typeof so.store === 'object' ? (so.store as any)._id : so.store
    return storeId === merchantStoreId
  })
  
  return (storeOrder?.status as Order['status']) || order.status
}

// Helper function to check if merchant can perform actions on their store order
const canPerformStoreAction = (order: Order, merchantStoreId: string | undefined, isAdmin: boolean, targetStatus: Order['status']): boolean => {
  if (isAdmin) {
    return true
  }
  
  if (!merchantStoreId) {
    return false
  }
  
  const currentStoreStatus = getStoreOrderStatus(order, merchantStoreId, isAdmin)
  
  // Define valid transitions for store orders
  const validTransitions: Record<Order['status'], Order['status'][]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['waiting_for_delivery', 'cancelled'],
    'waiting_for_delivery': ['shipped'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': [],
    'refunded': []
  }
  
  return validTransitions[currentStoreStatus]?.includes(targetStatus) || false
}

// Helper function to calculate stats from store orders for merchants
const calculateStoreStats = (orders: Order[], merchantStoreId: string | undefined, isAdmin: boolean): OrderStats => {
  const stats: OrderStats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    waiting_for_delivery: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0
  }

  if (isAdmin || !merchantStoreId) {
    // For admin, use the provided orderStats (calculated from main orders)
    return stats // Will be overridden by props
  }

  // For merchants, calculate stats from store orders
  orders.forEach((order) => {
    const storeOrder = order.storeOrders?.find(so => {
      const storeId = so.store && typeof so.store === 'object' ? (so.store as any)._id : so.store
      return storeId === merchantStoreId
    })

    if (storeOrder) {
      stats.total++
      const status = storeOrder.status as Order['status']
      
      switch (status) {
        case 'pending':
          stats.pending++
          break
        case 'confirmed':
          stats.confirmed++
          break
        case 'processing':
          stats.processing++
          break
        case 'waiting_for_delivery':
          stats.waiting_for_delivery++
          break
        case 'shipped':
          stats.shipped++
          break
        case 'delivered':
          stats.delivered++
          break
        case 'cancelled':
          stats.cancelled++
          break
        case 'refunded':
          stats.refunded++
          break
      }
    }
  })

  return stats
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'processing':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'waiting_for_delivery':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    case 'shipped':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPaymentStatusColor = (status: Order['paymentStatus']) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'refunded':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'partially_refunded':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-3 h-3" />
    case 'confirmed':
      return <AlertCircle className="w-3 h-3" />
    case 'processing':
      return <Package className="w-3 h-3" />
    case 'waiting_for_delivery':
      return <Clock className="w-3 h-3 text-indigo-600" />
    case 'shipped':
      return <Truck className="w-3 h-3" />
    case 'delivered':
      return <CheckCircle2 className="w-3 h-3" />
    case 'cancelled':
      return <XCircle className="w-3 h-3" />
    case 'refunded':
      return <XCircle className="w-3 h-3" />
    default:
      return <Package className="w-3 h-3" />
  }
}

export function OrderListView({
  orders,
  loading,
  searchTerm,
  filterStatus,
  filterPaymentStatus,
  currentPage,
  totalPages,
  orderStats,
  storeName,
  isAdmin,
  merchantStoreId,
  onView,
  onUpdateStatus,
  onCancelOrder,
  onSearch,
  onFilterStatusChange,
  onFilterPaymentStatusChange,
  onPageChange,
}: OrderListViewProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    order: Order | null
    newStatus: Order['status'] | null
    title: string
    description: string
  }>({
    open: false,
    order: null,
    newStatus: null,
    title: '',
    description: ''
  })

  // Calculate store-specific stats for merchants
  const displayStats = isAdmin 
    ? orderStats 
    : calculateStoreStats(orders, merchantStoreId, isAdmin)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearchTerm)
  }

  const getStatusDisplayName = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'confirmed':
        return 'Confirmed'
      case 'processing':
        return 'Processing'
      case 'waiting_for_delivery':
        return 'Waiting for Delivery'
      case 'shipped':
        return 'Shipped'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      case 'refunded':
        return 'Refunded'
      default:
        return status
    }
  }

  const showStatusUpdateConfirmation = (order: Order, newStatus: Order['status']) => {
    const currentStatus = getStoreOrderStatus(order, merchantStoreId, isAdmin)
    const orderType = isAdmin ? 'order' : 'store order'
    
    let title = ''
    let description = ''

    switch (newStatus) {
      case 'confirmed':
        title = `Confirm ${orderType.charAt(0).toUpperCase() + orderType.slice(1)}`
        description = `Are you sure you want to confirm ${orderType} #${order.orderNumber}? This action will change the status from "${getStatusDisplayName(currentStatus)}" to "Confirmed".`
        break
      case 'processing':
        title = `Start Processing`
        description = `Are you sure you want to start processing ${orderType} #${order.orderNumber}? This will change the status from "${getStatusDisplayName(currentStatus)}" to "Processing".`
        break
      case 'waiting_for_delivery':
        title = `Ready for Delivery`
        description = `Are you sure ${orderType} #${order.orderNumber} is ready for delivery? This will change the status from "${getStatusDisplayName(currentStatus)}" to "Waiting for Delivery".`
        break
      case 'shipped':
        title = `Mark as Shipped`
        description = `Are you sure you want to mark ${orderType} #${order.orderNumber} as shipped? This will change the status from "${getStatusDisplayName(currentStatus)}" to "Shipped".`
        break
      case 'delivered':
        title = `Mark as Delivered`
        description = `Are you sure you want to mark ${orderType} #${order.orderNumber} as delivered? This will change the status from "${getStatusDisplayName(currentStatus)}" to "Delivered".`
        break
      case 'cancelled':
        title = `Cancel ${orderType.charAt(0).toUpperCase() + orderType.slice(1)}`
        description = `Are you sure you want to cancel ${orderType} #${order.orderNumber}? This action cannot be undone.`
        break
      default:
        title = `Update Status`
        description = `Are you sure you want to update the status of ${orderType} #${order.orderNumber} to "${getStatusDisplayName(newStatus)}"?`
    }

    setConfirmDialog({
      open: true,
      order,
      newStatus,
      title,
      description
    })
  }

  const handleQuickStatusUpdate = (order: Order, newStatus: Order['status']) => {
    showStatusUpdateConfirmation(order, newStatus)
  }

  const confirmStatusUpdate = () => {
    if (confirmDialog.order && confirmDialog.newStatus) {
      if (confirmDialog.newStatus === 'cancelled') {
        onCancelOrder(confirmDialog.order._id)
      } else {
        onUpdateStatus(confirmDialog.order._id, confirmDialog.newStatus)
      }
      setConfirmDialog({
        open: false,
        order: null,
        newStatus: null,
        title: '',
        description: ''
      })
    }
  }

  const cancelStatusUpdate = () => {
    setConfirmDialog({
      open: false,
      order: null,
      newStatus: null,
      title: '',
      description: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Manage all orders across the platform' : `Manage orders for ${storeName}`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total {!isAdmin ? '(Store)' : ''}
                </p>
                <p className="text-2xl font-bold">{displayStats.total}</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{displayStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{displayStats.confirmed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-orange-600">{displayStats.processing}</p>
              </div>
              <Package className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Waiting for Delivery</p>
                <p className="text-2xl font-bold text-indigo-600">{displayStats.waiting_for_delivery}</p>
              </div>
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">{displayStats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{displayStats.delivered}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{displayStats.cancelled}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refunded</p>
                <p className="text-2xl font-bold text-gray-600">{displayStats.refunded}</p>
              </div>
              <RotateCcw className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search orders by number, customer, or items..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </form>
            
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="waiting_for_delivery">Waiting for Delivery</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPaymentStatus} onValueChange={onFilterPaymentStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Payment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {orders.length} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' || filterPaymentStatus !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'No orders have been placed yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    // Handle both 'customer' and 'user' properties from API
                    const customer = order.customer 
                      ? (typeof order.customer === 'string' 
                         ? { name: 'Unknown', email: '' } 
                         : order.customer)
                      : order.user 
                        ? (typeof order.user === 'string'
                           ? { name: 'Unknown', email: '' }
                           : order.user)
                        : { name: 'Unknown', email: '' }

                    // Get the actual status to display (store order status for merchants, main order status for admins)
                    const displayStatus = getStoreOrderStatus(order, merchantStoreId, isAdmin)
                    
                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{(customer as any).name || (customer as any).fullName || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{customer.email || ''}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {/* Show store-specific total for merchants, full total for admins */}
                          {formatCurrency(
                            !isAdmin && (order as any).storeTotal !== undefined
                              ? (order as any).storeTotal
                              : order.total || order.totalAmount || 0
                          )}
                          {!isAdmin && (order as any).storeTotal !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              (Store portion)
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`flex items-center gap-1 w-fit ${getStatusColor(displayStatus)}`}
                          >
                            {getStatusIcon(displayStatus)}
                            {displayStatus.replace('_', ' ')}
                          </Badge>
                          {!isAdmin && displayStatus !== order.status && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Main order: {order.status}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`w-fit ${getPaymentStatusColor(order.paymentStatus)}`}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onView(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              
                              {/* Use store-specific status for action conditions */}
                              {displayStatus === 'pending' && canPerformStoreAction(order, merchantStoreId, isAdmin, 'confirmed') && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusUpdate(order, 'confirmed')}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Confirm {isAdmin ? 'Order' : 'Store Order'}
                                </DropdownMenuItem>
                              )}
                              
                              {displayStatus === 'confirmed' && canPerformStoreAction(order, merchantStoreId, isAdmin, 'processing') && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusUpdate(order, 'processing')}
                                >
                                  <Package className="mr-2 h-4 w-4" />
                                  Start Processing
                                </DropdownMenuItem>
                              )}
                              
                              {displayStatus === 'processing' && canPerformStoreAction(order, merchantStoreId, isAdmin, 'waiting_for_delivery') && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusUpdate(order, 'waiting_for_delivery')}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  Ready for Delivery
                                </DropdownMenuItem>
                              )}
                              
                              {displayStatus === 'waiting_for_delivery' && canPerformStoreAction(order, merchantStoreId, isAdmin, 'shipped') && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusUpdate(order, 'shipped')}
                                >
                                  <Truck className="mr-2 h-4 w-4" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                              )}
                              
                              {displayStatus === 'shipped' && canPerformStoreAction(order, merchantStoreId, isAdmin, 'delivered') && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusUpdate(order, 'delivered')}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Mark as Delivered
                                </DropdownMenuItem>
                              )}
                              
                              {displayStatus !== 'delivered' && displayStatus !== 'cancelled' && canPerformStoreAction(order, merchantStoreId, isAdmin, 'cancelled') && (
                                <DropdownMenuItem 
                                  onClick={() => showStatusUpdateConfirmation(order, 'cancelled')}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel {isAdmin ? 'Order' : 'Store Order'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && cancelStatusUpdate()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelStatusUpdate}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmStatusUpdate}
              className={confirmDialog.newStatus === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {confirmDialog.newStatus === 'cancelled' ? 'Yes, Cancel Order' : 'Confirm Update'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
