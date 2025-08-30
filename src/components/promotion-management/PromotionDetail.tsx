/**
 * Promotion Detail Component
 * Displays detailed information about a promotion
 */
import { format } from 'date-fns'
import { Edit, Copy, Trash2, Calendar, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Promotion } from '@/lib/api'

interface PromotionDetailProps {
  promotion: Promotion
  onEdit: () => void
  onDelete: () => void
  onDuplicate?: () => void
}

export function PromotionDetail({ promotion, onEdit, onDelete, onDuplicate }: PromotionDetailProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ended':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'featured_products':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'discount':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const totalOriginalValue = promotion.metadata?.productPricing?.reduce((sum: number, item: any) => sum + item.originalPrice, 0) || 0
  const totalPromotionalValue = promotion.metadata?.productPricing?.reduce((sum: number, item: any) => sum + item.promotionalPrice, 0) || 0
  const totalSavings = promotion.metadata?.productPricing?.reduce((sum: number, item: any) => sum + item.savings, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{promotion.title}</h1>
            <Badge className={getStatusColor(promotion.status)}>
              {promotion.status}
            </Badge>
            <Badge className={getTypeColor(promotion.type)}>
              {promotion.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {promotion.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {onDuplicate && (
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-sm">{formatDate(promotion.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-sm">{formatDate(promotion.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Priority</p>
                  <p className="text-sm">{promotion.priority}/10</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(promotion.status)}>
                    {promotion.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products with Pricing */}
          {promotion.metadata?.productPricing && promotion.metadata.productPricing.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Product Pricing
                </CardTitle>
                <CardDescription>
                  Products included in this promotion with pricing details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {promotion.metadata.productPricing.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Product {index + 1}</p>
                        <p className="text-sm text-muted-foreground">ID: {item.productId}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">
                            ฿{item.originalPrice}
                          </span>
                          <span className="font-medium text-lg">
                            ฿{item.promotionalPrice}
                          </span>
                        </div>
                        <div className="text-sm text-green-600">
                          Save ฿{item.savings} ({item.discountValue}% off)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flash Sale Settings */}
          {promotion.type === 'flash_sale' && promotion.flashSale && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Flash Sale Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Available Quantity</p>
                    <p className="text-sm">
                      {promotion.flashSale.availableQuantity === 0 
                        ? 'Unlimited' 
                        : promotion.flashSale.availableQuantity
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sold Quantity</p>
                    <p className="text-sm">{promotion.flashSale.soldQuantity || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notify Before Start</p>
                    <p className="text-sm">{promotion.flashSale.notifyBeforeStart || 0} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Show Countdown</p>
                    <Badge variant={promotion.flashSale.showCountdown ? 'default' : 'secondary'}>
                      {promotion.flashSale.showCountdown ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats & Summary */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-medium">{promotion.analytics?.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Clicks</span>
                  <span className="font-medium">{promotion.analytics?.clicks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversions</span>
                  <span className="font-medium">{promotion.analytics?.conversions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="font-medium">฿{promotion.analytics?.revenue || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          {totalOriginalValue > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Products</span>
                    <span className="font-medium">{promotion.metadata?.productPricing?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Original Value</span>
                    <span className="font-medium">฿{totalOriginalValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Promotional Value</span>
                    <span className="font-medium text-green-600">฿{totalPromotionalValue}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Savings</span>
                    <span className="font-bold text-green-600">
                      ฿{totalSavings} ({((totalSavings / totalOriginalValue) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Created by</p>
                  <p className="font-medium">
                    {typeof promotion.createdBy === 'string' 
                      ? promotion.createdBy 
                      : promotion.createdBy?.name || 'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created at</p>
                  <p>{formatDate(promotion.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last updated</p>
                  <p>{formatDate(promotion.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Promotion ID</p>
                  <p className="font-mono text-xs break-all">{promotion._id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
