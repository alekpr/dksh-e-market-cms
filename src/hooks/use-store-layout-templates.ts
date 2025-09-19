/**
 * Custom React Hook for Store Layout Templates Management
 * Provides functionality for managing store layout templates and customizations
 */
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'

// Interface for template sections
export interface TemplateSection {
  id: string
  type: string
  displayName: string
  description?: string
  configuration: {
    showTitle?: boolean
    itemsPerRow?: number
    showDescription?: boolean
    backgroundColor?: string
    textColor?: string
    [key: string]: any
  }
  order: number
  required: boolean
}

// Interface for layout templates
export interface StoreLayoutTemplate {
  _id: string
  name: string
  displayName: string
  description?: string
  category: string
  industry: string[]
  sections: TemplateSection[]
  preview: {
    thumbnail?: string
    screenshots: string[]
    demoUrl?: string
  }
  configuration: {
    responsive: boolean
    customizable: boolean
    supportedDevices: string[]
  }
  metadata: {
    tags: string[]
    features: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedSetupTime: number
  }
  usage: {
    stores: number
    downloads: number
  }
  popularity: number
  rating: {
    average: number
    count: number
  }
  status: 'active' | 'beta' | 'draft' | 'deprecated'
  version: string
  createdAt: string
  updatedAt: string
}

// Interface for store layout customization
export interface StoreLayout {
  _id: string
  storeId: string
  templateId: string
  template?: StoreLayoutTemplate
  customization: {
    colors?: {
      primary: string
      secondary: string
      accent: string
      background: string
      text: string
      muted: string
    }
    typography?: {
      fontSize: string
      fontWeight: string
      lineHeight: string
    }
    sectionSettings?: Record<string, any>
    theme: {
      colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        text: {
          primary: string
          secondary: string
        }
      }
      typography: {
        fontFamily: string
        fontSize: {
          small: number
          medium: number
          large: number
          xlarge: number
        }
        fontWeight: {
          light: number
          normal: number
          bold: number
        }
      }
      spacing: {
        xs: number
        sm: number
        md: number
        lg: number
        xl: number
      }
      borders: {
        radius: {
          small: number
          medium: number
          large: number
        }
      }
    }
    sections: Record<string, {
      enabled: boolean
      configuration: Record<string, any>
    }>
  }
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

// Hook return type
interface UseStoreLayoutTemplatesReturn {
  // Template state
  templates: StoreLayoutTemplate[]
  loading: boolean
  error: string | null
  selectedTemplate: StoreLayoutTemplate | null
  
  // Store layout state
  storeLayout: StoreLayout | null
  previewMode: boolean
  
  // Template operations
  getTemplates: (filters?: { category?: string; industry?: string }) => Promise<void>
  getTemplatesByCategory: (category: string) => Promise<void>
  getPopularTemplates: () => Promise<void>
  searchTemplates: (query: string, filters?: { category?: string; industry?: string }) => Promise<void>
  
  // Store layout operations
  getStoreLayout: (storeId: string) => Promise<void>
  updateStoreTemplate: (storeId: string, templateId: string) => Promise<void>
  updateStoreColors: (storeId: string, colors: Record<string, string>) => Promise<void>
  updateStoreTypography: (storeId: string, typography: Record<string, string>) => Promise<void>
  previewStoreLayout: (storeId: string, customization: any) => Promise<any>
  revertStoreLayout: (storeId: string) => Promise<any>
  
  // UI state setters
  setSelectedTemplate: (template: StoreLayoutTemplate | null) => void
  setPreviewMode: (preview: boolean) => void
}

export function useStoreLayoutTemplates(): UseStoreLayoutTemplatesReturn {
  // State management
  const [templates, setTemplates] = useState<StoreLayoutTemplate[]>([])
  const [storeLayout, setStoreLayout] = useState<StoreLayout | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<StoreLayoutTemplate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const { toast } = useToast()

  // Helper function for API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const method = options.method?.toUpperCase() || 'GET'
    const body = options.body ? JSON.parse(options.body as string) : undefined
    
    let response
    switch (method) {
      case 'GET':
        response = await apiClient.get(endpoint)
        break
      case 'POST':
        response = await apiClient.post(endpoint, body)
        break
      case 'PATCH':
        response = await apiClient.patch(endpoint, body)
        break
      case 'PUT':
        response = await apiClient.put(endpoint, body)
        break
      case 'DELETE':
        response = await apiClient.delete(endpoint)
        break
      default:
        response = await apiClient.get(endpoint)
    }
    
    // Return just the data part to match expected format
    return response.data || response
  }

  // Template operations
  const getTemplates = useCallback(async (filters?: { category?: string; industry?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (filters?.category) queryParams.append('category', filters.category)
      if (filters?.industry) queryParams.append('industry', filters.industry)

      const data = await apiCall(`/store-layout-templates?${queryParams}`)
      
      // API returns { status, results, pagination, data: { templates: [...] } }
      const templateArray = (data as any)?.templates || []
      setTemplates(templateArray)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const getTemplatesByCategory = async (category: string) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall(`/store-layout-templates/category/${category}`)
      const templateArray = (data as any)?.templates || []
      setTemplates(templateArray)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getPopularTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall('/store-layout-templates/popular')
      setTemplates((data as any)?.templates || [])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch popular templates'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const searchTemplates = async (query: string, filters?: { category?: string; industry?: string }) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams({ q: query })
      if (filters?.category) queryParams.append('category', filters.category)
      if (filters?.industry) queryParams.append('industry', filters.industry)

      const data = await apiCall(`/store-layout-templates/search?${queryParams}`)
      setTemplates((data as any)?.templates || [])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search templates'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Store layout operations
  const getStoreLayout = useCallback(async (storeId: string) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall(`/stores/${storeId}/layout`)
      console.log('🔍 Store layout response data:', JSON.stringify(data, null, 2))
      setStoreLayout(data as any)

      // Check for template in different possible locations
      const layout = (data as any)?.layout
      if (layout) {
        console.log('📦 Layout object:', JSON.stringify(layout, null, 2))
        
        if (layout.template) {
          console.log('✅ Setting selected template from layout.template:', layout.template)
          
          // Map API field 'id' to expected field '_id' if needed
          const templateWithCorrectId = {
            ...layout.template,
            _id: layout.template._id || layout.template.id
          }
          
          setSelectedTemplate(templateWithCorrectId)
          console.log('🎯 After setSelectedTemplate - template._id:', templateWithCorrectId._id)
        } else if (layout.templateId) {
          console.log('🔍 Found templateId in layout, creating template object:', layout.templateId)
          setSelectedTemplate({ _id: layout.templateId } as any)
        } else {
          console.log('⚠️ No template or templateId found in layout object')
        }
      } else if ((data as any)?.template) {
        console.log('✅ Setting selected template from data.template:', (data as any).template)
        setSelectedTemplate((data as any).template)
      } else if ((data as any)?.templateId) {
        console.log('🔍 Found templateId in data, creating template object:', (data as any).templateId)
        setSelectedTemplate({ _id: (data as any).templateId } as any)
      } else {
        console.log('⚠️ No template data found in response at all')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch store layout'
      setError(errorMessage)
      
      // Don't show error toast for 404 - it means store hasn't selected a template yet
      if (!errorMessage.includes('404') && !errorMessage.includes('not found')) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }, [toast])

  const updateStoreTemplate = async (storeId: string, templateId: string) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall(`/stores/${storeId}/layout/template`, {
        method: 'PATCH',
        body: JSON.stringify({ templateId }),
      })

      setStoreLayout(data as any)

      toast({
        title: 'Template Updated',
        description: 'Store template has been updated successfully',
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template'
      setError(errorMessage)
      toast({
        title: 'Update Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateStoreColors = async (storeId: string, colors: Record<string, string>) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall(`/stores/${storeId}/layout/colors`, {
        method: 'PATCH',
        body: JSON.stringify({ colors }),
      })

      setStoreLayout(data as any)

      toast({
        title: 'Colors Updated',
        description: 'Store colors have been updated successfully',
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update colors'
      setError(errorMessage)
      toast({
        title: 'Update Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateStoreTypography = async (storeId: string, typography: Record<string, string>) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall(`/stores/${storeId}/layout/typography`, {
        method: 'PATCH',
        body: JSON.stringify({ typography }),
      })

      setStoreLayout(data as any)

      toast({
        title: 'Typography Updated',
        description: 'Store typography has been updated successfully',
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update typography'
      setError(errorMessage)
      toast({
        title: 'Update Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const previewStoreLayout = async (storeId: string, customization: any) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall(`/stores/${storeId}/layout/preview`, {
        method: 'POST',
        body: JSON.stringify({ customization }),
      })

      return data as any

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to preview layout'
      setError(errorMessage)
      toast({
        title: 'Preview Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const revertStoreLayout = async (storeId: string) => {
    try {
      setLoading(true)
      setError(null)

      const data = await apiCall(`/stores/${storeId}/layout/revert`, {
        method: 'POST',
      })

      setStoreLayout(data as any)

      toast({
        title: 'Layout Reverted',
        description: 'Layout has been reverted to default settings',
      })

      return data as any

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revert layout'
      setError(errorMessage)
      toast({
        title: 'Revert Error',
        description: errorMessage,
        variant: 'destructive',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Load popular templates on mount
  useEffect(() => {
    getPopularTemplates()
  }, [])

  return {
    // Template state
    templates,
    loading,
    error,
    selectedTemplate,
    
    // Store layout state
    storeLayout,
    previewMode,
    
    // Template operations
    getTemplates,
    getTemplatesByCategory,
    getPopularTemplates,
    searchTemplates,
    
    // Store layout operations
    getStoreLayout,
    updateStoreTemplate,
    updateStoreColors,
    updateStoreTypography,
    previewStoreLayout,
    revertStoreLayout,
    
    // UI state setters
    setSelectedTemplate,
    setPreviewMode
  }
}