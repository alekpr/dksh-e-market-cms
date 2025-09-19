import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3
} from 'lucide-react'
import { type Order } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderDetailViewProps {
  order: Order
  storeName: string
  isAdmin: boolean
  onUpdateStatus: (orderId: string, status: Order['status'], notes?: string) => void
  onAssignOrder: (orderId: string, assignedTo: string, notes?: string) => void
  onCancelOrder: (orderId: string, reason?: string) => void
  onBack: () => void
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
      return <Clock className="w-4 h-4" />
    case 'confirmed':
      return <AlertCircle className="w-4 h-4" />
    case 'processing':
      return <Package className="w-4 h-4" />
    case 'waiting_for_delivery':
      return <Clock className="w-4 h-4 text-indigo-600" />
    case 'shipped':
      return <Truck className="w-4 h-4" />
    case 'delivered':
      return <CheckCircle2 className="w-4 h-4" />
    case 'cancelled':
      return <XCircle className="w-4 h-4" />
    case 'refunded':
      return <XCircle className="w-4 h-4" />
    default:
      return <Package className="w-4 h-4" />
  }
}

export function OrderDetailView({
  order,
  storeName,
  isAdmin,
  onUpdateStatus,
  onCancelOrder,
  onBack,
}: OrderDetailViewProps) {
  // Local state for immediate UI updates
  const [currentOrder, setCurrentOrder] = useState(order)
  
  // Sync with prop changes
  useEffect(() => {
    setCurrentOrder(order)
  }, [order])

  const [newStatus, setNewStatus] = useState<Order['status']>(order.status)
  const [statusNotes, setStatusNotes] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  // Handle both 'customer' and 'user' properties from API
  const customer = currentOrder.customer 
    ? (typeof currentOrder.customer === 'string' 
       ? { name: 'Unknown', email: '', _id: currentOrder.customer } 
       : currentOrder.customer)
    : currentOrder.user 
      ? (typeof currentOrder.user === 'string'
         ? { name: 'Unknown', email: '', _id: currentOrder.user }
         : currentOrder.user)
      : { name: 'Unknown', email: '', _id: 'unknown' }

  const store = typeof currentOrder.store === 'string' 
    ? { name: 'Unknown Store', _id: currentOrder.store } 
    : currentOrder.store

  const handleStatusUpdate = () => {
    // Optimistic update for immediate UI feedback
    setCurrentOrder(prev => ({ ...prev, status: newStatus }))
    
    onUpdateStatus(order._id, newStatus, statusNotes)
    setIsStatusDialogOpen(false)
    setStatusNotes('')
  }

  const handleCancelOrder = () => {
    // Optimistic update for immediate UI feedback
    setCurrentOrder(prev => ({ ...prev, status: 'cancelled' }))
    
    onCancelOrder(order._id, cancelReason)
    setIsCancelDialogOpen(false)
    setCancelReason('')
  }

  const getAvailableStatusOptions = () => {
    const allStatuses: Order['status'][] = [
      'pending', 'confirmed', 'processing', 'waiting_for_delivery', 'shipped', 'delivered', 'cancelled'
    ]
    
    // Filter based on current status logic
    switch (currentOrder.status) {
      case 'pending':
        return ['confirmed', 'cancelled']
      case 'confirmed':
        return ['processing', 'cancelled']
      case 'processing':
        return ['waiting_for_delivery', 'cancelled']
      case 'waiting_for_delivery':
        return ['shipped', 'cancelled']
      case 'shipped':
        return ['delivered']
      case 'delivered':
        return [] // No further status changes
      case 'cancelled':
        return [] // No further status changes
      default:
        return allStatuses.filter(s => s !== currentOrder.status)
    }
  }

  const availableStatuses = getAvailableStatusOptions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{currentOrder.orderNumber}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(currentOrder.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-1 ${getStatusColor(currentOrder.status)}`}
          >
            {getStatusIcon(currentOrder.status)}
            {currentOrder.status}
          </Badge>
          
          {availableStatuses.length > 0 && (
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Order Status</DialogTitle>
                  <DialogDescription>
                    Change the status of order #{currentOrder.orderNumber}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">New Status</Label>
                    <Select value={newStatus} onValueChange={(value: Order['status']) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="Add any notes about this status change..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate}>
                    Update Status
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {['pending', 'confirmed', 'processing', 'waiting_for_delivery'].includes(currentOrder.status) && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Order</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel order #{currentOrder.orderNumber}?
                  </DialogDescription>
                </DialogHeader>
                
                <div>
                  <Label htmlFor="reason">Cancellation Reason</Label>
                  <Textarea
                    id="reason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                    Keep Order
                  </Button>
                  <Button variant="destructive" onClick={handleCancelOrder}>
                    Cancel Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                <p className="font-mono">{currentOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Date</p>
                <p>{formatDate(currentOrder.createdAt)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 w-fit ${getStatusColor(currentOrder.status)}`}
                >
                  {getStatusIcon(currentOrder.status)}
                  {currentOrder.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <Badge 
                  variant="outline" 
                  className={`w-fit ${getPaymentStatusColor(currentOrder.paymentStatus)}`}
                >
                  {currentOrder.paymentStatus}
                </Badge>
              </div>
            </div>

            {order.trackingNumber && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tracking Number</p>
                <p className="font-mono">{order.trackingNumber}</p>
              </div>
            )}

            {order.estimatedDelivery && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estimated Delivery</p>
                <p>{formatDate(order.estimatedDelivery)}</p>
              </div>
            )}

            {(order.notes || order.merchantNotes) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                {order.notes && (
                  <div className="mt-1">
                    <p className="text-sm font-medium">Customer Notes:</p>
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  </div>
                )}
                {order.merchantNotes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Merchant Notes:</p>
                    <p className="text-sm text-muted-foreground">{order.merchantNotes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{(customer as any).name || (customer as any).fullName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{customer.email}</p>
            </div>
            {isAdmin && store && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Store</p>
                <p>{store.name || storeName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.additionalInfo && (
                <p className="text-sm text-muted-foreground">{order.shippingAddress.additionalInfo}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p>{order.paymentMethod || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <Badge 
                  variant="outline" 
                  className={`w-fit ${getPaymentStatusColor(order.paymentStatus)}`}
                >
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
            
            {order.paymentId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                <p className="font-mono text-sm">{order.paymentId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>
            {order.items.length} item{order.items.length !== 1 ? 's' : ''} from this store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => {
              const product = typeof item.product === 'string' 
                ? { name: 'Unknown Product', _id: item.product } 
                : item.product
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground">Variant: {JSON.stringify(item.variant)}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          <Separator className="my-4" />
          
          {/* Order Summary - Show store-specific totals for merchants */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal (This Store)</span>
              <span>{formatCurrency((order as any).storeSubtotal || order.subtotal)}</span>
            </div>
            
            {!isAdmin && (order as any).storeShippingCost !== undefined && (
              <div className="flex justify-between">
                <span>Shipping (This Store)</span>
                <span>{formatCurrency((order as any).storeShippingCost)}</span>
              </div>
            )}
            
            {isAdmin && (
              <div className="flex justify-between">
                <span>Shipping (Total Order)</span>
                <span>{formatCurrency(order.shippingCost)}</span>
              </div>
            )}
            
            {!isAdmin && (order as any).storeTax !== undefined && (
              <div className="flex justify-between">
                <span>Tax (This Store)</span>
                <span>{formatCurrency((order as any).storeTax)}</span>
              </div>
            )}
            
            {isAdmin && (
              <div className="flex justify-between">
                <span>Tax (Total Order)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            
            {(order as any).storeDiscount !== undefined && (order as any).storeDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount (This Store)</span>
                <span>-{formatCurrency((order as any).storeDiscount)}</span>
              </div>
            )}
            
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total {!isAdmin ? '(This Store)' : ''}</span>
              <span>
                {formatCurrency(
                  !isAdmin && (order as any).storeTotal !== undefined
                    ? (order as any).storeTotal
                    : order.total || order.totalAmount || 0
                )}
              </span>
            </div>
            
            {!isAdmin && (order as any).storeTotal !== undefined && (
              <div className="text-sm text-muted-foreground text-right">
                Total order amount: {formatCurrency(order.total || order.totalAmount || 0)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
