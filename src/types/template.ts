/**
 * Shared Template Types for Admin Template Management System
 * Centralized type definitions for consistency across all components
 */

// Base Template interface
export interface Template {
  _id: string
  name: string
  description: string
  category: string
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'archived'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  features: string[]
  
  // Layout configuration
  layout: {
    sections: TemplateSection[]
    globalStyles: GlobalStyles
    responsive: ResponsiveSettings
  }
  
  // Preview assets
  preview: {
    thumbnail?: string
    screenshots: string[]
  }
  
  // Analytics data
  analytics: {
    views: number
    selections: number
    ratings: Array<{ rating: number }>
    usageCount: number
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: {
    _id: string
    name: string
  }
  approvedBy?: {
    _id: string
    name: string
  }
  approvedAt?: string
  qualityScore?: number
}

// Template Section interface for the builder
export interface TemplateSection {
  id: string
  type: 'hero' | 'products' | 'banner' | 'gallery' | 'text' | 'features' | 'testimonials' | 'cta' | 'contact' | 'footer' | 'custom'
  name: string
  config: Record<string, any>
  styles: Record<string, any>
  content?: Record<string, any>
  visible: boolean
  order: number
}

// Global styles configuration
export interface GlobalStyles {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      base: string
      h1: string
      h2: string
      h3: string
    }
  }
  spacing: {
    container: string
    section: string
    element: string
  }
  borderRadius: {
    small: string
    medium: string
    large: string
  }
}

// Responsive settings
export interface ResponsiveSettings {
  breakpoints: {
    mobile: string
    tablet: string
    desktop: string
  }
  hiddenOnMobile: string[]
  hiddenOnTablet: string[]
  hiddenOnDesktop: string[]
}

// Template statistics for analytics
export interface TemplateStats {
  totalTemplates: number
  activeTemplates: number
  pendingApproval: number
  draftTemplates: number
  archivedTemplates: number
  totalUsage: number
  averageQualityScore: number
  topCategories: Array<{
    category: string
    count: number
  }>
}

// Template filter options
export interface TemplateFilters {
  status?: Template['status'][]
  category?: string[]
  difficulty?: Template['difficulty'][]
  tags?: string[]
  createdBy?: string[]
  qualityScore?: {
    min: number
    max: number
  }
  dateRange?: {
    start: string
    end: string
  }
}

// Template sort options
export interface TemplateSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'qualityScore' | 'usageCount'
  direction: 'asc' | 'desc'
}

// API response types
export interface TemplateListResponse {
  templates: Template[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TemplateStatsResponse {
  stats: TemplateStats
  trends: Array<{
    date: string
    created: number
    approved: number
    usage: number
  }>
}

// Media file interface
export interface MediaFile {
  _id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  thumbnailUrl?: string
  metadata: {
    width?: number
    height?: number
    format?: string
  }
  uploadedBy: {
    _id: string
    name: string
  }
  uploadedAt: string
  tags: string[]
  usageCount: number
}

// Test result interface
export interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'pending' | 'skipped'
  duration?: number
  error?: string
  details?: Record<string, any>
}

// Test suite interface
export interface TestSuite {
  name: string
  tests: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  duration: number
  status: 'passed' | 'failed' | 'running'
}

// Approval workflow interfaces
export interface ApprovalComment {
  _id: string
  text: string
  author: {
    _id: string
    name: string
  }
  createdAt: string
  type: 'comment' | 'suggestion' | 'issue'
}

export interface ApprovalRequest {
  _id: string
  templateId: string
  template: Template
  submittedBy: {
    _id: string
    name: string
  }
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: {
    _id: string
    name: string
  }
  reviewedAt?: string
  comments: ApprovalComment[]
  qualityIssues: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestion?: string
  }>
}

// Export all types for named imports