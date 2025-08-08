import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { ContentFormData, Content, ViewMode } from './types'

interface ContentFormViewProps {
  currentView: ViewMode
  formData: ContentFormData
  onFormDataChange: (data: ContentFormData) => void
  onSave: () => void
  onCancel: () => void
}

export const ContentFormView: React.FC<ContentFormViewProps> = ({
  currentView,
  formData,
  onFormDataChange,
  onSave,
  onCancel
}) => {
  const updateFormData = (field: keyof ContentFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentView === 'add' ? 'Add New Content' : 'Edit Content'}
          </h1>
          <p className="text-muted-foreground">
            {currentView === 'add' 
              ? 'Create a new piece of content' 
              : 'Update your existing content'
            }
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Back to List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>
            Fill in the information below to {currentView === 'add' ? 'create' : 'update'} your content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter content title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Enter category"
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              placeholder="Brief description of the content"
              value={formData.excerpt}
              onChange={(e) => updateFormData('excerpt', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your content here..."
              className="min-h-[200px]"
              value={formData.content}
              onChange={(e) => updateFormData('content', e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: Content['status']) => updateFormData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas"
                value={formData.tags}
                onChange={(e) => updateFormData('tags', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => updateFormData('featured', checked)}
            />
            <Label htmlFor="featured">Featured Content</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={onSave} className="flex-1">
              {currentView === 'add' ? 'Create Content' : 'Update Content'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
