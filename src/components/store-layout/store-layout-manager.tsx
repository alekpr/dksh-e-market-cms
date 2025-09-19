/**
 * Store Layout Manager Component
 * Manages store layout template selection and customization
 */
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Save, 
  Eye, 
  RotateCcw, 
  Download,
  Upload,
  Settings,
  Palette,
  Type,
  Layout,
  Grid,
  Smartphone,
  Monitor,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { useStoreLayoutTemplates, type StoreLayout, type StoreLayoutTemplate } from '@/hooks/use-store-layout-templates'
import { StoreLayoutTemplateGallery } from './store-layout-template-gallery'

interface StoreLayoutManagerProps {
  storeId: string
  onSave?: (layout: StoreLayout) => void
  onPreview?: (layout: StoreLayout) => void
}

export function StoreLayoutManager({ storeId, onSave, onPreview }: StoreLayoutManagerProps) {
  const {
    storeLayout,
    loading,
    error,
    updateStoreTemplate,
    updateStoreColors,
    updateStoreTypography,
    previewStoreLayout,
    revertStoreLayout,
    getStoreLayout,
    selectedTemplate,
    setSelectedTemplate
  } = useStoreLayoutTemplates()

  const [activeTab, setActiveTab] = React.useState('customization')
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [customization, setCustomization] = React.useState({
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#1F2937',
      muted: '#6B7280'
    },
    typography: {
      fontSize: 'medium',
      fontWeight: 'normal',
      lineHeight: 'normal'
    },
    sectionSettings: {} as Record<string, any>
  })

  // Load store layout on mount
  React.useEffect(() => {
    if (storeId) {
      getStoreLayout(storeId)
    }
  }, [storeId])

  // Update customization when store layout changes
  React.useEffect(() => {
    if (storeLayout) {
      setCustomization({
        colors: storeLayout.customization?.colors || customization.colors,
        typography: storeLayout.customization?.typography || customization.typography,
        sectionSettings: storeLayout.customization?.sectionSettings || {}
      })
    }
  }, [storeLayout])

  // Handle template selection
  const handleTemplateSelect = async (template: StoreLayoutTemplate) => {
    try {
      await updateStoreTemplate(storeId, template._id)
      setSelectedTemplate(template)
      setHasUnsavedChanges(true)
      setActiveTab('customization')
    } catch (error) {
      console.error('Failed to select template:', error)
    }
  }

  // Handle color changes
  const handleColorChange = (colorKey: string, color: string) => {
    const newColors = {
      ...customization.colors,
      [colorKey]: color
    }
    setCustomization(prev => ({
      ...prev,
      colors: newColors
    }))
    setHasUnsavedChanges(true)
  }

  // Handle typography changes
  const handleTypographyChange = (typographyKey: string, value: string) => {
    const newTypography = {
      ...customization.typography,
      [typographyKey]: value
    }
    setCustomization(prev => ({
      ...prev,
      typography: newTypography
    }))
    setHasUnsavedChanges(true)
  }

  // Handle section settings
  const handleSectionSettingChange = (sectionId: string, settingKey: string, value: any) => {
    const newSectionSettings = {
      ...customization.sectionSettings,
      [sectionId]: {
        ...customization.sectionSettings[sectionId],
        [settingKey]: value
      }
    }
    setCustomization(prev => ({
      ...prev,
      sectionSettings: newSectionSettings
    }))
    setHasUnsavedChanges(true)
  }

  // Save changes
  const handleSave = async () => {
    try {
      // Update colors
      await updateStoreColors(storeId, customization.colors)
      
      // Update typography
      await updateStoreTypography(storeId, customization.typography)
      
      setHasUnsavedChanges(false)
      
      if (storeLayout && onSave) {
        onSave(storeLayout)
      }
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }

  // Preview layout
  const handlePreview = async () => {
    try {
      const previewData = await previewStoreLayout(storeId, customization)
      setIsPreviewMode(true)
      
      if (previewData && onPreview) {
        onPreview(previewData)
      }
    } catch (error) {
      console.error('Failed to preview layout:', error)
    }
  }

  // Revert changes
  const handleRevert = async () => {
    try {
      await revertStoreLayout(storeId)
      setHasUnsavedChanges(false)
      await getStoreLayout(storeId)
    } catch (error) {
      console.error('Failed to revert layout:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Layout Manager</h1>
          <p className="text-muted-foreground">
            Customize your store's mobile app appearance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={loading}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button
            variant="outline"
            onClick={handleRevert}
            disabled={loading || !hasUnsavedChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Revert
          </Button>

          <Button
            onClick={handleSave}
            disabled={loading || !hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Status Indicator */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-800 font-medium">You have unsaved changes</span>
          </div>
        </div>
      )}

      {/* Current Layout Info */}
      {storeLayout && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  Current Layout
                </CardTitle>
                <CardDescription>
                  Active template and customization settings
                </CardDescription>
              </div>
              
              <Badge variant="secondary">
                            <Badge variant="secondary">
              {storeLayout.template?.displayName || selectedTemplate?.displayName || 'No Template Selected'}
            </Badge>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Template</Label>
                <p className="text-sm text-muted-foreground">
                  {storeLayout.template?.displayName || selectedTemplate?.displayName || 'None'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Last Updated</Label>
                <p className="text-sm text-muted-foreground">
                  {storeLayout.updatedAt ? new Date(storeLayout.updatedAt).toLocaleString() : 'Never'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Navigation - Full Width */}
        <div className="w-full">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Configuration
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Customize your layout settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="horizontal">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 backdrop-blur-sm h-auto">
                  <TabsTrigger 
                    value="customization" 
                    className="justify-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50 h-16 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white flex-shrink-0">
                        <Palette className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">Customization</div>
                        <div className="text-xs text-gray-500">Colors & Typography</div>
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sections" 
                    className="justify-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50 h-16 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white flex-shrink-0">
                        <Layout className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">Sections</div>
                        <div className="text-xs text-gray-500">Layout Components</div>
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    className="justify-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50 h-16 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white flex-shrink-0">
                        <Smartphone className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">Preview</div>
                        <div className="text-xs text-gray-500">Live Preview</div>
                      </div>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                {/* Quick Stats */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-3">Quick Stats</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Template</span>
                      <span className="font-medium">{selectedTemplate?.name || 'None'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Modified</span>
                      <span className="font-medium">{'Never'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Content Panel - Full Width */}
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Customization Tab */}
            <TabsContent value="customization" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Colors Section */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        <Palette className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">Colors</div>
                        <div className="text-sm text-gray-600 font-normal">Brand color palette</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {Object.entries(customization.colors).map(([key, value]) => (
                      <div key={key} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="capitalize font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {key}
                          </Label>
                          <div className="text-xs text-gray-500 font-mono">{value}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Input
                              type="color"
                              value={value}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="w-14 h-12 p-1 border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            />
                            <div className="absolute inset-0 rounded-xl ring-2 ring-offset-2 ring-transparent group-hover:ring-blue-200 transition-all pointer-events-none"></div>
                          </div>
                          <Input
                            type="text"
                            value={value}
                            onChange={(e) => handleColorChange(key, e.target.value)}
                            className="flex-1 font-mono text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {/* Color Presets */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-3">Color Presets</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: 'Default', colors: ['#3B82F6', '#64748B', '#F59E0B'] },
                          { name: 'Dark', colors: ['#1F2937', '#374151', '#F59E0B'] },
                          { name: 'Green', colors: ['#10B981', '#6B7280', '#F59E0B'] }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group"
                            onClick={() => {
                              // Apply preset colors
                              const newColors = {
                                primary: preset.colors[0],
                                secondary: preset.colors[1],
                                accent: preset.colors[2],
                                background: '#FFFFFF',
                                text: '#1F2937',
                                muted: '#6B7280'
                              }
                              Object.entries(newColors).forEach(([key, color]) => {
                                handleColorChange(key, color)
                              })
                            }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {preset.colors.map((color, i) => (
                                <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                              ))}
                            </div>
                            <div className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
                              {preset.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Typography Section */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        <Type className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">Typography</div>
                        <div className="text-sm text-gray-600 font-normal">Text appearance settings</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Font Size */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium text-gray-700">Font Size</Label>
                        <span className="text-sm text-gray-500 capitalize">{customization.typography.fontSize}</span>
                      </div>
                      <Select
                        value={customization.typography.fontSize}
                        onValueChange={(value) => handleTypographyChange('fontSize', value)}
                      >
                        <SelectTrigger className="border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Small</span>
                              <span className="text-xs text-gray-500">14px</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <span className="text-base">Medium</span>
                              <span className="text-xs text-gray-500">16px</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="large">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">Large</span>
                              <span className="text-xs text-gray-500">18px</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Font Weight */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium text-gray-700">Font Weight</Label>
                        <span className="text-sm text-gray-500 capitalize">{customization.typography.fontWeight}</span>
                      </div>
                      <Select
                        value={customization.typography.fontWeight}
                        onValueChange={(value) => handleTypographyChange('fontWeight', value)}
                      >
                        <SelectTrigger className="border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                          <SelectValue placeholder="Select font weight" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <span className="font-light">Light (300)</span>
                          </SelectItem>
                          <SelectItem value="normal">
                            <span className="font-normal">Normal (400)</span>
                          </SelectItem>
                          <SelectItem value="bold">
                            <span className="font-bold">Bold (700)</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Line Height */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium text-gray-700">Line Height</Label>
                        <span className="text-sm text-gray-500 capitalize">{customization.typography.lineHeight}</span>
                      </div>
                      <Select
                        value={customization.typography.lineHeight}
                        onValueChange={(value) => handleTypographyChange('lineHeight', value)}
                      >
                        <SelectTrigger className="border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                          <SelectValue placeholder="Select line height" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tight">
                            <div className="flex items-center gap-2">
                              <span>Tight</span>
                              <span className="text-xs text-gray-500">1.25</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="normal">
                            <div className="flex items-center gap-2">
                              <span>Normal</span>
                              <span className="text-xs text-gray-500">1.5</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="relaxed">
                            <div className="flex items-center gap-2">
                              <span>Relaxed</span>
                              <span className="text-xs text-gray-500">1.75</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Typography Preview */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-3">Preview</div>
                      <div 
                        className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                        style={{
                          fontSize: customization.typography.fontSize === 'small' ? '14px' : 
                                   customization.typography.fontSize === 'large' ? '18px' : '16px',
                          fontWeight: customization.typography.fontWeight === 'light' ? '300' :
                                     customization.typography.fontWeight === 'bold' ? '700' : '400',
                          lineHeight: customization.typography.lineHeight === 'tight' ? '1.25' :
                                     customization.typography.lineHeight === 'relaxed' ? '1.75' : '1.5'
                        }}
                      >
                        <div className="space-y-2">
                          <h3 className="font-semibold">Sample Heading</h3>
                          <p>This is how your text will appear in the mobile app. You can see how different typography settings affect readability and visual appeal.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Section Configuration</CardTitle>
                  <CardDescription>
                    Configure individual sections of your layout
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTemplate?.sections?.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{section.displayName}</h4>
                        <Switch
                          checked={customization.sectionSettings[section.id]?.enabled !== false}
                          onCheckedChange={(enabled) => 
                            handleSectionSettingChange(section.id, 'enabled', enabled)
                          }
                        />
                      </div>
                      
                      {section.description && (
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      )}

                      {/* Section-specific settings would go here */}
                      <div className="grid grid-cols-2 gap-4">
                        {section.configuration?.showTitle !== undefined && (
                          <div className="flex items-center justify-between">
                            <Label>Show Title</Label>
                            <Switch
                              checked={customization.sectionSettings[section.id]?.showTitle !== false}
                              onCheckedChange={(showTitle) => 
                                handleSectionSettingChange(section.id, 'showTitle', showTitle)
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8">
                      <Info className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-muted-foreground">
                        Select a template to configure sections
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile Preview
                  </CardTitle>
                  <CardDescription>
                    Preview how your store will look in the mobile app
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-96">
                    <div className="text-center">
                      <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Mobile Preview
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Preview functionality will be available here
                      </p>
                      <Button onClick={handlePreview} disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Generate Preview
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}