/**
 * Banner List Component
 * Displays a list of banners with actions and filtering
 */
import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  ChevronUp,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Package,
  Store,
  Tag,
  ImageIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useBannerManagement, type Banner } from './index'

interface BannerListProps {
  onCreate: () => void
  onEdit: (banner: Banner) => void
  onView: (banner: Banner) => void
}

const actionTypeIcons = {
  product_detail: Package,
  store: Store,
  category: Tag,
  external_link: ExternalLink,
}

const actionTypeLabels: Record<Banner['actionType'], string> = {
  product_detail: 'Product Detail',
  store: 'Store',
  category: 'Category',
  external_link: 'External Link',
}

export function BannerList({ onCreate, onEdit, onView }: BannerListProps) {
  const {
    banners,
    loading,
    error,
    filters,
    pagination,
    deleteBanner,
    toggleBannerStatus,
    updateFilters,
    fetchBanners,
  } = useBannerManagement()

  const [searchTerm, setSearchTerm] = useState(filters.search || '')
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = useCallback((bannerId: string) => {
    setImageErrors(prev => ({ ...prev, [bannerId]: true }))
  }, [])

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value)
    updateFilters({ search: value, page: 1 })
  }, [updateFilters])

  const handleFilterChange = useCallback((key: string, value: any) => {
    updateFilters({ [key]: value, page: 1 })
  }, [updateFilters])

  const handlePageChange = useCallback((page: number) => {
    updateFilters({ page })
  }, [updateFilters])

  const handleDelete = useCallback(async (banner: Banner) => {
    try {
      await deleteBanner(banner._id)
      setBannerToDelete(null)
      toast.success(`Banner "${banner.title}" deleted successfully`)
    } catch (error) {
      toast.error('Failed to delete banner')
    }
  }, [deleteBanner])

  const handleToggleStatus = useCallback(async (banner: Banner) => {
    try {
      await toggleBannerStatus(banner._id, !banner.isActive)
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update banner status')
    }
  }, [toggleBannerStatus])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionTypeIcon = (actionType: string) => {
    const IconComponent = actionTypeIcons[actionType as keyof typeof actionTypeIcons]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading banners: {error}
            <Button 
              variant="outline" 
              onClick={() => fetchBanners()} 
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search banners..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status?.toString() || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('status', value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Action Type</label>
              <Select
                value={filters.actionType || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('actionType', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product_detail">Product Detail</SelectItem>
                  <SelectItem value="store">Store</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="external_link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Sort</label>
              <Select
                value="-createdAt"
                onValueChange={(value) => handleFilterChange('sort', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-createdAt">Newest First</SelectItem>
                  <SelectItem value="createdAt">Oldest First</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="-title">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Banners ({pagination.total})
            </CardTitle>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading banners...</div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No banners found. {filters.search || filters.status !== undefined || filters.actionType ? 'Try adjusting your filters.' : 'Create your first banner to get started.'}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner: Banner) => (
                    <TableRow key={banner._id}>
                      <TableCell>
                        {imageErrors[banner._id] ? (
                          <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        ) : (
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="w-16 h-10 object-cover rounded"
                            onError={() => handleImageError(banner._id)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          {banner.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {banner.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionTypeIcon(banner.actionType)}
                          <span className="text-sm">
                            {actionTypeLabels[banner.actionType]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={banner.isActive}
                            onCheckedChange={() => handleToggleStatus(banner)}
                          />
                          <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{banner.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {banner.startDate ? formatDate(banner.startDate) : 'No start date'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {banner.endDate ? formatDate(banner.endDate) : 'No end date'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(banner)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(banner)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setBannerToDelete(banner)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
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
                                  onClick={() => handleDelete(banner)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}