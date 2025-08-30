/**
 * Promotion List Component
 * Display and manage promotions with filtering and actions
 */
import { useState, useCallback } from 'react'
import { Edit2, Trash2, ToggleLeft, ToggleRight, Eye, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { usePromotionManagement } from './use-promotion-management'
import { Skeleton } from '@/components/ui/skeleton'
import type { Promotion, PromotionFilters } from '@/lib/api'
import { format } from 'date-fns'

interface PromotionListProps {
  onEdit: (promotion: Promotion) => void
  onView: (promotion: Promotion) => void
  onCreate: () => void
}

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'draft':
      return 'secondary'
    case 'paused':
      return 'outline'
    case 'expired':
      return 'destructive'
    default:
      return 'secondary'
  }
}

// Helper function to get type badge variant
const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'featured_products':
      return 'default'
    case 'flash_sale':
      return 'destructive'
    case 'promotional_banner':
      return 'secondary'
    case 'discount_coupon':
      return 'outline'
    default:
      return 'secondary'
  }
}

// Helper function to format promotion type
const formatPromotionType = (type: string) => {
  switch (type) {
    case 'featured_products':
      return 'Featured Products'
    case 'flash_sale':
      return 'Flash Sale'
    case 'promotional_banner':
      return 'Banner'
    case 'discount_coupon':
      return 'Coupon'
    case 'buy_x_get_y':
      return 'Buy X Get Y'
    case 'free_shipping':
      return 'Free Shipping'
    default:
      return type
  }
}

export function PromotionList({ onEdit, onView, onCreate }: PromotionListProps) {
  const {
    promotions,
    loading,
    deleting,
    error,
    filters,
    pagination,
    deletePromotion,
    togglePromotionStatus,
    setFilters,
    setPage,
    searchPromotions,
    refresh
  } = usePromotionManagement({ autoFetch: true })

  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    searchPromotions(query)
  }, [searchPromotions])

  const handleFilterChange = useCallback((field: keyof PromotionFilters, value: any) => {
    setFilters({ [field]: value })
  }, [setFilters])

  const handleDeleteClick = useCallback((promotion: Promotion) => {
    setPromotionToDelete(promotion)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (promotionToDelete) {
      const success = await deletePromotion(promotionToDelete._id)
      if (success) {
        setDeleteDialogOpen(false)
        setPromotionToDelete(null)
      }
    }
  }, [promotionToDelete, deletePromotion])

  const handleToggleStatus = useCallback(async (promotion: Promotion) => {
    await togglePromotionStatus(promotion._id)
  }, [togglePromotionStatus])

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive mb-2">Error loading promotions</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
          <p className="text-muted-foreground">
            Manage your promotional campaigns and marketing activities
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Promotion
        </Button>
      </div>

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
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search promotions..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="featured_products">Featured Products</SelectItem>
                  <SelectItem value="flash_sale">Flash Sale</SelectItem>
                  <SelectItem value="promotional_banner">Banner</SelectItem>
                  <SelectItem value="discount_coupon">Coupon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select 
                value={filters.sortBy || 'createdAt'} 
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="endDate">End Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions ({pagination.total})</CardTitle>
          <CardDescription>
            Showing {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} promotions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No promotions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filters.type || filters.status 
                  ? 'Try adjusting your filters to find what you\'re looking for.'
                  : 'Get started by creating your first promotion.'}
              </p>
              {!searchQuery && !filters.type && !filters.status && (
                <Button onClick={onCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Promotion
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{promotion.title}</div>
                        {promotion.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {promotion.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(promotion.type)}>
                        {formatPromotionType(promotion.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(promotion.status)}>
                        {promotion.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(promotion.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(promotion.endDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{promotion.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onView(promotion)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(promotion)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(promotion)}>
                            {promotion.isActive ? (
                              <>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteClick(promotion)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} promotions
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promotion "{promotionToDelete?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
