/**
 * Admin Template Management Dashboard
 * Main dashboard integrating all template management components
 */
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Layout,
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
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  Globe,
  Smartphone,
  Settings,
  FileImage,
  TestTube,
  Palette,
  Code,
  Layers
} from 'lucide-react'

// Import our components
import { AdminTemplateDashboard } from './admin-template-dashboard'
import { TemplateBuilder } from './template-builder'
import { TemplateAnalyticsDashboard } from './template-analytics-dashboard'
import { TemplateApprovalWorkflow } from './template-approval-workflow'
import { TemplateMediaManager } from './media-manager'
import { TemplateBuilderTests } from './integration-tests'
import { ApiIntegrationTests } from './api-integration-tests'

// Import shared types
import type { Template, TemplateStats } from '@/types/template'

// Template interface for builder (subset of full template)
interface BuilderTemplate {
  _id?: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  features: string[]
  layout: {
    sections: any[]
    globalStyles: any
    responsive: any
  }
  status: 'draft' | 'pending' | 'active'
}

interface DashboardStats {
  totalTemplates: number
  activeTemplates: number
  pendingApproval: number
  totalUsage: number
  averageQuality: number
  recentActivity: number
}

export function AdminTemplateManagementDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [templates, setTemplates] = useState<Template[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalTemplates: 0,
    activeTemplates: 0,
    pendingApproval: 0,
    totalUsage: 0,
    averageQuality: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false)
  const [showMediaManager, setShowMediaManager] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load templates
      const templatesResponse = await fetch('/api/admin/store-layout-templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setTemplates(templatesData.templates)
        
        // Calculate stats
        const totalTemplates = templatesData.templates.length
        const activeTemplates = templatesData.templates.filter((t: Template) => t.status === 'active').length
        const pendingApproval = templatesData.templates.filter((t: Template) => t.status === 'pending').length
        const totalUsage = templatesData.templates.reduce((sum: number, t: Template) => sum + t.analytics.usageCount, 0)
        const averageQuality = templatesData.templates.reduce((sum: number, t: Template) => sum + (t.qualityScore || 0), 0) / totalTemplates || 0
        const recentActivity = templatesData.templates.filter((t: Template) => 
          new Date(t.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length
        
        setStats({
          totalTemplates,
          activeTemplates,
          pendingApproval,
          totalUsage,
          averageQuality,
          recentActivity
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateAction = async (action: string, template: Template) => {
    switch (action) {
      case 'edit':
        setEditingTemplate(template)
        setShowTemplateBuilder(true)
        break
      case 'duplicate':
        // Handle template duplication
        break
      case 'delete':
        // Handle template deletion
        break
      case 'preview':
        setSelectedTemplate(template)
        break
    }
  }

  const handleSaveTemplate = async (template: any) => {
    try {
      const url = editingTemplate 
        ? `/api/admin/store-layout-templates/${editingTemplate._id}`
        : '/api/admin/store-layout-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        setShowTemplateBuilder(false)
        setEditingTemplate(null)
        loadDashboardData()
      }
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  const quickStats = [
    {
      title: 'Total Templates',
      value: stats.totalTemplates,
      icon: Layout,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Active Templates',
      value: stats.activeTemplates,
      icon: CheckCircle,
      color: 'green',
      change: '+8%'
    },
    {
      title: 'Pending Approval',
      value: stats.pendingApproval,
      icon: Clock,
      color: 'yellow',
      change: '+3'
    },
    {
      title: 'Total Usage',
      value: stats.totalUsage,
      icon: TrendingUp,
      color: 'purple',
      change: '+24%'
    },
    {
      title: 'Avg Quality Score',
      value: Math.round(stats.averageQuality * 10) / 10,
      icon: BarChart3,
      color: 'indigo',
      change: '+0.2'
    },
    {
      title: 'Recent Activity',
      value: stats.recentActivity,
      icon: Calendar,
      color: 'pink',
      change: '+5'
    }
  ]

  const recentTemplates = templates
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Management</h1>
          <p className="text-gray-600 mt-1">
            Manage store layout templates, review submissions, and monitor performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowMediaManager(true)}
          >
            <FileImage className="h-4 w-4 mr-2" />
            Media Library
          </Button>
          
          <Button
            onClick={() => {
              setEditingTemplate(null)
              setShowTemplateBuilder(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approval
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Media
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <p className={`text-xs mt-1 ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                      <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                        <Icon className={`h-5 w-5 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Templates</CardTitle>
                <CardDescription>Latest template activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTemplates.map((template) => (
                    <div key={template._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Layout className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          template.status === 'active' ? 'default' :
                          template.status === 'pending' ? 'secondary' :
                          template.status === 'draft' ? 'outline' : 'destructive'
                        }>
                          {template.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleTemplateAction('edit', template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTemplateAction('preview', template)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTemplateAction('duplicate', template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common template management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => {
                      setEditingTemplate(null)
                      setShowTemplateBuilder(true)
                    }}
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Create Template</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => setActiveTab('approval')}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-sm">Review Pending</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => setShowMediaManager(true)}
                  >
                    <FileImage className="h-6 w-6" />
                    <span className="text-sm">Media Library</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                    onClick={() => setActiveTab('testing')}
                  >
                    <TestTube className="h-6 w-6" />
                    <span className="text-sm">Run Tests</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto flex-col gap-2 p-4"
                  >
                    <Download className="h-6 w-6" />
                    <span className="text-sm">Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Template management system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">API Status</p>
                    <p className="text-sm text-green-600">All systems operational</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Media CDN</p>
                    <p className="text-sm text-blue-600">99.9% uptime</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Code className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-purple-800">Build System</p>
                    <p className="text-sm text-purple-600">Ready for deployment</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <AdminTemplateDashboard />
        </TabsContent>

        {/* Builder Tab */}
        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Template Builder</CardTitle>
              <CardDescription>
                Create and customize store layout templates with our visual builder
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <TemplateBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approval Tab */}
        <TabsContent value="approval">
          <TemplateApprovalWorkflow />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <TemplateAnalyticsDashboard />
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <Card>
            <CardContent className="p-0">
              <TemplateMediaManager />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing">
          <Tabs defaultValue="api-tests" className="space-y-4">
            <TabsList>
              <TabsTrigger value="api-tests">API Integration</TabsTrigger>
              <TabsTrigger value="builder-tests">Builder Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api-tests">
              <ApiIntegrationTests />
            </TabsContent>
            
            <TabsContent value="builder-tests">
              <TemplateBuilderTests />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Template Builder Dialog */}
      <Dialog open={showTemplateBuilder} onOpenChange={setShowTemplateBuilder}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Use the visual builder to create and customize your template
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <TemplateBuilder />
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Manager Dialog */}
      <Dialog open={showMediaManager} onOpenChange={setShowMediaManager}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Media Library</DialogTitle>
            <DialogDescription>
              Manage template assets and media files
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <TemplateMediaManager />
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>
                Template preview and details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Template Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant={
                    selectedTemplate.status === 'active' ? 'default' :
                    selectedTemplate.status === 'pending' ? 'secondary' :
                    selectedTemplate.status === 'draft' ? 'outline' : 'destructive'
                  }>
                    {selectedTemplate.status}
                  </Badge>
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                  <Badge variant="outline">{selectedTemplate.difficulty}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Created by {selectedTemplate.createdBy.name}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600">{selectedTemplate.description}</p>
              </div>

              {/* Template Sections */}
              <div>
                <h4 className="font-medium mb-2">Template Structure</h4>
                <div className="space-y-2">
                  {selectedTemplate.layout.sections.map((section: any, index: number) => (
                    <div key={section.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-medium">{section.name}</h5>
                        <p className="text-sm text-gray-600">{section.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features and Tags */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedTemplate.analytics.usageCount}</div>
                  <div className="text-sm text-gray-600">Times Used</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedTemplate.qualityScore}</div>
                  <div className="text-sm text-gray-600">Quality Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{selectedTemplate.layout.sections.length}</div>
                  <div className="text-sm text-gray-600">Sections</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}