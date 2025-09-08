// This file is for demonstration purposes and should be implemented on your backend
// For a React/Vite application, image upload needs to be handled by your backend API

export const uploadImageToServer = async (file: File, type: string = 'product'): Promise<{ success: boolean; url?: string; message?: string }> => {
  try {
    // Create form data
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)

    // Replace with your actual API endpoint
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}
