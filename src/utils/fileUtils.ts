/**
 * Utility functions for file operations
 */

/**
 * Get public file URL that doesn't require authentication
 */
export function getPublicFileUrl(fileIdOrPath: string): string {
  // Use VITE_API_BASE_URL if available (includes /api/v1), otherwise use VITE_API_URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://54.251.126.43:3000'
  
  // Check if fileIdOrPath is already a full path (starts with /api/v1/files/)
  if (fileIdOrPath.startsWith('/api/v1/files/')) {
    // It's already a full API path, just prepend the base URL
    if (apiBaseUrl) {
      // Remove /api/v1 from the start since apiBaseUrl already includes it
      const pathWithoutApiV1 = fileIdOrPath.replace('/api/v1', '')
      return `${apiBaseUrl}${pathWithoutApiV1}`
    } else {
      return `${apiUrl}${fileIdOrPath}`
    }
  }
  
  // It's just a fileId, build the full path
  if (apiBaseUrl) {
    // VITE_API_BASE_URL already includes /api/v1
    return `${apiBaseUrl}/files/${fileIdOrPath}/serve`
  } else {
    // VITE_API_URL is base URL only
    return `${apiUrl}/api/v1/files/${fileIdOrPath}/serve`
  }
}

/**
 * Get authenticated file URL (requires login)
 */
export function getAuthenticatedFileUrl(fileId: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://54.251.126.43:3000'
  return `${apiUrl}/api/v1/files/${fileId}`
}

/**
 * Check if an image URL is accessible
 */
export async function checkImageAccessibility(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error('Error checking image accessibility:', error)
    return false
  }
}

/**
 * Create image element for preview
 */
export function createImagePreview(fileId: string, options: {
  width?: number
  height?: number
  className?: string
  alt?: string
} = {}): string {
  const url = getPublicFileUrl(fileId)
  const { width, height, className = '', alt = 'Preview' } = options
  
  let style = ''
  if (width) style += `width: ${width}px; `
  if (height) style += `height: ${height}px; `
  
  return `<img src="${url}" alt="${alt}" class="${className}" style="${style}" />`
}

/**
 * Download file without authentication
 */
export async function downloadPublicFile(fileId: string, filename?: string): Promise<void> {
  try {
    const url = getPublicFileUrl(fileId)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || `file-${fileId}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}
