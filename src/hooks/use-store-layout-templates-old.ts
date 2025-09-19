/**
 * Store Layout Template Management Hook
 * React hook for managing store layout templates in CMS
 */
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface StoreLayoutTemplate {
  _id: string
  name: string
  displayName: string
  description?: string
  category: 'hero' | 'product' | 'category' | 'info' | 'full-layout'
  type: string
  preview: {
    thumbnail?: string
    screenshots?: string[]
    demoUrl?: string
  }
  configuration: {
    sections: Array<{
      name: string
      type: string
      position: number
      required: boolean
      customizable: boolean
      defaultSettings: any
    }>
    layout: {
      columns: number
      spacing: 'tight' | 'normal' | 'loose'
      aspectRatio: 'square' | 'landscape' | 'portrait' | 'auto'
    }
    customizationOptions: {
      colors: { enabled: boolean; options: any[] }
      typography: { enabled: boolean; options: any[] }
      spacing: { enabled: boolean; options: any[] }
      borders: { enabled: boolean; options: any[] }
    }
  }
  status: 'draft' | 'active' | 'deprecated' | 'beta'
  popularity: number
  usage: {
    stores: number
    lastUsed?: Date
  }
  metadata: {
    version: string
    author?: string
    tags: string[]
    industry: string[]
  }
  createdAt: Date
  updatedAt: Date
}

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

export interface UseStoreLayoutTemplatesReturn {
  // Templates management
  templates: StoreLayoutTemplate[]
  loading: boolean
  error: string | null
  
  // Template operations
  getTemplates: (filters?: any) => Promise<void>
  getTemplatesByCategory: (category: string) => Promise<void>
  getPopularTemplates: (limit?: number) => Promise<void>
  searchTemplates: (query: string, filters?: any) => Promise<void>
  
  // Store layout management
  storeLayout: StoreLayout | null
  getStoreLayout: (storeId: string) => Promise<void>
  updateStoreTemplate: (storeId: string, templateId: string) => Promise<void>
  updateStoreColors: (storeId: string, colors: any) => Promise<void>
  updateStoreTypography: (storeId: string, typography: any) => Promise<void>
  updateSectionSettings: (storeId: string, sectionName: string, settings: any) => Promise<void>
  toggleSection: (storeId: string, sectionName: string, enabled: boolean) => Promise<void>
  reorderSections: (storeId: string, sectionsOrder: string[]) => Promise<void>
  updateBackground: (storeId: string, background: any) => Promise<void>
  resetStoreLayout: (storeId: string) => Promise<void>
  previewLayoutChanges: (storeId: string, changes: any) => Promise<any>
  
  // UI state
  selectedTemplate: StoreLayoutTemplate | null
  setSelectedTemplate: (template: StoreLayoutTemplate | null) => void
  previewMode: boolean
  setPreviewMode: (enabled: boolean) => void
}

export function useStoreLayoutTemplates(): UseStoreLayoutTemplatesReturn {
  const [templates, setTemplates] = useState<StoreLayoutTemplate[]>([])
  const [storeLayout, setStoreLayout] = useState<StoreLayout | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<StoreLayoutTemplate | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://54.251.126.43:3000/api/v1'

  // Helper function to make API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('access_token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // Template operations
  const getTemplates = async (filters: any = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      
      const data = await apiCall(`/store-layout-templates?${queryParams}`)
      setTemplates(data.data.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
      toast.error('Failed to load layout templates')
    } finally {
      setLoading(false)
    }
  }

  const getTemplatesByCategory = async (category: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiCall(`/store-layout-templates/category/${category}`)
      setTemplates(data.data.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
      toast.error('Failed to load templates by category')
    } finally {
      setLoading(false)
    }
  }

  const getPopularTemplates = async (limit = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiCall(`/store-layout-templates/popular?limit=${limit}`)
      setTemplates(data.data.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular templates')
      toast.error('Failed to load popular templates')
    } finally {
      setLoading(false)
    }
  }

  const searchTemplates = async (query: string, filters: any = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams({ search: query })
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key])
      })
      
      const data = await apiCall(`/store-layout-templates?${queryParams}`)
      setTemplates(data.data.templates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search templates')
      toast.error('Failed to search templates')
    } finally {
      setLoading(false)
    }
  }

  // Store layout operations
  const getStoreLayout = async (storeId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiCall(`/stores/${storeId}/layout`)
      setStoreLayout(data.data.layout)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch store layout')
      toast.error('Failed to load store layout')
    } finally {
      setLoading(false)
    }
  }

  const updateStoreTemplate = async (storeId: string, templateId: string) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/template`, {
        method: 'PATCH',
        body: JSON.stringify({ templateId })
      })
      
      setStoreLayout(data.data.layout)
      toast.success('Template updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update template')
      throw err
    }
  }

  const updateStoreColors = async (storeId: string, colors: any) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/colors`, {
        method: 'PATCH',
        body: JSON.stringify({ colors })
      })
      
      if (storeLayout) {
        setStoreLayout({
          ...storeLayout,
          customization: {
            ...storeLayout.customization,
            theme: {
              ...storeLayout.customization.theme,
              colors: data.data.colors
            }
          }
        })
      }
      
      toast.success('Colors updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update colors')
      throw err
    }
  }

  const updateStoreTypography = async (storeId: string, typography: any) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/typography`, {
        method: 'PATCH',
        body: JSON.stringify({ typography })
      })
      
      if (storeLayout) {
        setStoreLayout({
          ...storeLayout,
          customization: {
            ...storeLayout.customization,
            theme: {
              ...storeLayout.customization.theme,
              typography: data.data.typography
            }
          }
        })
      }
      
      toast.success('Typography updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update typography')
      throw err
    }
  }

  const updateSectionSettings = async (storeId: string, sectionName: string, settings: any) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/sections/${sectionName}`, {
        method: 'PATCH',
        body: JSON.stringify({ settings })
      })
      
      if (storeLayout) {
        const updatedSections = storeLayout.customization.sections.map(section =>
          section.sectionName === sectionName ? data.data.section : section
        )
        
        setStoreLayout({
          ...storeLayout,
          customization: {
            ...storeLayout.customization,
            sections: updatedSections
          }
        })
      }
      
      toast.success(`Section '${sectionName}' updated successfully`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update section')
      throw err
    }
  }

  const toggleSection = async (storeId: string, sectionName: string, enabled: boolean) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/sections/${sectionName}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled })
      })
      
      if (storeLayout) {
        const updatedSections = storeLayout.customization.sections.map(section =>
          section.sectionName === sectionName ? data.data.section : section
        )
        
        setStoreLayout({
          ...storeLayout,
          customization: {
            ...storeLayout.customization,
            sections: updatedSections
          }
        })
      }
      
      toast.success(`Section '${sectionName}' ${enabled ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to toggle section')
      throw err
    }
  }

  const reorderSections = async (storeId: string, sectionsOrder: string[]) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/sections/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ sectionsOrder })
      })
      
      if (storeLayout) {
        setStoreLayout({
          ...storeLayout,
          customization: {
            ...storeLayout.customization,
            sections: data.data.sections
          }
        })
      }
      
      toast.success('Sections reordered successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reorder sections')
      throw err
    }
  }

  const updateBackground = async (storeId: string, background: any) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/background`, {
        method: 'PATCH',
        body: JSON.stringify({ background })
      })
      
      if (storeLayout) {
        setStoreLayout({
          ...storeLayout,
          customization: {
            ...storeLayout.customization,
            theme: {
              ...storeLayout.customization.theme,
              background: data.data.background
            }
          }
        })
      }
      
      toast.success('Background updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update background')
      throw err
    }
  }

  const previewStoreLayout = async (storeId: string, customization: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/store-layout/${storeId}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customization }),
      })

      if (!response.ok) {
        throw new Error('Failed to preview layout')
      }

      const data = await response.json()
      return data.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to preview layout'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const revertStoreLayout = async (storeId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/store-layout/${storeId}/revert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to revert layout')
      }

      const data = await response.json()
      setStoreLayout(data.data)

      toast.success('Layout has been reverted to default settings')

      return data.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revert layout'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }
  }

  const resetStoreLayout = async (storeId: string) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/reset`, {
        method: 'POST'
      })
      
      setStoreLayout(data.data.layout)
      toast.success('Layout reset to default successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset layout')
      throw err
    }
  }

  const previewLayoutChanges = async (storeId: string, changes: any) => {
    try {
      const data = await apiCall(`/stores/${storeId}/layout/preview`, {
        method: 'POST',
        body: JSON.stringify({ changes })
      })
      
      return data.data.preview
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate preview')
      throw err
    }
  }

  // Load popular templates on mount
  useEffect(() => {
    getPopularTemplates()
  }, [])

  return {
    // Templates management
    templates,
    loading,
    error,
    
    // Template operations
    getTemplates,
    getTemplatesByCategory,
    getPopularTemplates,
    searchTemplates,
    
    // Store layout management
    storeLayout,
    getStoreLayout,
    updateStoreTemplate,
    updateStoreColors,
    updateStoreTypography,
    updateSectionSettings,
    toggleSection,
    reorderSections,
    updateBackground,
    resetStoreLayout,
    previewLayoutChanges,
    
    // UI state
    selectedTemplate,
    setSelectedTemplate,
    previewMode,
    setPreviewMode
  }
}