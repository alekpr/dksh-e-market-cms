import { AlertCircle, Store, CheckCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

interface StoreValidationProps {
  showStoreInfo?: boolean
  className?: string
}

export function StoreValidation({ showStoreInfo = true, className }: StoreValidationProps) {
  const { user, userStore, hasValidStore, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-20 bg-muted rounded-lg"></div>
      </div>
    )
  }

  // Don't show anything for non-merchants
  if (!user || user.role !== 'merchant') {
    return null
  }

  // Show store validation status
  if (!hasValidStore) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Store Access Required</AlertTitle>
          <AlertDescription>
            {!user.merchantInfo?.storeId ? (
              'No store is associated with your account. Please contact support to set up your store.'
            ) : !userStore ? (
              'Unable to load your store information. Please try refreshing the page.'
            ) : userStore.status !== 'active' ? (
              `Your store is currently ${userStore.status}. Please contact support to activate your store.`
            ) : (
              'Store validation failed. Please contact support.'
            )}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show store info if requested and valid
  if (showStoreInfo && userStore) {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Store Information
            </CardTitle>
            <CardDescription>
              Currently managing categories for your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{userStore.name}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {userStore.status}
                </Badge>
              </div>
              
              {userStore.description && (
                <p className="text-sm text-muted-foreground">
                  {userStore.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>ID: {userStore._id}</span>
                {userStore.metrics?.productCount && (
                  <span>Products: {userStore.metrics.productCount}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Valid but not showing info
  return (
    <div className={className}>
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Store Access Verified</AlertTitle>
        <AlertDescription>
          You have access to manage categories for {userStore?.name || 'your store'}.
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Component for store status badge only
export function StoreStatusBadge() {
  const { user, userStore, hasValidStore } = useAuth()

  if (!user || user.role !== 'merchant') {
    return null
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'suspended': return 'destructive'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <AlertCircle className="h-3 w-3" />
      case 'suspended': return <XCircle className="h-3 w-3" />
      case 'inactive': return <XCircle className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  if (!hasValidStore || !userStore) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        No Store Access
      </Badge>
    )
  }

  return (
    <Badge variant={getStatusVariant(userStore.status)} className="flex items-center gap-1">
      {getStatusIcon(userStore.status)}
      {userStore.name} ({userStore.status})
    </Badge>
  )
}
