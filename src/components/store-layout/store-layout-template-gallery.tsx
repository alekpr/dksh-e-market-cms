/**
 * Store Layout Template Gallery Component
 * Displays available layout templates for store customization
 */
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Eye, 
  Users, 
  Star, 
  Layout, 
  Image, 
  Palette, 
  Grid, 
  List,
  Loader2,
  Filter,
  SortAsc
} from 'lucide-react'
import { useStoreLayoutTemplates, type StoreLayoutTemplate } from '@/hooks/use-store-layout-templates'

interface StoreLayoutTemplateGalleryProps {
  onSelectTemplate?: (template: StoreLayoutTemplate) => void
  selectedTemplateId?: string
  showCategoryTabs?: boolean
  showFilters?: boolean
  maxItems?: number
}

export function StoreLayoutTemplateGallery({
  onSelectTemplate,
  selectedTemplateId,
  showCategoryTabs = true,
  showFilters = true,
  maxItems
}: StoreLayoutTemplateGalleryProps) {
  const {
    templates,
    loading,
    error,
    getTemplates,
    getTemplatesByCategory,
    getPopularTemplates,
    searchTemplates,
    selectedTemplate,
    setSelectedTemplate
  } = useStoreLayoutTemplates()

  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [selectedIndustry, setSelectedIndustry] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<string>('popularity')

  // Category definitions
  const categories = [
    { value: 'all', label: 'All Templates', icon: Layout },
    { value: 'full-layout', label: 'Full Layouts', icon: Grid },
    { value: 'hero', label: 'Hero Sections', icon: Image },
    { value: 'product', label: 'Product Displays', icon: List },
    { value: 'category', label: 'Categories', icon: Grid },
    { value: 'info', label: 'Info Sections', icon: Layout }
  ]

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'retail', label: 'Retail' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'beauty', label: 'Beauty & Cosmetics' },
    { value: 'general', label: 'General' }
  ]

  // Handle template selection
  const handleSelectTemplate = (template: StoreLayoutTemplate) => {
    setSelectedTemplate(template)
    onSelectTemplate?.(template)
  }

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === 'all') {
      getTemplates({
        industry: selectedIndustry !== 'all' ? selectedIndustry : undefined
      })
    } else {
      getTemplatesByCategory(category)
    }
  }

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      searchTemplates(query, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        industry: selectedIndustry !== 'all' ? selectedIndustry : undefined
      })
    } else {
      handleCategoryChange(selectedCategory)
    }
  }

  // Handle filter changes
  const handleFilterChange = () => {
    const filters: any = {}
    if (selectedIndustry !== 'all') filters.industry = selectedIndustry
    
    if (searchQuery.trim()) {
      searchTemplates(searchQuery, filters)
    } else if (selectedCategory === 'all') {
      getTemplates(filters)
    } else {
      getTemplatesByCategory(selectedCategory)
    }
  }

  React.useEffect(() => {
    console.log('StoreLayoutTemplateGallery: Component mounted, calling handleFilterChange')
    handleFilterChange()
  }, [selectedIndustry])

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'beta': return 'secondary'
      case 'draft': return 'outline'
      case 'deprecated': return 'destructive'
      default: return 'outline'
    }
  }

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'full-layout': return 'bg-blue-100 text-blue-800'
      case 'hero': return 'bg-purple-100 text-purple-800'
      case 'product': return 'bg-green-100 text-green-800'
      case 'category': return 'bg-orange-100 text-orange-800'
      case 'info': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Limit templates if maxItems is specified
  const displayTemplates = maxItems ? templates.slice(0, maxItems) : templates

  // Debug log for selectedTemplateId
  console.log('🎯 StoreLayoutTemplateGallery selectedTemplateId:', selectedTemplateId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Layout Templates</h2>
        <p className="text-muted-foreground">
          Choose from our collection of mobile app layout templates
        </p>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Industry Filter */}
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="usage">Most Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />
        </div>
      )}

      {/* Category Tabs */}
      {showCategoryTabs && (
        <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading templates...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => getTemplates()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayTemplates.map((template) => {
            const isSelected = selectedTemplateId === template._id;
            
            // Debug log for template selection comparison
            if (template.displayName === 'Hero Banner Carousel') {
              console.log('🔍 Hero Banner Carousel comparison:', {
                templateId: template._id,
                selectedTemplateId,
                isSelected,
                templateName: template.displayName
              });
            }
            
            return (
              <TemplateCard
                key={template._id}
                template={template}
                isSelected={isSelected}
                onSelect={() => handleSelectTemplate(template)}
                getCategoryColor={getCategoryColor}
                getStatusBadgeVariant={getStatusBadgeVariant}
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && displayTemplates.length === 0 && (
        <div className="text-center py-12">
          <Layout className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedIndustry('all')
              getTemplates()
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: StoreLayoutTemplate
  isSelected: boolean
  onSelect: () => void
  getCategoryColor: (category: string) => string
  getStatusBadgeVariant: (status: string) => any
}

function TemplateCard({ 
  template, 
  isSelected, 
  onSelect,
  getCategoryColor,
  getStatusBadgeVariant 
}: TemplateCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="space-y-3">
        {/* Template Preview */}
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
          {template.preview.thumbnail ? (
            <img
              src={template.preview.thumbnail}
              alt={template.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Layout className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          {/* Selected Badge */}
          {isSelected && (
            <Badge 
              variant="default"
              className="absolute top-2 left-2 bg-green-600 text-white"
            >
              Selected
            </Badge>
          )}
          
          {/* Status Badge - only show if not selected */}
          {!isSelected && (
            <Badge 
              variant={getStatusBadgeVariant(template.status)}
              className="absolute top-2 right-2"
            >
              {template.status}
            </Badge>
          )}
        </div>

        {/* Template Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{template.displayName}</h3>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getCategoryColor(template.category)}`}
            >
              {template.category}
            </Badge>
          </div>
          
          {template.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Template Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{template.usage.stores} stores</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{template.popularity}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <Button size="sm" className="flex-1">
            Select Template
          </Button>
          
          {template.preview.demoUrl && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                window.open(template.preview.demoUrl, '_blank')
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Template Tags */}
        {template.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {template.metadata.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}