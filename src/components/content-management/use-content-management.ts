import { useState, useMemo } from 'react'
import type { Content, ContentFormData, ViewMode } from './types'
import { initialContent } from './mock-data'

// Simple toast replacement - you can implement proper toast later
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message)
}

export const useContentManagement = () => {
  const [contents, setContents] = useState<Content[]>(initialContent)
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    excerpt: '',
    content: '',
    status: 'draft',
    category: '',
    tags: '',
    featured: false
  })

  // Filter and search logic
  const filteredContents = useMemo(() => {
    return contents.filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || content.status === filterStatus
      const matchesCategory = filterCategory === 'all' || content.category === filterCategory
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [contents, searchTerm, filterStatus, filterCategory])

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(contents.map(content => content.category)))
  }, [contents])

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      status: 'draft',
      category: '',
      tags: '',
      featured: false
    })
  }

  // Handle add content
  const handleAdd = () => {
    setCurrentView('add')
    resetForm()
    setSelectedContent(null)
  }

  // Handle edit content
  const handleEdit = (content: Content) => {
    setCurrentView('edit')
    setSelectedContent(content)
    setFormData({
      title: content.title,
      excerpt: content.excerpt,
      content: content.content,
      status: content.status,
      category: content.category,
      tags: content.tags.join(', '),
      featured: content.featured
    })
  }

  // Handle view content
  const handleView = (content: Content) => {
    setCurrentView('view')
    setSelectedContent(content)
  }

  // Handle save (add/edit)
  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in required fields')
      return
    }

    const newContent: Content = {
      id: selectedContent?.id || Date.now().toString(),
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      status: formData.status,
      category: formData.category,
      author: selectedContent?.author || 'Current User',
      publishDate: selectedContent?.publishDate || new Date().toISOString().split('T')[0],
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      views: selectedContent?.views || 0,
      featured: formData.featured
    }

    if (currentView === 'edit' && selectedContent) {
      setContents(contents.map(content => 
        content.id === selectedContent.id ? newContent : content
      ))
      toast.success('Content updated successfully')
    } else {
      setContents([newContent, ...contents])
      toast.success('Content created successfully')
    }

    setCurrentView('list')
    resetForm()
    setSelectedContent(null)
  }

  // Handle delete content
  const handleDelete = (id: string) => {
    setContents(contents.filter(content => content.id !== id))
    toast.success('Content deleted successfully')
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterCategory('all')
  }

  // Handle cancel form
  const handleCancel = () => {
    setCurrentView('list')
    resetForm()
    setSelectedContent(null)
  }

  return {
    // State
    contents,
    currentView,
    selectedContent,
    searchTerm,
    filterStatus,
    filterCategory,
    formData,
    filteredContents,
    categories,
    
    // Setters
    setSearchTerm,
    setFilterStatus,
    setFilterCategory,
    setFormData,
    
    // Actions
    handleAdd,
    handleEdit,
    handleView,
    handleSave,
    handleDelete,
    handleClearFilters,
    handleCancel
  }
}
