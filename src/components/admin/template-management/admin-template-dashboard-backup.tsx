/**
 * Admin Template Management Dashboard
 * Main dashboard for admin template management with comprehensive features
 */
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3,
  Calendar,
  Tag,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Layout,
  Palette,
  Settings
} from 'lucide-react'

// Import shared types
import type { Template, TemplateFilters, TemplateSortOptions } from '@/types/template'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Search, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Upload,
  Download,
  Filter,
  SortAsc,
  BarChart3,
  Users,
  Star,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react'

// Define interfaces
// Import shared types
import type { Template, TemplateFilters, TemplateSortOptions } from '@/types/template'

// Remove the local Template interface since we're using the shared one

interface DashboardStats {
  totalTemplates: number
  activeTemplates: number
  pendingApproval: number
  draftTemplates: number
  totalViews: number
  totalSelections: number
  averageRating: number
  topPerformer?: Template
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: XCircle },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: Archive }
}

const difficultyConfig = {
  beginner: { label: 'Beginner', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Advanced', color: 'bg-red-100 text-red-700' }
}

export function AdminTemplateDashboard() {
  // State management
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Selection state for bulk actions
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)

  // Load templates and dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Apply filters and search
  useEffect(() => {
    applyFiltersAndSearch()
  }, [templates, searchQuery, statusFilter, categoryFilter, difficultyFilter, sortBy, sortOrder])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load templates with admin privileges
      const templatesResponse = await fetch('/api/v1/store-layout-templates/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!templatesResponse.ok) {
        throw new Error('Failed to load templates')
      }

      const templatesData = await templatesResponse.json()
      setTemplates(templatesData.data.templates || [])

      // Load dashboard statistics
      const statsResponse = await fetch('/api/v1/store-layout-templates/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setDashboardStats(statsData.data.stats)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...templates]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(template => template.status === statusFilter)
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(template => template.category === categoryFilter)
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(template => template.difficulty === difficultyFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'views':
          aValue = a.analytics.views
          bValue = b.analytics.views
          break
        case 'selections':
          aValue = a.analytics.selections
          bValue = b.analytics.selections
          break
        case 'rating':
          aValue = a.analytics.ratings.length > 0 
            ? a.analytics.ratings.reduce((sum, r) => sum + r.rating, 0) / a.analytics.ratings.length 
            : 0
          bValue = b.analytics.ratings.length > 0 
            ? b.analytics.ratings.reduce((sum, r) => sum + r.rating, 0) / b.analytics.ratings.length 
            : 0
          break
        case 'quality':
          aValue = a.qualityScore || 0
          bValue = b.qualityScore || 0
          break
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTemplates(filtered)
  }

  const handleTemplateSelection = (templateId: string, checked: boolean) => {
    const newSelection = new Set(selectedTemplates)
    if (checked) {
      newSelection.add(templateId)
    } else {
      newSelection.delete(templateId)
    }
    setSelectedTemplates(newSelection)
    setSelectAll(newSelection.size === filteredTemplates.length)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(new Set(filteredTemplates.map(t => t._id)))
    } else {
      setSelectedTemplates(new Set())
    }
    setSelectAll(checked)
  }

  const handleBulkAction = async (action: string) => {
    if (selectedTemplates.size === 0) return

    const templateIds = Array.from(selectedTemplates)
    
    try {
      let endpoint = ''
      let method = 'PATCH'
      let body: any = { templateIds }

      switch (action) {
        case 'activate':
          endpoint = '/api/v1/store-layout-templates/admin/bulk-status'
          body.status = 'active'
          break
        case 'deactivate':
          endpoint = '/api/v1/store-layout-templates/admin/bulk-status'
          body.status = 'inactive'
          break
        case 'archive':
          endpoint = '/api/v1/store-layout-templates/admin/bulk-status'
          body.status = 'archived'
          break
        case 'delete':
          endpoint = '/api/v1/store-layout-templates/admin/bulk-delete'
          method = 'DELETE'
          break
        default:
          return
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} templates`)
      }

      // Reload data
      await loadDashboardData()
      setSelectedTemplates(new Set())
      setSelectAll(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} templates`)
    }
  }

  const getUniqueValues = (key: keyof Template) => {
    const values = templates.map(template => template[key]).filter(Boolean)
    return [...new Set(values as string[])]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAverageRating = (ratings: Array<{ rating: number }>) => {
    if (ratings.length === 0) return 0
    return Math.round((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10) / 10
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 font-medium">Error loading templates</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button 
            onClick={loadDashboardData} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Management</h1>
          <p className="text-gray-600 mt-1">Manage store layout templates and monitor performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalTemplates}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.activeTemplates} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.pendingApproval}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.totalSelections} selections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Out of 5.0
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getUniqueValues('category').map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="selections">Selections</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="quality">Quality Score</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <SortAsc className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedTemplates.size > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <span className="text-sm text-gray-600">
                {selectedTemplates.size} template{selectedTemplates.size > 1 ? 's' : ''} selected
              </span>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Templates</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedTemplates.size} template{selectedTemplates.size > 1 ? 's' : ''}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction('delete')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => {
              const StatusIcon = statusConfig[template.status]?.icon || Clock
              const averageRating = getAverageRating(template.analytics.ratings)

              return (
                <div key={template._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <Checkbox
                      checked={selectedTemplates.has(template._id)}
                      onCheckedChange={(checked) => 
                        handleTemplateSelection(template._id, checked as boolean)
                      }
                      className="mt-1"
                    />

                    {/* Template Thumbnail */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {template.preview.thumbnail ? (
                        <img
                          src={template.preview.thumbnail}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Settings className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {template.name}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge 
                              variant="secondary" 
                              className={statusConfig[template.status]?.color}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[template.status]?.label}
                            </Badge>
                            
                            <Badge 
                              variant="outline"
                              className={difficultyConfig[template.difficulty]?.color}
                            >
                              {difficultyConfig[template.difficulty]?.label}
                            </Badge>
                            
                            <Badge variant="outline">
                              {template.category}
                            </Badge>
                            
                            {template.qualityScore && (
                              <Badge 
                                variant="outline"
                                className={
                                  template.qualityScore >= 80 ? 'bg-green-50 text-green-700' :
                                  template.qualityScore >= 60 ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-red-50 text-red-700'
                                }
                              >
                                Quality: {template.qualityScore}%
                              </Badge>
                            )}
                          </div>

                          {/* Analytics */}
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {template.analytics.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {template.analytics.selections}
                            </div>
                            {averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {averageRating} ({template.analytics.ratings.length})
                              </div>
                            )}
                            <div>
                              Created {formatDate(template.createdAt)}
                            </div>
                            {template.approvedAt && (
                              <div>
                                Approved {formatDate(template.approvedAt)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {template.status === 'pending' && (
                              <>
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {template.status === 'active' && (
                              <DropdownMenuItem>
                                <XCircle className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            )}
                            {template.status === 'inactive' && (
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Settings className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters or search query.'
                    : 'Get started by creating your first template.'}
                </p>
                {(!searchQuery && statusFilter === 'all' && categoryFilter === 'all') && (
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}