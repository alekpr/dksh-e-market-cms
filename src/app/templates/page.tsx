import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
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
import { IconEdit, IconTrash, IconPlus, IconTemplate } from '@tabler/icons-react'

// Template interface based on the provided database schema
interface Template {
  _id: string
  name: string
  type: 'homepage' | 'store' | 'product' | 'category'
  description?: string
  sections: TemplateSection[]
  configuration: TemplateConfiguration
  metadata: TemplateMetadata
  previewImage?: string
  createdAt: string
  updatedAt: string
  isActive: boolean
}

interface TemplateSection {
  type: string
  name: string
  position: number
  configuration: Record<string, any>
  isVisible: boolean
}

interface TemplateConfiguration {
  layout: 'grid' | 'list' | 'custom'
  columns?: number
  spacing?: 'sm' | 'md' | 'lg'
  colorScheme?: string
  customization: Record<string, any>
}

interface TemplateMetadata {
  category?: string
  tags: string[]
  version: string
  author: string
  compatibility: string[]
}

// Mock API functions - replace with actual API calls
const templateAPI = {
  async getAll(): Promise<Template[]> {
    // Mock data for demonstration
    return [
      {
        _id: '1',
        name: 'Default Homepage',
        type: 'homepage',
        description: 'Standard homepage template with banner and product sections',
        sections: [
          {
            type: 'banner-carousel',
            name: 'Main Banner',
            position: 1,
            configuration: { autoplay: true, showDots: true },
            isVisible: true
          },
          {
            type: 'icon-grid',
            name: 'Categories',
            position: 2,
            configuration: { columns: 4, spacing: 'md' },
            isVisible: true
          }
        ],
        configuration: {
          layout: 'grid',
          columns: 1,
          spacing: 'md',
          customization: {}
        },
        metadata: {
          category: 'homepage',
          tags: ['default', 'standard'],
          version: '1.0.0',
          author: 'System',
          compatibility: ['web', 'mobile']
        },
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        isActive: true
      }
    ]
  },

  async create(template: Omit<Template, '_id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    // Mock create
    return {
      ...template,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  async update(id: string, updates: Partial<Template>): Promise<Template> {
    // Mock update
    const templates = await this.getAll()
    const existing = templates.find(t => t._id === id)
    if (!existing) throw new Error('Template not found')
    
    return {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    }
  },

  async delete(id: string): Promise<void> {
    // Mock delete
    console.log('Deleting template:', id)
  }
}

export default function TemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const data = await templateAPI.getAll()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setIsEditDialogOpen(true)
  }

  const handleSave = async (templateData: Partial<Template>) => {
    try {
      if (editingTemplate) {
        // Update existing template
        const updated = await templateAPI.update(editingTemplate._id, templateData)
        setTemplates(prev => prev.map(t => t._id === updated._id ? updated : t))
      } else {
        // Create new template
        const created = await templateAPI.create({
          name: templateData.name || '',
          type: templateData.type || 'homepage',
          description: templateData.description,
          sections: templateData.sections || [],
          configuration: templateData.configuration || {
            layout: 'grid',
            customization: {}
          },
          metadata: templateData.metadata || {
            tags: [],
            version: '1.0.0',
            author: 'User',
            compatibility: ['web']
          },
          isActive: templateData.isActive ?? true
        })
        setTemplates(prev => [...prev, created])
      }
      
      setIsEditDialogOpen(false)
      setEditingTemplate(null)
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await templateAPI.delete(id)
      setTemplates(prev => prev.filter(t => t._id !== id))
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
          <p className="text-muted-foreground">
            Manage your store and page templates
          </p>
        </div>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              <IconPlus className="w-4 h-4 mr-2" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <TemplateEditForm 
              template={editingTemplate}
              onSave={handleSave}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingTemplate(null)
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {templates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <IconTemplate className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first template
              </p>
              <Button onClick={() => setIsEditDialogOpen(true)}>
                <IconPlus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{template.type}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {template.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <IconEdit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <IconTrash className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the template
                            "{template.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(template._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Sections ({template.sections.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {template.sections.map((section, index) => (
                        <Badge key={index} variant="outline">
                          {section.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Layout:</span> {template.configuration.layout}
                    </div>
                    <div>
                      <span className="font-medium">Version:</span> {template.metadata.version}
                    </div>
                    <div>
                      <span className="font-medium">Author:</span> {template.metadata.author}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {template.metadata.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.metadata.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Template Edit Form Component
function TemplateEditForm({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: Template | null
  onSave: (data: Partial<Template>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'homepage' as const,
    description: template?.description || '',
    isActive: template?.isActive ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {template ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogDescription>
          {template ? 'Update template information' : 'Create a new template for your store'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Template Type</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full p-2 border border-input rounded-md"
            required
          >
            <option value="homepage">Homepage</option>
            <option value="store">Store</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter template description"
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border border-input"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {template ? 'Update' : 'Create'} Template
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}