import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, Link, Eye } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { uploadImageToServer } from '@/utils/imageUpload'
import { getPlaceholderImage } from '@/utils/imageUtils'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  onRemove: () => void
  label?: string
  maxSize?: number // in MB
  preview?: boolean
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  label = "Image",
  maxSize = 5,
  preview = true,
  className = ""
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mode, setMode] = useState<'upload' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file')
      return
    }

    setUploading(true)
    setUploadError(null)

    try {
      const result = await uploadImageToServer(file, 'product')
      
      if (result.success && result.url) {
        onChange(result.url)
        setUploadError(null)
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Handle URL input
  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUploadError(null)
    }
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        <div className="flex gap-1">
          <Button
            type="button"
            variant={mode === 'upload' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('upload')}
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload
          </Button>
          <Button
            type="button"
            variant={mode === 'url' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('url')}
          >
            <Link className="w-3 h-3 mr-1" />
            URL
          </Button>
        </div>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {mode === 'upload' && (
        <Card 
          className="border-dashed border-2 hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 min-h-[120px]">
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to {maxSize}MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {mode === 'url' && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            type="url"
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
          >
            Add
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview */}
      {value && preview && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={value}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(80, 80, 'Error')
                  }}
                />
                <div className="absolute -top-2 -right-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 rounded-full p-0"
                    onClick={onRemove}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{value}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(value, '_blank')}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Multiple Image Upload Component
interface MultiImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  maxSize?: number
  className?: string
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onChange,
  maxImages = 10,
  maxSize = 5,
  className = ""
}) => {
  // Add new image
  const handleAddImage = (url: string) => {
    if (images.length < maxImages) {
      onChange([...images, url])
    }
  }

  // Update existing image
  const handleUpdateImage = (index: number, url: string) => {
    const updatedImages = [...images]
    updatedImages[index] = url
    onChange(updatedImages)
  }

  // Remove image
  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-lg font-medium">Product Images</Label>
        <span className="text-sm text-muted-foreground">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Existing Images */}
      {images.map((image, index) => (
        <ImageUpload
          key={index}
          value={image}
          onChange={(url) => handleUpdateImage(index, url)}
          onRemove={() => handleRemoveImage(index)}
          label={`Image ${index + 1}`}
          maxSize={maxSize}
        />
      ))}

      {/* Add New Image */}
      {images.length < maxImages && (
        <Card className="border-dashed">
          <CardContent className="p-4">
            <ImageUpload
              value=""
              onChange={handleAddImage}
              onRemove={() => {}}
              label="Add New Image"
              maxSize={maxSize}
              preview={false}
            />
          </CardContent>
        </Card>
      )}

      {images.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No images added yet
            </p>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Add up to {maxImages} product images
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
