// Placeholder image service for development
export const getPlaceholderImage = (width: number = 400, height: number = 400, text?: string): string => {
  const encodedText = encodeURIComponent(text || `${width}x${height}`)
  return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodedText}`
}

export const getProductPlaceholder = (productName?: string): string => {
  return getPlaceholderImage(400, 400, productName || 'Product Image')
}

// Image URL validator
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

// Image preloader for better UX
export const preloadImage = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
