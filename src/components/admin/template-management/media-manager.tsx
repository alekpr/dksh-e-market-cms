/**
 * Template Media Manager
 * Interface for managing template media assets, images, and file uploads
 */
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Trash2,
  Edit,
  Copy,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Grid,
  List,
  FolderOpen,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Maximize2,
  Share2,
  Tag,
  Calendar,
  FileImage,
  FileVideo,
  File,
  Folder
} from 'lucide-react'

interface MediaFile {
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
    duration?: number
    format?: string
    description?: string
    altText?: string
    tags: string[]
  }
  uploadedAt: Date
  uploadedBy: {
    _id: string
    name: string
  }
  usageCount: number
  templates: string[] // Template IDs using this media
}

interface MediaFolder {
  _id: string
  name: string
  description?: string
  parentId?: string
  createdAt: Date
  filesCount: number
}

interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

const SUPPORTED_FORMATS = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES_PER_UPLOAD = 10

export function TemplateMediaManager({ 
  templateId, 
  onMediaSelect, 
  selectionMode = false,
  selectedFiles = [],
  onSelectionChange 
}: {
  templateId?: string
  onMediaSelect?: (media: MediaFile[]) => void
  selectionMode?: boolean
  selectedFiles?: string[]
  onSelectionChange?: (fileIds: string[]) => void
}) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'usage'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(selectedFiles)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null)
  const [deletingFile, setDeletingFile] = useState<MediaFile | null>(null)
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null)
  const [showCreateFolder, setShowCreateFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Load media files and folders
  const loadMedia = useCallback(async () => {
    try {
      setLoading(true)
      
      // Get token with fallback approach
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('authToken')
      
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      // For now, just set empty data to prevent API errors
      // TODO: Implement actual media API endpoints on backend
      setFolders([])
      setMediaFiles([])
      
    } catch (error) {
      console.error('Failed to load media:', error)
    } finally {
      setLoading(false)
    }
  }, []) // Remove dependencies to prevent infinite loop

  useEffect(() => {
    loadMedia()
  }, []) // Remove loadMedia dependency to prevent infinite loop)

  useEffect(() => {
    setSelectedFileIds(selectedFiles)
  }, [selectedFiles])

  // File selection handling
  const handleFileSelect = (fileId: string, isSelected: boolean) => {
    let newSelection: string[]
    
    if (selectionMode) {
      if (isSelected) {
        newSelection = [...selectedFileIds, fileId]
      } else {
        newSelection = selectedFileIds.filter(id => id !== fileId)
      }
      setSelectedFileIds(newSelection)
      onSelectionChange?.(newSelection)
    } else {
      // Single selection for preview
      const file = mediaFiles.find(f => f._id === fileId)
      if (file) {
        onMediaSelect?.([file])
      }
    }
  }

  // Drag and drop handling
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!dragRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFileUpload(files)
  }, [])

  // File upload handling
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    console.log('File upload requested:', files.map(f => f.name))
    // TODO: Implement actual file upload when backend endpoints are ready
    alert('File upload functionality will be implemented when backend API is ready')
  }

  // File operations
  const handleDeleteFile = async (file: MediaFile) => {
    console.log('Delete file requested:', file.originalName)
    // TODO: Implement actual file deletion when backend endpoints are ready
    setDeletingFile(null)
  }

  const handleUpdateFile = async (file: MediaFile, updates: Partial<MediaFile['metadata']>) => {
    console.log('Update file requested:', file.originalName, updates)
    // TODO: Implement actual file update when backend endpoints are ready
    setEditingFile(null)
  }

  // Folder operations
  const createFolder = async () => {
    if (!newFolderName.trim()) return

    console.log('Create folder requested:', newFolderName)
    // TODO: Implement actual folder creation when backend endpoints are ready
    setNewFolderName('')
    setShowCreateFolder(false)
  }

  // Utility functions
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return FileImage
    if (mimetype.startsWith('video/')) return FileVideo
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.metadata.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'image' && file.mimetype.startsWith('image/')) ||
                       (filterType === 'video' && file.mimetype.startsWith('video/')) ||
                       (filterType === 'document' && !file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/'))
    
    return matchesSearch && matchesType
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'name':
        aValue = a.originalName.toLowerCase()
        bValue = b.originalName.toLowerCase()
        break
      case 'date':
        aValue = new Date(a.uploadedAt).getTime()
        bValue = new Date(b.uploadedAt).getTime()
        break
      case 'size':
        aValue = a.size
        bValue = b.size
        break
      case 'usage':
        aValue = a.usageCount
        bValue = b.usageCount
        break
      default:
        return 0
    }
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    return sortOrder === 'asc' ? comparison : -comparison
  })

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Media Library</h2>
            <p className="text-gray-600">Manage template assets and media files</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateFolder(true)}
            >
              <Folder className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Files</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>

          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none rounded-l-lg"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none rounded-r-lg"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && uploadProgress.length > 0 && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="space-y-2">
            {uploadProgress.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.filename}</span>
                    <span className="text-sm text-gray-500">
                      {item.status === 'complete' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {item.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      {item.status === 'uploading' && `${item.progress}%`}
                    </span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  {item.error && (
                    <p className="text-xs text-red-600 mt-1">{item.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Drag and Drop Area */}
        <div
          ref={dragRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`h-full relative ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10">
              <div className="text-center">
                <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-blue-700">Drop files here to upload</p>
                <p className="text-blue-600">Maximum {MAX_FILES_PER_UPLOAD} files, {formatFileSize(MAX_FILE_SIZE)} each</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="h-full overflow-auto p-6">
              {/* Folders */}
              {folders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Folders</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {folders
                      .filter(folder => folder.parentId === currentFolder)
                      .map((folder) => (
                        <div
                          key={folder._id}
                          className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setCurrentFolder(folder._id)}
                        >
                          <FolderOpen className="h-8 w-8 text-blue-500 mb-2" />
                          <span className="text-sm font-medium text-center">{folder.name}</span>
                          <span className="text-xs text-gray-500">{folder.filesCount} files</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {sortedFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <ImageIcon className="h-16 w-16 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No files found</h3>
                  <p className="text-center">
                    {searchQuery || filterType !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Upload your first file to get started'}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">
                      Files ({sortedFiles.length})
                    </h3>
                    {selectionMode && selectedFileIds.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {selectedFileIds.length} selected
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            const selectedFiles = mediaFiles.filter(file => 
                              selectedFileIds.includes(file._id)
                            )
                            onMediaSelect?.(selectedFiles)
                          }}
                        >
                          Use Selected
                        </Button>
                      </div>
                    )}
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {sortedFiles.map((file) => {
                        const isSelected = selectedFileIds.includes(file._id)
                        const FileIcon = getFileIcon(file.mimetype)
                        
                        return (
                          <div
                            key={file._id}
                            className={`relative group border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                              isSelected ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => handleFileSelect(file._id, !isSelected)}
                          >
                            {/* File Preview */}
                            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                              {file.mimetype.startsWith('image/') ? (
                                <img
                                  src={file.thumbnailUrl || file.url}
                                  alt={file.metadata.altText || file.originalName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileIcon className="h-12 w-12 text-gray-400" />
                              )}
                            </div>

                            {/* File Info */}
                            <div className="p-3">
                              <h4 className="text-sm font-medium truncate" title={file.originalName}>
                                {file.originalName}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(file.size)}
                              </p>
                              {file.usageCount > 0 && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  Used {file.usageCount}x
                                </Badge>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="secondary" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPreviewFile(file) }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingFile(file) }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank') }}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => { e.stopPropagation(); setDeletingFile(file) }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Selection Indicator */}
                            {selectionMode && (
                              <div className="absolute top-2 left-2">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'bg-white border-gray-300'
                                }`}>
                                  {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {sortedFiles.map((file) => {
                        const isSelected = selectedFileIds.includes(file._id)
                        const FileIcon = getFileIcon(file.mimetype)
                        
                        return (
                          <div
                            key={file._id}
                            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer ${
                              isSelected ? 'bg-blue-50 border border-blue-200' : ''
                            }`}
                            onClick={() => handleFileSelect(file._id, !isSelected)}
                          >
                            {selectionMode && (
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                              </div>
                            )}
                            
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              {file.mimetype.startsWith('image/') ? (
                                <img
                                  src={file.thumbnailUrl || file.url}
                                  alt={file.metadata.altText || file.originalName}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <FileIcon className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{file.originalName}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                <span>By {file.uploadedBy.name}</span>
                                {file.usageCount > 0 && (
                                  <Badge variant="secondary">Used {file.usageCount}x</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setPreviewFile(file) }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setEditingFile(file) }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); setDeletingFile(file) }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={Object.values(SUPPORTED_FORMATS).flat().join(',')}
        onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
        className="hidden"
      />

      {/* Dialogs */}
      
      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your media files
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Folder Name</Label>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button onClick={createFolder} disabled={!newFolderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit File Dialog */}
      {editingFile && (
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit File Details</DialogTitle>
              <DialogDescription>
                Update file metadata and properties
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Alternative Text</Label>
                <Input
                  value={editingFile.metadata.altText || ''}
                  onChange={(e) => setEditingFile({
                    ...editingFile,
                    metadata: { ...editingFile.metadata, altText: e.target.value }
                  })}
                  placeholder="Describe this image for accessibility"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingFile.metadata.description || ''}
                  onChange={(e) => setEditingFile({
                    ...editingFile,
                    metadata: { ...editingFile.metadata, description: e.target.value }
                  })}
                  placeholder="Add a description for this file"
                />
              </div>
              
              <div>
                <Label>Tags</Label>
                <Input
                  value={editingFile.metadata.tags.join(', ')}
                  onChange={(e) => setEditingFile({
                    ...editingFile,
                    metadata: { 
                      ...editingFile.metadata, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }
                  })}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFile(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateFile(editingFile, editingFile.metadata)}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFile} onOpenChange={() => setDeletingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingFile?.originalName}"?
              {deletingFile?.usageCount && deletingFile.usageCount > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  Warning: This file is currently used in {deletingFile.usageCount} template(s).
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFile && handleDeleteFile(deletingFile)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewFile.originalName}</DialogTitle>
              <DialogDescription>
                File preview and details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                {previewFile.mimetype.startsWith('image/') ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.metadata.altText || previewFile.originalName}
                    className="w-full h-auto rounded-lg"
                  />
                ) : previewFile.mimetype.startsWith('video/') ? (
                  <video
                    src={previewFile.url}
                    controls
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      {React.createElement(getFileIcon(previewFile.mimetype), { className: "h-16 w-16 text-gray-400 mx-auto mb-2" })}
                      <p className="text-gray-600">Preview not available</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Details */}
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">File Details</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{formatFileSize(previewFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{previewFile.mimetype}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded:</span>
                      <span>{new Date(previewFile.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">By:</span>
                      <span>{previewFile.uploadedBy.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage:</span>
                      <span>{previewFile.usageCount} templates</span>
                    </div>
                    {previewFile.metadata.width && previewFile.metadata.height && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions:</span>
                        <span>{previewFile.metadata.width} × {previewFile.metadata.height}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {previewFile.metadata.description && (
                  <div>
                    <Label className="font-medium">Description</Label>
                    <p className="mt-1 text-sm text-gray-600">{previewFile.metadata.description}</p>
                  </div>
                )}
                
                {previewFile.metadata.tags.length > 0 && (
                  <div>
                    <Label className="font-medium">Tags</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {previewFile.metadata.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => window.open(previewFile.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setEditingFile(previewFile)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}