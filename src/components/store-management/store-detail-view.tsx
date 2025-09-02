import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, Calendar, MapPin, Phone, Mail, User, Building, TrendingUp, Settings, Loader2 } from 'lucide-react'
import type { Store } from '@/lib/api'

interface StoreDetailViewProps {
  store: Store
  onEdit: (store: Store) => void
  onBack: () => void
  onStatusChange?: (storeId: string, newStatus: Store['status']) => Promise<void>
}

// Store status configuration
const storeStatusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const },
  active: { label: 'Active', variant: 'default' as const },
  suspended: { label: 'Suspended', variant: 'destructive' as const },
  inactive: { label: 'Inactive', variant: 'outline' as const },
  closed: { label: 'Closed', variant: 'destructive' as const },
}

export const StoreDetailView: React.FC<StoreDetailViewProps> = ({
  store,
  onEdit,
  onBack,
  onStatusChange
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const handleStatusChange = async (newStatus: Store['status']) => {
    if (!onStatusChange || newStatus === store.status) return

    try {
      setIsUpdatingStatus(true)
      await onStatusChange(store._id, newStatus)
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to Store List
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
            <p className="text-muted-foreground">
              Store details and information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onEdit(store)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Store
          </Button>
        </div>
      </div>

      {/* Store Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{store.name}</h3>
              {store.description && (
                <p className="text-muted-foreground mt-2">{store.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={storeStatusConfig[store.status].variant}>
                {storeStatusConfig[store.status].label}
              </Badge>
            </div>
            {store.businessInfo?.businessType && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Business Type:</span>
                <Badge variant="outline">
                  {store.businessInfo.businessType.charAt(0).toUpperCase() + store.businessInfo.businessType.slice(1)}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(store.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Management */}
        {onStatusChange && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Status Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Change Store Status</label>
                <Select 
                  value={store.status} 
                  onValueChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-2 h-2 p-0"></Badge>
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="w-2 h-2 p-0"></Badge>
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="w-2 h-2 p-0"></Badge>
                        Suspended
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-2 h-2 p-0"></Badge>
                        Inactive
                      </div>
                    </SelectItem>
                    <SelectItem value="closed">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="w-2 h-2 p-0"></Badge>
                        Closed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {isUpdatingStatus && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating status...
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Select a new status for this store. Changes will be applied immediately.
                </p>
              </div>
              
              {/* Status Information */}
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium mb-2">Status Descriptions:</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div><strong>Pending:</strong> Store is awaiting approval</div>
                  <div><strong>Active:</strong> Store is operational and accepting orders</div>
                  <div><strong>Suspended:</strong> Store is temporarily disabled</div>
                  <div><strong>Inactive:</strong> Store is disabled but can be reactivated</div>
                  <div><strong>Closed:</strong> Store is permanently closed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{store.contactEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{store.contactPhone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        {store.address && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {store.address.street && <p>{store.address.street}</p>}
              <p>
                {[store.address.city, store.address.state, store.address.zipCode]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {store.address.country && <p>{store.address.country}</p>}
            </CardContent>
          </Card>
        )}

        {/* Owner Information */}
        {store.owner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${store.owner.name}`} />
                  <AvatarFallback>
                    {store.owner.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{store.owner.name}</p>
                  <p className="text-sm text-muted-foreground">{store.owner.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics (if available) */}
        {store.metrics && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Store Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{store.metrics.totalSales.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{store.metrics.totalOrders.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{store.metrics.productCount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{store.metrics.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Commission Information (if available) */}
        {store.commission && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Commission Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="font-medium">Commission Rate</p>
                  <p className="text-2xl font-bold">{store.commission.rate}%</p>
                </div>
                <div>
                  <p className="font-medium">Fee Structure</p>
                  <p className="text-sm text-muted-foreground capitalize">{store.commission.feeStructure}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
