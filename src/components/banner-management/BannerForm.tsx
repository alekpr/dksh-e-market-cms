/**
 * Banner Form Component
 * Form for creating and editing banners
 */
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Upload, Search, ExternalLink, Package, Store, Tag, ImageIcon, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Banner, CreateBannerRequest, UpdateBannerRequest } from './use-banner-management'

// Form validation schema
const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  imageUrl: z.string().min(1, 'Please upload a banner image'),
  actionType: z.enum(['product_detail', 'store', 'category', 'external_link']),
  actionValue: z.string().min(1, 'Action value is required'),
  isActive: z.boolean(),
  priority: z.number().min(0, 'Priority cannot be negative'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine((data) => {
  // Validate external link URL
  if (data.actionType === 'external_link') {
    try {
      new URL(data.actionValue)
      return true
    } catch {
      return false
    }
  }
  return true
}, {
  message: 'Action value must be a valid URL for external links',
  path: ['actionValue']
}).refine((data) => {
  // Validate end date is after start date
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate']
})

type BannerFormData = z.infer<typeof bannerSchema>

// Search reference interfaces
interface SearchResult {
  id: string
  title: string
  type: string
  price?: number
  level?: number
}

interface BannerFormProps {
  banner?: Banner
  onSubmit: (data: CreateBannerRequest | UpdateBannerRequest) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function BannerForm({ banner, onSubmit, onCancel, loading = false }: BannerFormProps) {
  // Form state
  const form = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: banner?.title || '',
      description: banner?.description || '',
      imageUrl: banner?.imageUrl || '',
      actionType: banner?.actionType || 'product_detail',
      actionValue: banner?.actionValue || '',
      isActive: banner?.isActive !== undefined ? banner.isActive : true,
      priority: banner?.priority || 0,
      startDate: banner?.startDate ? new Date(banner.startDate) : undefined,
      endDate: banner?.endDate ? new Date(banner.endDate) : undefined,
    },
  })

  // Action value state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedReference, setSelectedReference] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Image upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // State to track if we've initialized the form for editing
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize selectedReference for existing banner
  useEffect(() => {
    if (banner && banner.actionValue) {
      if (banner.actionType !== 'external_link') {
        // Create a mock reference for existing banner
        const mockReference = {
          id: banner.actionValue,
          title: `Selected ${banner.actionType.replace('_', ' ')}`,
          type: banner.actionType,
        }
        setSelectedReference(mockReference)
      }
      // Set preview image if editing existing banner
      if (banner.imageUrl) {
        setPreviewImage(banner.imageUrl)
      }
      setIsInitialized(true)
    } else if (!banner) {
      setIsInitialized(true)
    }
  }, [banner])

  // Get current action type and handle changes
  const actionType = form.watch('actionType')
  
  // Reset search state when action type changes (but preserve values for edit mode)
  useEffect(() => {
    // Skip reset during initial load
    if (!isInitialized) return
    
    // Only reset if action type actually changed from the original banner type
    if (banner && banner.actionType === actionType) return
    
    // Reset state for action type change
    setSelectedReference(null)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
    form.setValue('actionValue', '') // Clear action value when type changes
  }, [actionType, form, banner, isInitialized])

  // API search function
  const searchReferences = useCallback(async (query: string, type: string) => {
    if (!query.trim()) return []
    
    setIsSearching(true)
    try {
      const token = localStorage.getItem('access_token')
      const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3000/api/v1'
      
      let endpoint = ''
      let results: SearchResult[] = []
      
      console.log(`🔍 Searching ${type} for: "${query}"`)
      
      if (type === 'product_detail') {
        // Search products - API returns { success: true, data: { data: [...], pagination: {...} } }
        endpoint = `/products/search?q=${encodeURIComponent(query)}&limit=10`
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('📦 Product search response:', data)
          const products = data.data?.data || data.data || []
          results = products.map((product: any) => ({
            id: product._id,
            title: product.name || product.title,
            type: 'product',
            price: product.price || product.basePrice,
          }))
        } else {
          console.error('❌ Product search failed:', response.status, response.statusText)
        }
      } else if (type === 'store') {
        // Search stores - API returns { success: true, count: number, data: [...] }
        endpoint = `/stores/search?query=${encodeURIComponent(query)}`
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('🏪 Store search response:', data)
          const stores = data.data || []
          results = stores.map((store: any) => ({
            id: store._id,
            title: store.name || store.title,
            type: store.category || 'store',
          }))
        } else {
          console.error('❌ Store search failed:', response.status, response.statusText)
        }
      } else if (type === 'category') {
        // Search categories - API returns { success: true, count: number, data: [...] }
        endpoint = `/categories/search?query=${encodeURIComponent(query)}`
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('🏷️ Category search response:', data)
          const categories = data.data || []
          results = categories.map((category: any) => ({
            id: category._id,
            title: category.name || category.title,
            type: 'category',
            level: category.level || 1,
          }))
        } else {
          console.error('❌ Category search failed:', response.status, response.statusText)
        }
      }
      
      console.log(`✅ Search completed. Found ${results.length} results for "${query}"`)
      setSearchResults(results)
    } catch (error) {
      console.error('💥 Search error:', error)
      // Fallback to mock data if API fails
      let fallbackResults: SearchResult[] = []
      
      if (type === 'product_detail') {
        fallbackResults = [
          { id: 'mock-1', title: 'Sample Product 1', type: 'product', price: 1000 },
          { id: 'mock-2', title: 'Sample Product 2', type: 'product', price: 2000 },
        ].filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
      } else if (type === 'store') {
        fallbackResults = [
          { id: 'mock-1', title: 'Sample Store 1', type: 'electronics' },
          { id: 'mock-2', title: 'Sample Store 2', type: 'clothing' },
        ].filter(s => s.title.toLowerCase().includes(query.toLowerCase()))
      } else if (type === 'category') {
        fallbackResults = [
          { id: 'mock-1', title: 'Sample Category 1', type: 'category', level: 1 },
          { id: 'mock-2', title: 'Sample Category 2', type: 'category', level: 2 },
        ].filter(c => c.title.toLowerCase().includes(query.toLowerCase()))
      }
      
      console.log(`🔄 Using fallback data. Found ${fallbackResults.length} mock results`)
      setSearchResults(fallbackResults)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle search query change
  useEffect(() => {
    if (searchQuery && actionType !== 'external_link') {
      searchReferences(searchQuery, actionType)
    } else {
      setSearchResults([])
    }
  }, [searchQuery, actionType, searchReferences])

  // Handle reference selection
  const handleReferenceSelect = (reference: SearchResult) => {
    setSelectedReference(reference)
    form.setValue('actionValue', reference.id)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([]) // Clear search results
  }

  // Handle change button click
  const handleChangeReference = () => {
    setSelectedReference(null) // Clear current selection
    setShowSearch(true)
    setSearchQuery('')
    setSearchResults([])
  }

  // Image upload functions
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('uploadType', 'banner') // Set upload type for banner
    
    const token = localStorage.getItem('access_token')
    const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3000/api/v1'
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }
      
      const result = await response.json()
      // Backend returns URL in data.file.url format
      return result.data?.file?.url || result.url || result.data?.url
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)
      
      // Upload file
      const imageUrl = await uploadImage(file)
      
      // Update form
      form.setValue('imageUrl', imageUrl)
      setUploadProgress(100)
      
      toast.success('Image uploaded successfully!')
      
      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)
      
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
      setPreviewImage(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const clearImage = () => {
    setPreviewImage(null)
    form.setValue('imageUrl', '')
  }

  // Handle form submission
  const handleFormSubmit = async (data: BannerFormData) => {
    try {
      if (banner) {
        await onSubmit({
          ...data,
          startDate: data.startDate?.toISOString(),
          endDate: data.endDate?.toISOString(),
        } as UpdateBannerRequest)
      } else {
        await onSubmit({
          ...data,
          startDate: data.startDate?.toISOString(),
          endDate: data.endDate?.toISOString(),
        } as CreateBannerRequest)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {banner ? 'Edit Banner' : 'Create New Banner'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter banner title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Higher numbers show first (0 = lowest priority)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter banner description (optional)"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Image *</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Upload Area */}
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                            dragActive ? "border-primary bg-primary/5" : "border-gray-300",
                            "hover:border-primary hover:bg-primary/5"
                          )}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          {previewImage ? (
                            <div className="relative">
                              <img
                                src={previewImage}
                                alt="Banner preview"
                                className="max-h-64 mx-auto rounded-lg object-cover"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute top-2 right-2 bg-white shadow-md"
                                onClick={clearImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  Drop an image here, or{' '}
                                  <label className="text-primary hover:text-primary/90 cursor-pointer underline">
                                    browse files
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleFileSelect(file)
                                      }}
                                    />
                                  </label>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, WEBP up to 5MB. Recommended: 1200x400px
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {isUploading && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">Uploading... {uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="actionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action Type *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          // State will be reset by useEffect when actionType changes
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select action type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="product_detail">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Product Detail
                            </div>
                          </SelectItem>
                          <SelectItem value="store">
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4" />
                              Store Page
                            </div>
                          </SelectItem>
                          <SelectItem value="category">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Category Page
                            </div>
                          </SelectItem>
                          <SelectItem value="external_link">
                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              External Link
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actionValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action Value *</FormLabel>
                      <FormControl>
                        {actionType === 'external_link' ? (
                          <Input 
                            placeholder="https://example.com"
                            {...field}
                          />
                        ) : (
                          <div className="space-y-2">
                            {selectedReference ? (
                              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted">
                                <div>
                                  <div className="font-medium">{selectedReference.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ID: {selectedReference.id}
                                    {selectedReference.price && ` • ฿${selectedReference.price.toLocaleString()}`}
                                    {selectedReference.level && ` • Level ${selectedReference.level}`}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleChangeReference}
                                >
                                  Change
                                </Button>
                              </div>
                            ) : (
                              <Dialog open={showSearch} onOpenChange={setShowSearch}>
                                <DialogTrigger asChild>
                                  <Button type="button" variant="outline" className="w-full">
                                    <Search className="h-4 w-4 mr-2" />
                                    Select {actionType.replace('_', ' ')}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Select {actionType.replace('_', ' ')}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Input
                                      placeholder="Search..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    
                                    {isSearching ? (
                                      <div className="text-center py-4">Searching...</div>
                                    ) : searchResults.length > 0 ? (
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {searchResults.map((result) => (
                                          <div
                                            key={result.id}
                                            className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                                            onClick={() => handleReferenceSelect(result)}
                                          >
                                            <div className="font-medium">{result.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                              ID: {result.id}
                                              {result.price && ` • ฿${result.price.toLocaleString()}`}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : searchQuery ? (
                                      <div className="text-center py-4">No results found</div>
                                    ) : (
                                      <div className="text-center py-4">Start typing to search</div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status and Schedule */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Enable this banner to be displayed in the mobile app
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd MMMM yyyy', { locale: th })
                                ) : (
                                  <span>Select start date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd MMMM yyyy', { locale: th })
                                ) : (
                                  <span>Select end date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => {
                                const startDate = form.watch('startDate')
                                return startDate ? date <= startDate : false
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (banner ? 'Update Banner' : 'Create Banner')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}