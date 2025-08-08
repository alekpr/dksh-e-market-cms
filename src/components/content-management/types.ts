export interface Content {
  id: string
  title: string
  excerpt: string
  content: string
  status: 'published' | 'draft' | 'archived'
  category: string
  author: string
  publishDate: string
  tags: string[]
  views: number
  featured: boolean
}

export interface ContentFormData {
  title: string
  excerpt: string
  content: string
  status: Content['status']
  category: string
  tags: string
  featured: boolean
}

export type ViewMode = 'list' | 'add' | 'edit' | 'view'
