// This file is for demonstration purposes and should be implemented on your backend
// For a React/Vite application, image upload needs to be handled by your backend API

export const uploadImageToServer = async (file: File, type: string = 'product'): Promise<{ success: boolean; url?: string; message?: string }> => {
  try {
    // Check authentication token
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('Please log in to upload images. No authentication token found.')
    }

    // Create form data
    const formData = new FormData()
    formData.append('image', file)
    formData.append('uploadType', type)

    // Replace with your actual API endpoint
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/v1/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle authentication errors specifically
      if (response.status === 401) {
        // Clear invalid token
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        throw new Error('Your session has expired. Please log in again to upload images.')
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    // Backend returns: { status: 'success', data: { file: { url: '...', ... } } }
    if (result.status === 'success' && result.data?.file?.url) {
      return {
        success: true,
        url: result.data.file.url,
        message: 'Upload successful'
      }
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}
