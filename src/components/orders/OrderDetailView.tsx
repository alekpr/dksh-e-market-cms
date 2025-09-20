import { useState, useEffect, useCallback } from 'react'
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
import { type Order, orderApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'

interface OrderDetailViewProps {
  order: Order
  storeName: string
  isAdmin: boolean
  merchantStoreId?: string // Add merchant store ID for store-specific functionality
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

// Helper function to get store order data for merchants
const getStoreOrderData = (order: Order, merchantStoreId: string | undefined, isAdmin: boolean) => {
  console.log('🏪 getStoreOrderData called:', { isAdmin, merchantStoreId, hasStoreOrders: !!order.storeOrders });
  
  if (isAdmin || !merchantStoreId) {
    console.log('🏪 Using admin/main order data');
    return {
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      total: order.total || order.totalAmount,
      notes: order.merchantNotes
    }
  }
  
  // Find the store order for this merchant's store
  const storeOrder = order.storeOrders?.find(so => {
    const storeId = so.store && typeof so.store === 'object' ? (so.store as any)._id : so.store
    console.log('🏪 Checking store order:', { storeId, merchantStoreId, match: storeId === merchantStoreId });
    return storeId === merchantStoreId
  })
  
  console.log('🏪 Found store order:', storeOrder);
  
  if (storeOrder) {
    console.log('🏪 Store order items:', storeOrder.items);
    console.log('🏪 Main order items:', order.items);
    console.log('🏪 Detailed main order items check:');
    order.items.forEach((item: any, index: number) => {
      console.log(`🏪 Main Item ${index + 1}:`, {
        productName: item.product?.name,
        hasVariant: !!item.variant,
        hasVariantInfo: !!item.variantInfo,
        variantInfo: item.variantInfo,
        fullItem: item
      });
    });
    
    // Store order items have minimal data (just IDs), we need to match them with main order items
    // to get the complete product info and variantInfo
    const enrichedItems = storeOrder.items?.map((storeItem: any) => {
      // Find matching item in main order by product and variant IDs
      const mainItem = order.items.find((mainItem: any) => {
        const productMatch = (typeof mainItem.product === 'string' ? mainItem.product : mainItem.product?._id) === storeItem.product;
        const variantMatch = (typeof mainItem.variant === 'string' ? mainItem.variant : mainItem.variant?._id) === storeItem.variant;
        return productMatch && variantMatch;
      });
      
      console.log('🔗 Matching store item with main item:', {
        storeProduct: storeItem.product,
        storeVariant: storeItem.variant,
        foundMainItem: !!mainItem,
        mainItemHasVariantInfo: !!mainItem?.variantInfo
      });
      
      // Use main item data with store-specific pricing/quantities if available
      return mainItem ? {
        ...mainItem,
        // Override with store-specific data if different
        quantity: storeItem.quantity || mainItem.quantity,
        price: storeItem.price || mainItem.price,
        totalPrice: storeItem.totalPrice || (storeItem.quantity * storeItem.price)
      } : storeItem; // Fallback to store item if no match found
    }) || order.items;
    
    console.log('🏪 Enriched items:', enrichedItems);
    
    return {
      status: storeOrder.status as Order['status'],
      items: enrichedItems,
      subtotal: storeOrder.subtotal || (order as any).storeSubtotal,
      shippingCost: (storeOrder as any).shippingCost || (order as any).storeShippingCost,
      tax: (storeOrder as any).tax || (order as any).storeTax,
      total: (storeOrder as any).total || (order as any).storeTotal,
      notes: (storeOrder as any).notes || order.merchantNotes
    }
  }
  
  console.log('🏪 No store order found, using fallback main order data');
  // Fallback to main order data
  return {
    status: order.status,
    items: order.items,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    tax: order.tax,
    total: order.total || order.totalAmount,
    notes: order.merchantNotes
  }
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

export function OrderDetailView({
  order,
  storeName,
  isAdmin,
  merchantStoreId,
  onUpdateStatus,
  onCancelOrder,
  onBack,
}: OrderDetailViewProps) {
  // Auth context
  const { user, userStore } = useAuth()
  
  // Local state for immediate UI updates
  const [currentOrder, setCurrentOrder] = useState(() => {
    console.log('🏁 OrderDetailView initializing with order prop:', order);
    console.log('🏁 Initial order items variantInfo check:');
    order.items?.forEach((item: any, index: number) => {
      console.log(`🏁 Initial Item ${index + 1}:`, {
        productName: item.product?.name,
        hasVariant: !!item.variant,
        hasVariantInfo: !!item.variantInfo,
        variantInfo: item.variantInfo
      });
    });
    return order;
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch fresh order detail from API
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!order._id) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        console.log('🔍 Fetching order detail for ID:', order._id)
        console.log('🔐 Current user role/context:', { isAdmin, merchantStoreId })
        
        // Debug current auth context
        const token = localStorage.getItem('access_token');
        console.log('🔑 Current token exists:', !!token);
        if (token) {
          console.log('🔑 Token preview:', token.substring(0, 20) + '...');
        }
        
        // Debug user context
        console.log('👤 Current user context:', {
          userId: user?._id,
          userEmail: user?.email,
          userRole: user?.role,
          merchantStoreId: user?.merchantInfo?.storeId,
          isAdmin,
          hasUserStore: !!userStore,
          userStoreId: userStore?._id
        });
        
        // Use cache busting parameter for fresh data
        const response = await orderApi.getOrder(order._id, true)
        if (response?.data?.data) {
          console.log('✅ Fresh order detail loaded:', response.data.data)
          console.log('🔍 Fresh order items variantInfo check:');
          response.data.data.items?.forEach((item: any, index: number) => {
            console.log(`🔍 Fresh Item ${index + 1}:`, {
              productName: item.product?.name,
              hasVariant: !!item.variant,
              hasVariantInfo: !!item.variantInfo,
              variantInfo: item.variantInfo
            });
          });
          
          setCurrentOrder(response.data.data)
          console.log('🔄 State updated with fresh data');
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch order detail:', err)
        console.error('❌ Error status:', err.status)
        console.error('❌ Error data:', err.data)
        console.error('❌ Error response details:', {
          name: err?.name,
          message: err?.message,
          response: err?.response,
          request: err?.request
        })
        setError(`Failed to load order details: ${err.message}`)
        // Fallback to prop data if API fails
        setCurrentOrder(order)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrderDetail()
  }, [order._id, isAdmin, merchantStoreId, user, userStore])
  
  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (!order?._id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Manual refresh triggered for order:', order._id)
      
      // Use cache busting parameter
      const response = await orderApi.getOrder(order._id, true)
      
      console.log('🔍 Raw API Response:', response)
      console.log('🔍 Response Data:', response?.data)
      console.log('🔍 Order Data (checking all paths):', {
        directData: response?.data,
        nestedData: (response?.data as any)?.data,
        orderKey: (response?.data as any)?.order
      })
      
      // Based on logs showing {order: {...}}, the data is at response.data.order
      const orderData = ((response?.data as any)?.order || (response?.data as any)?.data || response?.data) as any
      
      if (orderData && orderData.items) {
        // Log raw items before setting state
        console.log('🛍️ Raw API Items:', orderData.items)
        
        // Deep copy the response to avoid reference issues
        const copiedOrderData = JSON.parse(JSON.stringify(orderData))
        console.log('🔄 Deep copied order data:', copiedOrderData)
        
        setCurrentOrder(copiedOrderData)
        console.log('✅ Manual refresh completed:', copiedOrderData)
        console.log('🔒 Manual refresh flag set - preventing prop override')
        
        // Debug variant info after refresh
        if (orderData.items) {
          console.log('� Fresh order items variantInfo check:')
          orderData.items.forEach((item: any, index: number) => {
            console.log(`🔍 Fresh Item ${index + 1}: ${item.product?.name}`)
            console.log(`  - hasVariant: ${!!item.variant}`)
            console.log(`  - hasVariantInfo: ${!!item.variantInfo}`)
            console.log(`  - variantInfo:`, item.variantInfo)
          })
        }
      }
    } catch (err: any) {
      console.error('❌ Manual refresh failed:', err)
      setError(`Failed to refresh order details: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [order._id])
  
  // Sync with prop changes as fallback (but don't override manual refresh)
  useEffect(() => {
    if (!isLoading) {
      console.log('🔄 Prop sync check:', {
        hasCurrentOrder: !!currentOrder,
        orderHasItems: !!order?.items,
        currentOrderHasItems: !!currentOrder?.items,
        currentOrderItemsLength: currentOrder?.items?.length,
        orderItemsLength: order?.items?.length
      })
      
      // Only sync from props if currentOrder is empty or has fewer items
      // This prevents overriding fresh data from manual refresh
      if (!currentOrder?.items || (order?.items && order.items.length > currentOrder.items.length)) {
        console.log('🔄 Syncing from props to currentOrder')
        setCurrentOrder(order)
      } else {
        console.log('🔒 Keeping currentOrder (has better data)')
      }
    }
  }, [order, isLoading, currentOrder?.items?.length])

  // Get store-specific data for display
  const storeOrderData = getStoreOrderData(currentOrder, merchantStoreId, isAdmin)
  const displayStatus = getStoreOrderStatus(currentOrder, merchantStoreId, isAdmin)

  const [newStatus, setNewStatus] = useState<Order['status']>(displayStatus)
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

  // Helper function to format payment method display
  const getPaymentMethodDisplay = (order: Order) => {
    const method = order.payment?.method || order.paymentMethod
    
    if (!method) return 'Not specified'
    
    // Format common payment methods for better display
    switch (method.toLowerCase()) {
      case 'credit_card':
      case 'credit-card':
      case 'creditcard':
        return 'Credit Card'
      case 'debit_card':
      case 'debit-card':
      case 'debitcard':
        return 'Debit Card'
      case 'bank_transfer':
      case 'bank-transfer':
      case 'banktransfer':
        return 'Bank Transfer'
      case 'mobile_banking':
      case 'mobile-banking':
      case 'mobilebanking':
        return 'Mobile Banking'
      case 'qr_code':
      case 'qr-code':
      case 'qrcode':
        return 'QR Code Payment'
      case 'cash_on_delivery':
      case 'cash-on-delivery':
      case 'cod':
        return 'Cash on Delivery'
      case 'wallet':
        return 'Digital Wallet'
      case 'promptpay':
        return 'PromptPay'
      case 'truemoney':
        return 'TrueMoney Wallet'
      case 'rabbit_line_pay':
      case 'rabbit-line-pay':
        return 'Rabbit LINE Pay'
      default:
        // Capitalize first letter and replace underscores/hyphens with spaces
        return method
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const handleStatusUpdate = () => {
    // Optimistic update for immediate UI feedback
    // For merchants, we'll update the store order status
    if (!isAdmin && merchantStoreId) {
      // Update the store order status optimistically
      setCurrentOrder(prev => {
        const updatedOrder = { ...prev }
        if (updatedOrder.storeOrders) {
          updatedOrder.storeOrders = updatedOrder.storeOrders.map(so => {
            const storeId = so.store && typeof so.store === 'object' ? (so.store as any)._id : so.store
            if (storeId === merchantStoreId) {
              return { ...so, status: newStatus }
            }
            return so
          })
        }
        return updatedOrder
      })
    } else {
      // For admin, update main order status
      setCurrentOrder(prev => ({ ...prev, status: newStatus }))
    }
    
    onUpdateStatus(order._id, newStatus, statusNotes)
    setIsStatusDialogOpen(false)
    setStatusNotes('')
  }

  const handleCancelOrder = () => {
    // Optimistic update for immediate UI feedback
    if (!isAdmin && merchantStoreId) {
      // Update the store order status optimistically
      setCurrentOrder(prev => {
        const updatedOrder = { ...prev }
        if (updatedOrder.storeOrders) {
          updatedOrder.storeOrders = updatedOrder.storeOrders.map(so => {
            const storeId = so.store && typeof so.store === 'object' ? (so.store as any)._id : so.store
            if (storeId === merchantStoreId) {
              return { ...so, status: 'cancelled' }
            }
            return so
          })
        }
        return updatedOrder
      })
    } else {
      // For admin, update main order status
      setCurrentOrder(prev => ({ ...prev, status: 'cancelled' }))
    }
    
    onCancelOrder(order._id, cancelReason)
    setIsCancelDialogOpen(false)
    setCancelReason('')
  }

  const getAvailableStatusOptions = () => {
    // Filter based on current status logic using store order status for merchants
    const currentStatus = displayStatus
    
    switch (currentStatus) {
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
        return ['pending', 'confirmed', 'processing', 'waiting_for_delivery', 'shipped', 'delivered', 'cancelled'].filter(s => s !== currentStatus)
    }
  }

  const availableStatuses = getAvailableStatusOptions().filter(status => 
    canPerformStoreAction(currentOrder, merchantStoreId, isAdmin, status as Order['status'])
  )

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Details</h2>
        <button
          onClick={() => {
            console.log('🔄 REFRESH BUTTON CLICKED!');
            handleRefresh();
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 text-white border rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? '🔄 Refreshing...' : '🔄 Refresh Order Data'}
        </button>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading order details...
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      
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
            className={`flex items-center gap-1 ${getStatusColor(displayStatus)}`}
          >
            {getStatusIcon(displayStatus)}
            {displayStatus.replace('_', ' ')}
          </Badge>
          {!isAdmin && displayStatus !== currentOrder.status && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Main: {currentOrder.status}
            </Badge>
          )}
          
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
          
          {['pending', 'confirmed', 'processing', 'waiting_for_delivery'].includes(displayStatus) && (
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel {isAdmin ? 'Order' : 'Store Order'}
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
                <p className="text-sm font-medium text-muted-foreground">
                  Status {!isAdmin ? '(Store)' : ''}
                </p>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 w-fit ${getStatusColor(displayStatus)}`}
                >
                  {getStatusIcon(displayStatus)}
                  {displayStatus.replace('_', ' ')}
                </Badge>
                {!isAdmin && displayStatus !== currentOrder.status && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Main order: {currentOrder.status}
                  </p>
                )}
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
                <p>{getPaymentMethodDisplay(order)}</p>
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
            
            {order.payment?.amount && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Amount</p>
                  <p>{formatCurrency(order.payment.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Currency</p>
                  <p>{order.payment.currency || 'THB'}</p>
                </div>
              </div>
            )}
            
            {order.paymentId && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                <p className="font-mono text-sm">{order.paymentId}</p>
              </div>
            )}
            
            {order.payment && order.payment.refundedAmount > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refunded Amount</p>
                <p className="text-red-600">{formatCurrency(order.payment.refundedAmount)}</p>
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
            {storeOrderData.items.length} item{storeOrderData.items.length !== 1 ? 's' : ''} {!isAdmin ? 'from this store' : 'in this order'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storeOrderData.items.map((item, index) => {
              // Type guard to handle both OrderItem and store order item types
              const orderItem = typeof item === 'string' ? null : item as any;
              if (!orderItem) return null;
              
              const product = typeof orderItem.product === 'string' 
                ? { name: 'Unknown Product', _id: orderItem.product } 
                : orderItem.product
              
              // Debug: Log item data to console in development
              if (process.env.NODE_ENV === 'development') {
                console.log('Order Item:', { 
                  index, 
                  productName: product.name, 
                  hasVariant: !!orderItem.variant,
                  hasVariantInfo: !!orderItem.variantInfo,
                  variantInfo: orderItem.variantInfo,
                  variant: orderItem.variant,
                  packageDisplay: orderItem.variantInfo ? {
                    packageType: orderItem.variantInfo.packageType,
                    packageUnit: orderItem.variantInfo.packageUnit,
                    packageQuantity: orderItem.variantInfo.packageQuantity,
                    displayText: `${orderItem.variantInfo.packageQuantity || 1} ${orderItem.variantInfo.packageUnit || orderItem.variantInfo.packageType}`
                  } : 'No variantInfo'
                });
              }
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    {/* Package Type Information */}
                    {orderItem.variantInfo ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {orderItem.variantInfo.packageType && (
                          <p className="font-medium text-blue-600">
                            📦 {orderItem.variantInfo.packageQuantity || 1} {orderItem.variantInfo.packageUnit || orderItem.variantInfo.packageType} 
                            <span className="text-gray-500"> ({orderItem.variantInfo.packageType})</span>
                          </p>
                        )}
                        {orderItem.variantInfo.name && orderItem.variantInfo.name !== 'Default' && (
                          <p>Variant: {orderItem.variantInfo.name}</p>
                        )}
                        {orderItem.variantInfo.attributes && Object.keys(orderItem.variantInfo.attributes).length > 0 && (
                          <p>Attributes: {Object.entries(orderItem.variantInfo.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
                        )}
                        {/* Show price difference if exists */}
                        {orderItem.variantInfo.price !== orderItem.price && (
                          <p className="text-xs text-orange-600">
                            Ordered at: {formatCurrency(orderItem.price)} (Original: {formatCurrency(orderItem.variantInfo.price)})
                          </p>
                        )}
                      </div>
                    ) : orderItem.variant && (
                      <p className="text-sm text-red-500">⚠️ Package info missing - ID: {typeof orderItem.variant === 'string' ? orderItem.variant : orderItem.variant._id}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Quantity: {orderItem.quantity} × {formatCurrency(orderItem.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(orderItem.price * orderItem.quantity)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          <Separator className="my-4" />
          
          {/* Order Summary - Show store-specific totals for merchants */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal {!isAdmin ? '(This Store)' : ''}</span>
              <span>{formatCurrency(storeOrderData.subtotal || 0)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Shipping {!isAdmin ? '(This Store)' : ''}</span>
              <span>{formatCurrency(storeOrderData.shippingCost || 0)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Tax {!isAdmin ? '(This Store)' : ''}</span>
              <span>{formatCurrency(storeOrderData.tax || 0)}</span>
            </div>
            
            {(order as any).storeDiscount !== undefined && (order as any).storeDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {!isAdmin ? '(This Store)' : ''}</span>
                <span>-{formatCurrency((order as any).storeDiscount)}</span>
              </div>
            )}
            
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total {!isAdmin ? '(This Store)' : ''}</span>
              <span>{formatCurrency(storeOrderData.total || 0)}</span>
            </div>
            
            {!isAdmin && storeOrderData.total !== (order.total || order.totalAmount) && (
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
