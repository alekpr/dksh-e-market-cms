/**
 * Simple Admin Template Dashboard
 * Simplified version to prevent React infinite loops
 */
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3,
  CheckCircle,
  Clock,
  Users,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

export function AdminTemplateDashboard() {
  const [loading] = useState(false)

  // Mock data to prevent API calls that might cause loops
  const mockStats = {
    totalTemplates: 5,
    activeTemplates: 4,
    pendingApproval: 1,
    totalDownloads: 156,
    averageRating: 4.2
  }

  const mockTemplates = [
    {
      _id: '1',
      displayName: 'Modern Default',
      description: 'Clean and modern layout with focus on products and deals',
      status: 'active',
      category: 'full-layout',
      usage: { stores: 3 },
      analytics: { views: 245 },
      updatedAt: '2025-09-19T08:31:05.973Z'
    },
    {
      _id: '2', 
      displayName: 'Classic Grid',
      description: 'Traditional grid-based layout perfect for product catalogs',
      status: 'active',
      category: 'full-layout',
      usage: { stores: 2 },
      analytics: { views: 189 },
      updatedAt: '2025-09-18T15:37:13.795Z'
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalTemplates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeTemplates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pendingApproval}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalDownloads}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageRating}</div>
          </CardContent>
        </Card>
      </div>

      {/* Templates List */}
      <Card>
        <CardHeader>
          <CardTitle>Templates ({mockTemplates.length})</CardTitle>
          <CardDescription>
            Manage and monitor all store layout templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTemplates.map((template) => (
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
                  <Button size="sm" variant="outline" disabled>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  <Button size="sm" variant="outline" disabled>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Development Status</CardTitle>
          <CardDescription>
            Full template management functionality is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This simplified dashboard shows the menu structure. Full functionality will include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Real template data from backend API</li>
              <li>Interactive filtering and search</li>
              <li>Template approval workflow</li>
              <li>Template editing and creation</li>
              <li>Analytics and reporting</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              Backend API endpoints need to be implemented for full functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}