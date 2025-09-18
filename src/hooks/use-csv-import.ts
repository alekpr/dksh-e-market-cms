import { useState, useCallback } from 'react'
import { productApi } from '@/lib/api'
import { toast } from 'sonner'

export interface CSVValidationResult {
  summary: {
    totalRows: number
    validProducts: number
    errorCount: number
    successRate: string
  }
  errors: Array<{
    line: number
    field: string
    message: string
    value: any
  }>
  errorsByField: Record<string, any[]>
  errorsByLine: Record<string, any[]>
}

export interface CSVImportResult {
  summary: {
    totalProcessed: number
    imported: number
    failed: number
    skipped: number
  }
  results: {
    imported: Array<{
      name: string
      id: string
      slug: string
    }>
    failed: Array<{
      name: string
      error: string
    }>
    skipped: Array<{
      productName: string
      reason: string
    }>
  }
}

export interface UseCSVImportResult {
  // State
  isDownloading: boolean
  isValidating: boolean
  isImporting: boolean
  validationResult: CSVValidationResult | null
  importResult: CSVImportResult | null
  
  // Actions
  downloadTemplate: () => Promise<void>
  validateCSV: (file: File) => Promise<CSVValidationResult | null>
  importCSV: (file: File) => Promise<CSVImportResult | null>
  clearValidation: () => void
  clearImportResult: () => void
}

export function useCSVImport(): UseCSVImportResult {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [validationResult, setValidationResult] = useState<CSVValidationResult | null>(null)
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null)

  const downloadTemplate = useCallback(async () => {
    setIsDownloading(true)
    try {
      const blob = await productApi.downloadCSVTemplate()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'product-import-template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Template downloaded successfully')
    } catch (error: any) {
      console.error('Failed to download template:', error)
      toast.error(error.message || 'Failed to download template')
    } finally {
      setIsDownloading(false)
    }
  }, [])

  const validateCSV = useCallback(async (file: File): Promise<CSVValidationResult | null> => {
    setIsValidating(true)
    setValidationResult(null)
    
    try {
      const response = await productApi.validateCSV(file)
      
      if (response.success && response.data?.validation) {
        setValidationResult(response.data.validation)
        
        const { summary } = response.data.validation
        if (summary.errorCount === 0) {
          toast.success(`Validation passed! ${summary.validProducts} products are ready to import.`)
        } else {
          toast.warning(`Validation completed with ${summary.errorCount} errors. Please review and fix them.`)
        }
        
        return response.data.validation
      } else {
        throw new Error(response.message || 'Validation failed')
      }
    } catch (error: any) {
      console.error('CSV validation failed:', error)
      toast.error(error.message || 'Failed to validate CSV file')
      return null
    } finally {
      setIsValidating(false)
    }
  }, [])

  const importCSV = useCallback(async (file: File): Promise<CSVImportResult | null> => {
    setIsImporting(true)
    setImportResult(null)
    
    try {
      const response = await productApi.importCSV(file)
      
      if (response.success && response.data) {
        setImportResult(response.data)
        
        const { summary } = response.data
        if (summary.failed === 0) {
          toast.success(`Import successful! ${summary.imported} products imported.`)
        } else {
          toast.warning(`Import completed with ${summary.failed} failures. ${summary.imported} products imported successfully.`)
        }
        
        return response.data
      } else {
        throw new Error(response.message || 'Import failed')
      }
    } catch (error: any) {
      console.error('CSV import failed:', error)
      toast.error(error.message || 'Failed to import CSV file')
      return null
    } finally {
      setIsImporting(false)
    }
  }, [])

  const clearValidation = useCallback(() => {
    setValidationResult(null)
  }, [])

  const clearImportResult = useCallback(() => {
    setImportResult(null)
  }, [])

  return {
    // State
    isDownloading,
    isValidating,
    isImporting,
    validationResult,
    importResult,
    
    // Actions
    downloadTemplate,
    validateCSV,
    importCSV,
    clearValidation,
    clearImportResult,
  }
}