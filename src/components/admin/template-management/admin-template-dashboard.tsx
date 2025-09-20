/**
 * Admin Template Management Dashboard  
 * Simple, clean dashboard for admin template management
 */
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
  Search,
  Filter
} from 'lucide-react'

interface Template {
  _id: string
  name: string
  displayName: string
  description: string
  category: string
  type: string
  status: string
  popularity: number
  usage: {
    stores: number
    lastUsed?: string
  }
  metadata: {
    tags: string[]
    industry: string[]
    version: string
  }
  analytics: {
    downloads: number
    views: number
    averageRating: number
  }
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  totalTemplates: number
  activeTemplates: number
  pendingApproval: number
  totalDownloads: number
  averageRating: number
}

export function AdminTemplateDashboard() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  // Apply filters when templates or filters change
  useEffect(() => {
    applyFiltersAndSearch()
  }, [templates, searchQuery, statusFilter, categoryFilter])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get token with fallback approach
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('authToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Load templates - use the public endpoint that returns all templates
      const templatesResponse = await fetch('http://localhost:3000/api/v1/store-layout-templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!templatesResponse.ok) {
        throw new Error('Failed to load templates')
      }

      const templatesData = await templatesResponse.json()
      setTemplates(templatesData.data.templates || [])

      // Calculate basic stats from templates data
      const allTemplates = templatesData.data.templates || []
      const stats: DashboardStats = {
        totalTemplates: allTemplates.length,
        activeTemplates: allTemplates.filter((t: any) => t.status === 'active').length,
        pendingApproval: allTemplates.filter((t: any) => t.status === 'pending_approval').length,
        totalDownloads: allTemplates.reduce((sum: number, t: any) => sum + (t.analytics?.downloads || 0), 0),
        averageRating: allTemplates.reduce((sum: number, t: any) => sum + (t.analytics?.averageRating || 0), 0) / allTemplates.length || 0
      }
      setDashboardStats(stats)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSearch = () => {
    let filtered = [...templates]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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

    setFilteredTemplates(filtered)
  }

  const handleTemplateAction = async (templateId: string, action: string) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('authToken')
      
      let endpoint = `http://localhost:3000/api/v1/store-layout-templates/${templateId}`
      let method = 'POST'
      let body: any = null

      // Map actions to correct endpoints based on the actual API routes
      switch (action) {
        case 'approve':
          endpoint = `${endpoint}/approve`
          break
        case 'reject':
          endpoint = `${endpoint}/reject`
          body = JSON.stringify({ reason: 'Rejected from admin dashboard' })
          break
        case 'activate':
          endpoint = `${endpoint}/activate`
          break
        case 'delete':
          method = 'DELETE'
          break
        default:
          // For status changes like 'draft', 'pending_approval', etc.
          endpoint = `${endpoint}/status`
          method = 'PATCH'
          body = JSON.stringify({ status: action })
          break
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        ...(body && { body })
      })

      if (response.ok) {
        await loadDashboardData() // Reload data
      } else {
        console.error(`Failed to ${action} template:`, await response.text())
      }
    } catch (err) {
      console.error(`Failed to ${action} template:`, err)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      deprecated: { color: 'bg-gray-100 text-gray-600', icon: AlertTriangle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading template dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error: {error}</p>
            <Button onClick={loadDashboardData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const categories = [...new Set(templates.map(t => t.category))]
  const statuses = [...new Set(templates.map(t => t.status))]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
        <p className="text-muted-foreground">
          Manage store layout templates, approvals, and analytics
        </p>
      </div>

      {/* Statistics Cards */}
      {dashboardStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalTemplates}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.activeTemplates}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.pendingApproval}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalDownloads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.averageRating.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates ({filteredTemplates.length})</CardTitle>
          <CardDescription>
            Manage and monitor all store layout templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTemplates.map((template) => (
              <div
                key={template._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{template.displayName}</h3>
                    {getStatusBadge(template.status)}
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.usage.stores} stores
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {template.analytics.views} views
                    </span>
                    <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {template.status === 'pending_approval' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleTemplateAction(template._id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTemplateAction(template._id, 'reject')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {template.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => handleTemplateAction(template._id, 'activate')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleTemplateAction(template._id, 'delete')}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No templates found matching your criteria</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}