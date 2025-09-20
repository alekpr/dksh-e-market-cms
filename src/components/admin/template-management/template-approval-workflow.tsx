/**
 * Template Approval Workflow
 * Interface for reviewing and approving pending templates
 */
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  User,
  Calendar,
  Star,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Send,
  History,
  Filter,
  Search
} from 'lucide-react'

interface PendingTemplate {
  _id: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  features: string[]
  preview: {
    thumbnail?: string
    screenshots: string[]
  }
  layout: {
    sections: Array<{
      type: string
      config: any
    }>
    globalStyles: any
  }
  submittedAt: string
  submittedBy: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  qualityScore?: number
  qualityAssurance?: {
    issues: Array<{
      type: string
      severity: 'low' | 'medium' | 'high'
      message: string
    }>
    checkedAt: string
  }
  comments: Array<{
    _id: string
    author: {
      _id: string
      name: string
      avatar?: string
    }
    message: string
    type: 'feedback' | 'question' | 'suggestion'
    createdAt: string
  }>
}

interface ApprovalHistory {
  templateId: string
  templateName: string
  action: 'approved' | 'rejected'
  reviewer: {
    _id: string
    name: string
    avatar?: string
  }
  timestamp: string
  reason?: string
  feedback?: string
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700'
}

export function TemplateApprovalWorkflow() {
  const [pendingTemplates, setPendingTemplates] = useState<PendingTemplate[]>([])
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PendingTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Approval state
  const [approvalReason, setApprovalReason] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'feedback' | 'question' | 'suggestion'>('feedback')
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  useEffect(() => {
    loadPendingTemplates()
    loadApprovalHistory()
  }, [])

  const loadPendingTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/v1/store-layout-templates/admin/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load pending templates')
      }

      const data = await response.json()
      setPendingTemplates(data.data.templates || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadApprovalHistory = async () => {
    try {
      const response = await fetch('/api/v1/store-layout-templates/admin/approval-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApprovalHistory(data.data.history || [])
      }
    } catch (err) {
      console.error('Failed to load approval history:', err)
    }
  }

  const handleApprove = async (templateId: string) => {
    try {
      const response = await fetch(`/api/v1/store-layout-templates/${templateId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedback: feedback.trim() || undefined,
          reason: approvalReason.trim() || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to approve template')
      }

      // Reload data
      await loadPendingTemplates()
      await loadApprovalHistory()
      
      // Reset form
      setApprovalReason('')
      setFeedback('')
      setSelectedTemplate(null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve template')
    }
  }

  const handleReject = async (templateId: string) => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    try {
      const response = await fetch(`/api/v1/store-layout-templates/${templateId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: rejectionReason.trim(),
          feedback: feedback.trim() || undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reject template')
      }

      // Reload data
      await loadPendingTemplates()
      await loadApprovalHistory()
      
      // Reset form
      setRejectionReason('')
      setFeedback('')
      setSelectedTemplate(null)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject template')
    }
  }

  const handleAddComment = async (templateId: string) => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/v1/store-layout-templates/${templateId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newComment.trim(),
          type: commentType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      // Reload templates to get updated comments
      await loadPendingTemplates()
      
      // Update selected template if it's the one we commented on
      if (selectedTemplate?._id === templateId) {
        const updatedTemplate = pendingTemplates.find(t => t._id === templateId)
        if (updatedTemplate) {
          setSelectedTemplate(updatedTemplate)
        }
      }
      
      // Reset form
      setNewComment('')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    }
  }

  const filteredTemplates = pendingTemplates.filter(template => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.submittedBy.name.toLowerCase().includes(query)
      
      if (!matchesSearch) return false
    }

    // Category filter
    if (categoryFilter !== 'all' && template.category !== categoryFilter) {
      return false
    }

    // Severity filter
    if (severityFilter !== 'all') {
      const hasIssuesOfSeverity = template.qualityAssurance?.issues.some(
        issue => issue.severity === severityFilter
      )
      if (!hasIssuesOfSeverity) return false
    }

    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUniqueCategories = () => {
    return [...new Set(pendingTemplates.map(t => t.category))]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Approval</h1>
          <p className="text-gray-600 mt-1">Review and approve pending template submissions</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {pendingTemplates.length} Pending
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-medium">Error</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button 
            onClick={() => setError(null)} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingTemplates.length})</TabsTrigger>
          <TabsTrigger value="history">Approval History</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search templates or submitters..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Issues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Issues</SelectItem>
                      <SelectItem value="high">High Severity</SelectItem>
                      <SelectItem value="medium">Medium Severity</SelectItem>
                      <SelectItem value="low">Low Severity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Pending Templates List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                    {template.qualityScore && (
                      <Badge 
                        variant="outline"
                        className={
                          template.qualityScore >= 80 ? 'bg-green-50 text-green-700' :
                          template.qualityScore >= 60 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }
                      >
                        {template.qualityScore}%
                      </Badge>
                    )}
                  </div>

                  {/* Template Preview */}
                  <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mt-3">
                    {template.preview.thumbnail ? (
                      <img
                        src={template.preview.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Eye className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className={difficultyColors[template.difficulty]}>
                      {template.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {template.category}
                    </Badge>
                    {template.qualityAssurance?.issues && template.qualityAssurance.issues.length > 0 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {template.qualityAssurance.issues.length} Issue{template.qualityAssurance.issues.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Submitter Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={template.submittedBy.avatar} />
                      <AvatarFallback>
                        {template.submittedBy.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{template.submittedBy.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(template.submittedAt)}</p>
                    </div>
                  </div>

                  {/* Quality Issues */}
                  {template.qualityAssurance?.issues && template.qualityAssurance.issues.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Quality Issues:</p>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {template.qualityAssurance.issues.slice(0, 3).map((issue, index) => (
                          <div key={index} className={`text-xs px-2 py-1 rounded ${severityColors[issue.severity]}`}>
                            {issue.message}
                          </div>
                        ))}
                        {template.qualityAssurance.issues.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{template.qualityAssurance.issues.length - 3} more issues
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {template.comments && template.comments.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2 flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {template.comments.length} Comment{template.comments.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedTemplate(template)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{template.name}</DialogTitle>
                          <DialogDescription>
                            Review template details and provide approval decision
                          </DialogDescription>
                        </DialogHeader>

                        {selectedTemplate && (
                          <div className="space-y-6">
                            {/* Template Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium mb-2">Template Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Category:</strong> {selectedTemplate.category}</div>
                                  <div><strong>Difficulty:</strong> {selectedTemplate.difficulty}</div>
                                  <div><strong>Sections:</strong> {selectedTemplate.layout.sections.length}</div>
                                  <div><strong>Features:</strong> {selectedTemplate.features.join(', ')}</div>
                                  <div><strong>Tags:</strong> {selectedTemplate.tags.join(', ')}</div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Submission Info</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Submitted by:</strong> {selectedTemplate.submittedBy.name}</div>
                                  <div><strong>Email:</strong> {selectedTemplate.submittedBy.email}</div>
                                  <div><strong>Submitted:</strong> {formatDate(selectedTemplate.submittedAt)}</div>
                                  {selectedTemplate.qualityScore && (
                                    <div><strong>Quality Score:</strong> {selectedTemplate.qualityScore}%</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div>
                              <h4 className="font-medium mb-2">Description</h4>
                              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                            </div>

                            {/* Quality Issues */}
                            {selectedTemplate.qualityAssurance?.issues && selectedTemplate.qualityAssurance.issues.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Quality Issues</h4>
                                <div className="space-y-2">
                                  {selectedTemplate.qualityAssurance.issues.map((issue, index) => (
                                    <div key={index} className={`p-3 rounded-lg ${severityColors[issue.severity]}`}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">
                                          {issue.severity.toUpperCase()}
                                        </Badge>
                                        <span className="text-sm font-medium">{issue.type}</span>
                                      </div>
                                      <p className="text-sm">{issue.message}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Preview Images */}
                            {selectedTemplate.preview.screenshots.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Screenshots</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {selectedTemplate.preview.screenshots.map((screenshot, index) => (
                                    <img
                                      key={index}
                                      src={screenshot}
                                      alt={`Screenshot ${index + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Comments */}
                            <div>
                              <h4 className="font-medium mb-3">Comments & Feedback</h4>
                              
                              {/* Existing Comments */}
                              {selectedTemplate.comments.length > 0 && (
                                <div className="space-y-3 mb-4">
                                  {selectedTemplate.comments.map((comment) => (
                                    <div key={comment._id} className="border-l-4 border-blue-200 pl-4 py-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={comment.author.avatar} />
                                          <AvatarFallback>
                                            {comment.author.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{comment.author.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {comment.type}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {formatDate(comment.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm">{comment.message}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Comment */}
                              <div className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex gap-2 mb-3">
                                  <Select value={commentType} onValueChange={(value: any) => setCommentType(value)}>
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="feedback">Feedback</SelectItem>
                                      <SelectItem value="question">Question</SelectItem>
                                      <SelectItem value="suggestion">Suggestion</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Textarea
                                  placeholder="Add a comment..."
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  className="mb-3"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => selectedTemplate && handleAddComment(selectedTemplate._id)}
                                  disabled={!newComment.trim()}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Add Comment
                                </Button>
                              </div>
                            </div>

                            {/* Approval Section */}
                            <div className="border-t pt-6">
                              <h4 className="font-medium mb-3">Approval Decision</h4>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    Additional Feedback (Optional)
                                  </label>
                                  <Textarea
                                    placeholder="Provide additional feedback..."
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Approve */}
                                  <div className="space-y-2">
                                    <Input
                                      placeholder="Approval reason (optional)"
                                      value={approvalReason}
                                      onChange={(e) => setApprovalReason(e.target.value)}
                                    />
                                    <Button
                                      className="w-full bg-green-600 hover:bg-green-700"
                                      onClick={() => selectedTemplate && handleApprove(selectedTemplate._id)}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-2" />
                                      Approve Template
                                    </Button>
                                  </div>

                                  {/* Reject */}
                                  <div className="space-y-2">
                                    <Input
                                      placeholder="Rejection reason (required)"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full">
                                          <ThumbsDown className="h-4 w-4 mr-2" />
                                          Reject Template
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Reject Template</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to reject this template? 
                                            This will notify the submitter with your rejection reason.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => selectedTemplate && handleReject(selectedTemplate._id)}
                                            className="bg-red-600 hover:bg-red-700"
                                            disabled={!rejectionReason.trim()}
                                          >
                                            Reject
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <CheckCircle className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending templates</h3>
                <p className="text-gray-500">
                  {searchQuery || categoryFilter !== 'all' || severityFilter !== 'all'
                    ? 'No templates match your current filters.'
                    : 'All templates have been reviewed.'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Approval History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Approvals & Rejections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvalHistory.length > 0 ? (
                <div className="space-y-4">
                  {approvalHistory.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        item.action === 'approved' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {item.action === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.templateName}</span>
                          <Badge variant={item.action === 'approved' ? 'default' : 'destructive'}>
                            {item.action}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={item.reviewer.avatar} />
                            <AvatarFallback>
                              {item.reviewer.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>by {item.reviewer.name}</span>
                          <span>•</span>
                          <span>{formatDate(item.timestamp)}</span>
                        </div>
                        {item.reason && (
                          <p className="text-sm text-gray-600 mt-1">Reason: {item.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No approval history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}