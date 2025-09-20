/**
 * Visual Template Builder
 * Drag-and-drop interface for creating and editing store layout templates
 */
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
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
  Layout,
  Plus,
  Trash2,
  Copy,
  Settings,
  Eye,
  Save,
  Undo,
  Redo,
  GripVertical,
  Image,
  Type,
  Grid,
  ShoppingCart,
  Star,
  Tag,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  Palette,
  Smartphone,
  Tablet,
  Monitor,
  Upload
} from 'lucide-react'

interface TemplateSection {
  id: string
  type: string
  name: string
  config: any
  order: number
}

interface TemplateLayout {
  sections: TemplateSection[]
  globalStyles: {
    colorScheme: 'light' | 'dark' | 'auto'
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
    fontSize: number
    borderRadius: number
    spacing: number
  }
  responsive: {
    mobile: boolean
    tablet: boolean
    desktop: boolean
  }
}

interface Template {
  _id?: string
  name: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  features: string[]
  layout: TemplateLayout
  status: 'draft' | 'pending' | 'active'
}

// Available section types
const SECTION_TYPES = [
  {
    id: 'hero',
    name: 'Hero Banner',
    description: 'Large banner with title, description, and call-to-action',
    icon: Image,
    category: 'Header'
  },
  {
    id: 'navigation',
    name: 'Navigation Menu',
    description: 'Store navigation and menu items',
    icon: Layout,
    category: 'Header'
  },
  {
    id: 'featured-products',
    name: 'Featured Products',
    description: 'Showcase highlighted products',
    icon: Star,
    category: 'Products'
  },
  {
    id: 'product-grid',
    name: 'Product Grid',
    description: 'Grid layout for product listings',
    icon: Grid,
    category: 'Products'
  },
  {
    id: 'product-carousel',
    name: 'Product Carousel',
    description: 'Sliding carousel of products',
    icon: ShoppingCart,
    category: 'Products'
  },
  {
    id: 'categories',
    name: 'Categories',
    description: 'Product category navigation',
    icon: Tag,
    category: 'Navigation'
  },
  {
    id: 'banner',
    name: 'Promotional Banner',
    description: 'Marketing and promotional content',
    icon: Image,
    category: 'Marketing'
  },
  {
    id: 'text-block',
    name: 'Text Block',
    description: 'Rich text content area',
    icon: Type,
    category: 'Content'
  },
  {
    id: 'contact-info',
    name: 'Contact Information',
    description: 'Store contact details',
    icon: Phone,
    category: 'Footer'
  },
  {
    id: 'operating-hours',
    name: 'Operating Hours',
    description: 'Store opening hours',
    icon: Clock,
    category: 'Footer'
  },
  {
    id: 'map',
    name: 'Store Location',
    description: 'Interactive map with store location',
    icon: MapPin,
    category: 'Footer'
  }
]

// Default configurations for each section type
const DEFAULT_CONFIGS = {
  hero: {
    title: 'Welcome to Our Store',
    subtitle: 'Discover amazing products',
    buttonText: 'Shop Now',
    backgroundImage: '',
    textAlignment: 'center',
    height: 'medium'
  },
  navigation: {
    style: 'horizontal',
    showCategories: true,
    showSearch: true,
    showCart: true,
    backgroundColor: '#ffffff',
    textColor: '#000000'
  },
  'featured-products': {
    title: 'Featured Products',
    count: 4,
    layout: 'grid',
    showPrices: true,
    showRatings: true,
    autoRotate: false
  },
  'product-grid': {
    columns: 3,
    rows: 'auto',
    showFilters: true,
    sortOptions: ['name', 'price', 'rating'],
    pagination: true,
    itemsPerPage: 12
  },
  'product-carousel': {
    title: 'Trending Products',
    autoPlay: true,
    autoPlayInterval: 5000,
    showDots: true,
    showArrows: true,
    itemsVisible: 4
  },
  categories: {
    layout: 'grid',
    columns: 4,
    showImages: true,
    showCounts: true,
    style: 'cards'
  },
  banner: {
    title: 'Special Offer',
    description: 'Limited time offer - don\'t miss out!',
    buttonText: 'Learn More',
    backgroundColor: '#f3f4f6',
    textColor: '#000000',
    image: ''
  },
  'text-block': {
    content: 'Add your content here...',
    alignment: 'left',
    fontSize: 'medium',
    backgroundColor: 'transparent',
    padding: 'medium'
  },
  'contact-info': {
    showPhone: true,
    showEmail: true,
    showAddress: true,
    showSocial: true,
    layout: 'vertical'
  },
  'operating-hours': {
    format: '24hour',
    showToday: true,
    style: 'table',
    timezone: 'auto'
  },
  map: {
    zoom: 15,
    style: 'roadmap',
    showMarker: true,
    height: 'medium',
    interactionEnabled: true
  }
}

// Sortable Section Component
function SortableSection({ 
  section, 
  isSelected, 
  onSelect, 
  onDelete, 
  onDuplicate, 
  onEdit 
}: {
  section: TemplateSection
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onEdit: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const sectionType = SECTION_TYPES.find(type => type.id === section.type)
  const SectionIcon = sectionType?.icon || Layout

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <SectionIcon className="h-5 w-5 text-gray-600" />
          <div>
            <h4 className="font-medium">{section.name}</h4>
            <p className="text-sm text-gray-500">{sectionType?.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit() }}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDuplicate() }}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete() }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function TemplateBuilder({ 
  initialTemplate, 
  onSave, 
  onPreview 
}: {
  initialTemplate?: Template
  onSave?: (template: Template) => void
  onPreview?: (template: Template) => void
}) {
  const [template, setTemplate] = useState<Template>(
    initialTemplate || {
      name: 'New Template',
      description: '',
      category: 'retail',
      difficulty: 'beginner',
      tags: [],
      features: [],
      layout: {
        sections: [],
        globalStyles: {
          colorScheme: 'light',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Inter',
          fontSize: 16,
          borderRadius: 8,
          spacing: 16
        },
        responsive: {
          mobile: true,
          tablet: true,
          desktop: true
        }
      },
      status: 'draft'
    }
  )

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('design')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [draggedSection, setDraggedSection] = useState<TemplateSection | null>(null)
  const [editingSection, setEditingSection] = useState<TemplateSection | null>(null)

  // History for undo/redo functionality
  const [history, setHistory] = useState<Template[]>([template])
  const [historyIndex, setHistoryIndex] = useState(0)

  const addToHistory = useCallback((newTemplate: Template) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newTemplate)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setTemplate(history[newIndex])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setTemplate(history[newIndex])
    }
  }, [history, historyIndex])

  const addSection = (sectionType: string) => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      type: sectionType,
      name: SECTION_TYPES.find(type => type.id === sectionType)?.name || sectionType,
      config: DEFAULT_CONFIGS[sectionType as keyof typeof DEFAULT_CONFIGS] || {},
      order: template.layout.sections.length
    }

    const newTemplate = {
      ...template,
      layout: {
        ...template.layout,
        sections: [...template.layout.sections, newSection]
      }
    }

    setTemplate(newTemplate)
    addToHistory(newTemplate)
    setSelectedSectionId(newSection.id)
  }

  const deleteSection = (sectionId: string) => {
    const newTemplate = {
      ...template,
      layout: {
        ...template.layout,
        sections: template.layout.sections.filter(section => section.id !== sectionId)
      }
    }

    setTemplate(newTemplate)
    addToHistory(newTemplate)
    
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null)
    }
  }

  const duplicateSection = (sectionId: string) => {
    const sectionToDuplicate = template.layout.sections.find(section => section.id === sectionId)
    if (!sectionToDuplicate) return

    const newSection: TemplateSection = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}`,
      name: `${sectionToDuplicate.name} (Copy)`,
      order: template.layout.sections.length
    }

    const newTemplate = {
      ...template,
      layout: {
        ...template.layout,
        sections: [...template.layout.sections, newSection]
      }
    }

    setTemplate(newTemplate)
    addToHistory(newTemplate)
  }

  const updateSection = (sectionId: string, updates: Partial<TemplateSection>) => {
    const newTemplate = {
      ...template,
      layout: {
        ...template.layout,
        sections: template.layout.sections.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      }
    }

    setTemplate(newTemplate)
    addToHistory(newTemplate)
  }

  const updateGlobalStyles = (updates: Partial<TemplateLayout['globalStyles']>) => {
    const newTemplate = {
      ...template,
      layout: {
        ...template.layout,
        globalStyles: {
          ...template.layout.globalStyles,
          ...updates
        }
      }
    }

    setTemplate(newTemplate)
    addToHistory(newTemplate)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const section = template.layout.sections.find(s => s.id === event.active.id)
    setDraggedSection(section || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedSection(null)

    if (!over || active.id === over.id) return

    const sections = template.layout.sections
    const activeIndex = sections.findIndex(section => section.id === active.id)
    const overIndex = sections.findIndex(section => section.id === over.id)

    if (activeIndex === -1 || overIndex === -1) return

    const newSections = [...sections]
    const [reorderedSection] = newSections.splice(activeIndex, 1)
    newSections.splice(overIndex, 0, reorderedSection)

    // Update order values
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index
    }))

    const newTemplate = {
      ...template,
      layout: {
        ...template.layout,
        sections: updatedSections
      }
    }

    setTemplate(newTemplate)
    addToHistory(newTemplate)
  }

  const selectedSection = selectedSectionId 
    ? template.layout.sections.find(section => section.id === selectedSectionId)
    : null

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Sections & Components */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Template Builder</h2>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="mt-4">
              {/* Global Styles */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Color Scheme</Label>
                  <Select 
                    value={template.layout.globalStyles.colorScheme} 
                    onValueChange={(value: any) => updateGlobalStyles({ colorScheme: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={template.layout.globalStyles.primaryColor}
                        onChange={(e) => updateGlobalStyles({ primaryColor: e.target.value })}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        value={template.layout.globalStyles.primaryColor}
                        onChange={(e) => updateGlobalStyles({ primaryColor: e.target.value })}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={template.layout.globalStyles.secondaryColor}
                        onChange={(e) => updateGlobalStyles({ secondaryColor: e.target.value })}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        value={template.layout.globalStyles.secondaryColor}
                        onChange={(e) => updateGlobalStyles({ secondaryColor: e.target.value })}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Font Family</Label>
                  <Select 
                    value={template.layout.globalStyles.fontFamily} 
                    onValueChange={(value) => updateGlobalStyles({ fontFamily: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Font Size: {template.layout.globalStyles.fontSize}px
                  </Label>
                  <Slider
                    value={[template.layout.globalStyles.fontSize]}
                    onValueChange={([value]) => updateGlobalStyles({ fontSize: value })}
                    min={12}
                    max={24}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Border Radius: {template.layout.globalStyles.borderRadius}px
                  </Label>
                  <Slider
                    value={[template.layout.globalStyles.borderRadius]}
                    onValueChange={([value]) => updateGlobalStyles({ borderRadius: value })}
                    min={0}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Spacing: {template.layout.globalStyles.spacing}px
                  </Label>
                  <Slider
                    value={[template.layout.globalStyles.spacing]}
                    onValueChange={([value]) => updateGlobalStyles({ spacing: value })}
                    min={8}
                    max={32}
                    step={4}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sections" className="mt-4">
              {/* Section Library */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Available Sections</Label>
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(
                      SECTION_TYPES.reduce((acc, section) => {
                        if (!acc[section.category]) {
                          acc[section.category] = []
                        }
                        acc[section.category].push(section)
                        return acc
                      }, {} as Record<string, typeof SECTION_TYPES>)
                    ).map(([category, sections]) => (
                      <AccordionItem key={category} value={category}>
                        <AccordionTrigger className="text-sm">
                          {category} ({sections.length})
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {sections.map((section) => {
                              const SectionIcon = section.icon
                              return (
                                <div
                                  key={section.id}
                                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  onClick={() => addSection(section.id)}
                                >
                                  <div className="flex items-center gap-2">
                                    <SectionIcon className="h-4 w-4 text-gray-600" />
                                    <div>
                                      <p className="text-sm font-medium">{section.name}</p>
                                      <p className="text-xs text-gray-500">{section.description}</p>
                                    </div>
                                  </div>
                                  <Plus className="h-4 w-4 text-gray-400" />
                                </div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-4">
              {/* Template Settings */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Template Name</Label>
                  <Input
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select 
                    value={template.category} 
                    onValueChange={(value) => setTemplate({ ...template, category: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="beauty">Beauty & Health</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Difficulty</Label>
                  <Select 
                    value={template.difficulty} 
                    onValueChange={(value: any) => setTemplate({ ...template, difficulty: value })}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Responsive Support</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="text-sm">Mobile</span>
                      </div>
                      <Switch
                        checked={template.layout.responsive.mobile}
                        onCheckedChange={(checked) => 
                          setTemplate({
                            ...template,
                            layout: {
                              ...template.layout,
                              responsive: {
                                ...template.layout.responsive,
                                mobile: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tablet className="h-4 w-4" />
                        <span className="text-sm">Tablet</span>
                      </div>
                      <Switch
                        checked={template.layout.responsive.tablet}
                        onCheckedChange={(checked) => 
                          setTemplate({
                            ...template,
                            layout: {
                              ...template.layout,
                              responsive: {
                                ...template.layout.responsive,
                                tablet: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span className="text-sm">Desktop</span>
                      </div>
                      <Switch
                        checked={template.layout.responsive.desktop}
                        onCheckedChange={(checked) => 
                          setTemplate({
                            ...template,
                            layout: {
                              ...template.layout,
                              responsive: {
                                ...template.layout.responsive,
                                desktop: checked
                              }
                            }
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Current Sections */}
        {template.layout.sections.length > 0 && (
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Current Sections ({template.layout.sections.length})</Label>
            </div>

            <DndContext
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={template.layout.sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {template.layout.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        isSelected={selectedSectionId === section.id}
                        onSelect={() => setSelectedSectionId(section.id)}
                        onDelete={() => deleteSection(section.id)}
                        onDuplicate={() => duplicateSection(section.id)}
                        onEdit={() => setEditingSection(section)}
                      />
                    ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {draggedSection && (
                  <div className="border rounded-lg p-4 bg-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <Layout className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium">{draggedSection.name}</h4>
                        <p className="text-sm text-gray-500">
                          {SECTION_TYPES.find(type => type.id === draggedSection.type)?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>

      {/* Main Content - Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{template.name}</h1>
              <Badge variant="outline">{template.layout.sections.length} sections</Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Preview Mode Selector */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                  className="h-8"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                  className="h-8"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                  className="h-8"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <Button variant="outline" onClick={() => onPreview?.(template)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Button onClick={() => onSave?.(template)}>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-100 p-8 overflow-auto">
          <div className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${
            previewMode === 'mobile' ? 'max-w-sm' :
            previewMode === 'tablet' ? 'max-w-2xl' :
            'max-w-6xl'
          }`}>
            {template.layout.sections.length === 0 ? (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Layout className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No sections added</h3>
                  <p className="text-sm">Add sections from the sidebar to start building your template</p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {template.layout.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <div
                      key={section.id}
                      className={`relative group ${
                        selectedSectionId === section.id 
                          ? 'outline outline-2 outline-blue-500 outline-offset-2' 
                          : ''
                      }`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      {/* Section Preview (Simplified) */}
                      <div className="min-h-[100px] p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{section.name}</h3>
                            <p className="text-sm text-gray-500">
                              {SECTION_TYPES.find(type => type.id === section.type)?.description}
                            </p>
                          </div>
                          <Badge variant="outline">{section.type}</Badge>
                        </div>
                        
                        {/* Basic preview based on section type */}
                        <div className="mt-4">
                          {section.type === 'hero' && (
                            <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded">
                              <h2 className="text-2xl font-bold mb-2">{section.config.title || 'Hero Title'}</h2>
                              <p className="text-gray-600 mb-4">{section.config.subtitle || 'Hero subtitle'}</p>
                              <div className="inline-block px-6 py-2 bg-blue-600 text-white rounded">
                                {section.config.buttonText || 'Call to Action'}
                              </div>
                            </div>
                          )}
                          
                          {section.type === 'product-grid' && (
                            <div className={`grid gap-4 ${
                              section.config.columns === 2 ? 'grid-cols-2' :
                              section.config.columns === 3 ? 'grid-cols-3' :
                              section.config.columns === 4 ? 'grid-cols-4' :
                              'grid-cols-3'
                            }`}>
                              {Array.from({ length: Math.min(section.config.columns || 3, 6) }).map((_, i) => (
                                <div key={i} className="bg-white p-4 rounded border">
                                  <div className="w-full h-24 bg-gray-200 rounded mb-2"></div>
                                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                  <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {section.type === 'banner' && (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded text-center">
                              <h3 className="text-xl font-semibold mb-2">{section.config.title || 'Banner Title'}</h3>
                              <p className="text-gray-600 mb-4">{section.config.description || 'Banner description'}</p>
                              <div className="inline-block px-4 py-2 bg-green-600 text-white rounded">
                                {section.config.buttonText || 'Learn More'}
                              </div>
                            </div>
                          )}
                          
                          {section.type === 'text-block' && (
                            <div className="p-4 bg-white rounded">
                              <p>{section.config.content || 'Text content goes here...'}</p>
                            </div>
                          )}
                          
                          {!['hero', 'product-grid', 'banner', 'text-block'].includes(section.type) && (
                            <div className="p-8 text-center bg-white rounded border-2 border-dashed border-gray-300">
                              <p className="text-gray-500">Section Preview: {section.type}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Section Controls Overlay */}
                      {selectedSectionId === section.id && (
                        <div className="absolute top-2 right-2 flex gap-1 bg-white rounded shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingSection(section) }}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); duplicateSection(section.id) }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteSection(section.id) }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Configuration Dialog */}
      {editingSection && (
        <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure {editingSection.name}</DialogTitle>
              <DialogDescription>
                Customize the settings for this section
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Section Name */}
              <div>
                <Label className="text-sm font-medium">Section Name</Label>
                <Input
                  value={editingSection.name}
                  onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Dynamic configuration based on section type */}
              {editingSection.type === 'hero' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <Input
                      value={editingSection.config.title || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, title: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Subtitle</Label>
                    <Input
                      value={editingSection.config.subtitle || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, subtitle: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Button Text</Label>
                    <Input
                      value={editingSection.config.buttonText || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, buttonText: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Text Alignment</Label>
                    <Select
                      value={editingSection.config.textAlignment || 'center'}
                      onValueChange={(value) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, textAlignment: value }
                      })}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {editingSection.type === 'product-grid' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Columns: {editingSection.config.columns || 3}
                    </Label>
                    <Slider
                      value={[editingSection.config.columns || 3]}
                      onValueChange={([value]) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, columns: value }
                      })}
                      min={1}
                      max={6}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Items per page: {editingSection.config.itemsPerPage || 12}
                    </Label>
                    <Slider
                      value={[editingSection.config.itemsPerPage || 12]}
                      onValueChange={([value]) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, itemsPerPage: value }
                      })}
                      min={4}
                      max={24}
                      step={4}
                      className="mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Show Filters</Label>
                      <Switch
                        checked={editingSection.config.showFilters || false}
                        onCheckedChange={(checked) => setEditingSection({
                          ...editingSection,
                          config: { ...editingSection.config, showFilters: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Show Prices</Label>
                      <Switch
                        checked={editingSection.config.showPrices !== false}
                        onCheckedChange={(checked) => setEditingSection({
                          ...editingSection,
                          config: { ...editingSection.config, showPrices: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Pagination</Label>
                      <Switch
                        checked={editingSection.config.pagination !== false}
                        onCheckedChange={(checked) => setEditingSection({
                          ...editingSection,
                          config: { ...editingSection.config, pagination: checked }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingSection.type === 'banner' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Title</Label>
                    <Input
                      value={editingSection.config.title || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, title: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      value={editingSection.config.description || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, description: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Button Text</Label>
                    <Input
                      value={editingSection.config.buttonText || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, buttonText: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Background Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={editingSection.config.backgroundColor || '#f3f4f6'}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          config: { ...editingSection.config, backgroundColor: e.target.value }
                        })}
                        className="w-12 h-8 p-1 border rounded"
                      />
                      <Input
                        value={editingSection.config.backgroundColor || '#f3f4f6'}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          config: { ...editingSection.config, backgroundColor: e.target.value }
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingSection.type === 'text-block' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Content</Label>
                    <Textarea
                      value={editingSection.config.content || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, content: e.target.value }
                      })}
                      className="mt-1"
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Alignment</Label>
                    <Select
                      value={editingSection.config.alignment || 'left'}
                      onValueChange={(value) => setEditingSection({
                        ...editingSection,
                        config: { ...editingSection.config, alignment: value }
                      })}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="justify">Justify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                updateSection(editingSection.id, editingSection)
                setEditingSection(null)
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}