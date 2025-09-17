/**
 * Banner Detail Component
 * View component for displaying banner details
 */
import { useState } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Package, 
  Store, 
  Tag,
  Calendar,
  Image as ImageIcon,
  Star,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Banner } from './use-banner-management'

interface BannerDetailProps {
  banner: Banner
  onEdit: () => void
  onDelete: () => Promise<void>
  onToggleStatus: () => Promise<void>
  loading?: boolean
}

export function BannerDetail({ 
  banner, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  loading = false 
}: BannerDetailProps) {
  const [imageError, setImageError] = useState(false)

  // Get action type icon and label
  const getActionInfo = (type: string) => {
    switch (type) {
      case 'product_detail':
        return { icon: Package, label: 'Product Detail', color: 'bg-blue-100 text-blue-800' }
      case 'store':
        return { icon: Store, label: 'Store Page', color: 'bg-green-100 text-green-800' }
      case 'category':
        return { icon: Tag, label: 'Category Page', color: 'bg-purple-100 text-purple-800' }
      case 'external_link':
        return { icon: ExternalLink, label: 'External Link', color: 'bg-orange-100 text-orange-800' }
      default:
        return { icon: Package, label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const actionInfo = getActionInfo(banner.actionType)
  const ActionIcon = actionInfo.icon

  // Check if banner is currently active based on dates
  const isCurrentlyActive = () => {
    const now = new Date()
    if (banner.startDate && new Date(banner.startDate) > now) return false
    if (banner.endDate && new Date(banner.endDate) < now) return false
    return banner.isActive
  }

  const currentlyActive = isCurrentlyActive()

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{banner.title}</h2>
          <Badge 
            variant={currentlyActive ? 'default' : 'secondary'}
            className={currentlyActive ? 'bg-green-100 text-green-800' : ''}
          >
            {currentlyActive ? (
              <>
                <Activity className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleStatus}
            disabled={loading}
          >
            {banner.isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={loading}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{banner.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Banner Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Banner Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!imageError ? (
            <div className="relative overflow-hidden rounded-lg border">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-64 object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-lg font-semibold">{banner.title}</div>
                  {banner.description && (
                    <div className="text-sm mt-1">{banner.description}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                <p>Image failed to load</p>
                <p className="text-sm mt-1 break-all">{banner.imageUrl}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Title</label>
              <p className="text-base">{banner.title}</p>
            </div>
            
            {banner.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-base">{banner.description}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-base">{banner.priority}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Image URL</label>
              <p className="text-base break-all text-blue-600">{banner.imageUrl}</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Action Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Action Type</label>
              <div className="flex items-center gap-2 mt-1">
                <ActionIcon className="h-4 w-4" />
                <Badge className={actionInfo.color}>
                  {actionInfo.label}
                </Badge>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Action Value</label>
              <p className="text-base font-mono bg-muted p-2 rounded border">
                {banner.actionValue}
              </p>
              {banner.actionType === 'external_link' && (
                <p className="text-sm text-muted-foreground mt-1">
                  External URL that will open in browser
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <p className="text-base">
                {banner.startDate 
                  ? format(new Date(banner.startDate), 'dd MMMM yyyy', { locale: th })
                  : 'No start date set'
                }
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <p className="text-base">
                {banner.endDate 
                  ? format(new Date(banner.endDate), 'dd MMMM yyyy', { locale: th })
                  : 'No end date set'
                }
              </p>
            </div>

            {/* Schedule Status Alert */}
            {banner.startDate && new Date(banner.startDate) > new Date() && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  This banner is scheduled to start on{' '}
                  {format(new Date(banner.startDate), 'dd MMMM yyyy', { locale: th })}
                </AlertDescription>
              </Alert>
            )}
            
            {banner.endDate && new Date(banner.endDate) < new Date() && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  This banner expired on{' '}
                  {format(new Date(banner.endDate), 'dd MMMM yyyy', { locale: th })}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Banner ID</label>
              <p className="text-base font-mono">{banner._id}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created Date</label>
              <p className="text-base">
                {banner.createdAt 
                  ? format(new Date(banner.createdAt), 'dd MMMM yyyy HH:mm', { locale: th })
                  : 'Not available'
                }
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-base">
                {banner.updatedAt 
                  ? format(new Date(banner.updatedAt), 'dd MMMM yyyy HH:mm', { locale: th })
                  : 'Not available'
                }
              </p>
            </div>
            
            {banner.createdBy && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <div className="flex items-center gap-3 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {banner.createdBy.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-base font-medium">{banner.createdBy.name}</p>
                    <p className="text-sm text-muted-foreground">{banner.createdBy.email}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}