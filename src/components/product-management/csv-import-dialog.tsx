import React, { useCallback, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  FileSpreadsheet,
  Loader2
} from 'lucide-react'
import { useCSVImport } from '@/hooks/use-csv-import'
import { toast } from 'sonner'

interface CSVImportDialogProps {
  trigger?: React.ReactNode
  onImportComplete?: () => void
}

export const CSVImportDialog: React.FC<CSVImportDialogProps> = ({ 
  trigger, 
  onImportComplete 
}) => {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  
  const {
    isDownloading,
    isValidating,
    isImporting,
    validationResult,
    importResult,
    downloadTemplate,
    validateCSV,
    importCSV,
    clearValidation,
    clearImportResult,
  } = useCSVImport()

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv') {
        toast.error('Please select a CSV file')
        return
      }
      setSelectedFile(file)
      clearValidation()
      clearImportResult()
    }
  }, [clearValidation, clearImportResult])

  const handleValidate = useCallback(async () => {
    if (!selectedFile) return
    await validateCSV(selectedFile)
  }, [selectedFile, validateCSV])

  const handleImport = useCallback(async () => {
    if (!selectedFile) return
    
    const result = await importCSV(selectedFile)
    if (result) {
      setShowConfirmDialog(false)
      setSelectedFile(null)
      onImportComplete?.()
      
      // Close dialog after successful import
      setTimeout(() => {
        setOpen(false)
      }, 2000)
    }
  }, [selectedFile, importCSV, onImportComplete])

  const handleDialogClose = () => {
    setOpen(false)
    setSelectedFile(null)
    clearValidation()
    clearImportResult()
  }

  const canImport = validationResult && validationResult.summary.errorCount === 0

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
          )}
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Product CSV Import
            </DialogTitle>
            <DialogDescription>
              Import products in bulk using a CSV file. Download the template to see the required format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Download Template */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Download Template
                </CardTitle>
                <CardDescription>
                  Download the CSV template with the required format and sample data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={downloadTemplate}
                  disabled={isDownloading}
                  variant="outline"
                >
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download Template
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: Upload File */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Select your filled CSV file to upload and validate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isValidating || isImporting}
                  />
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Validate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Validate Data
                </CardTitle>
                <CardDescription>
                  Check your CSV file for errors before importing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleValidate}
                  disabled={!selectedFile || isValidating || isImporting}
                  className="w-full"
                >
                  {isValidating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Validate CSV
                </Button>

                {/* Validation Results */}
                {validationResult && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{validationResult.summary.totalRows}</div>
                        <div className="text-sm text-muted-foreground">Total Rows</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{validationResult.summary.validProducts}</div>
                        <div className="text-sm text-muted-foreground">Valid Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{validationResult.summary.errorCount}</div>
                        <div className="text-sm text-muted-foreground">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{validationResult.summary.successRate}</div>
                        <div className="text-sm text-muted-foreground">Success Rate</div>
                      </div>
                    </div>

                    {validationResult.summary.errorCount > 0 && (
                      <div className="max-h-40 overflow-y-auto border rounded p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Validation Errors
                        </h4>
                        <div className="space-y-2">
                          {validationResult.errors.slice(0, 10).map((error, index) => (
                            <div key={index} className="text-sm">
                              <Badge variant="destructive" className="text-xs mr-2">
                                Line {error.line}
                              </Badge>
                              <span className="font-medium">{error.field}:</span> {error.message}
                            </div>
                          ))}
                          {validationResult.errors.length > 10 && (
                            <div className="text-sm text-muted-foreground">
                              ... and {validationResult.errors.length - 10} more errors
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 4: Import */}
            {canImport && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                    Import Products
                  </CardTitle>
                  <CardDescription>
                    Your CSV passed validation. Ready to import {validationResult.summary.validProducts} products.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isImporting}
                    className="w-full"
                    size="lg"
                  >
                    {isImporting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Import {validationResult.summary.validProducts} Products
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Import Results */}
            {importResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Import Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{importResult.summary.totalProcessed}</div>
                      <div className="text-sm text-muted-foreground">Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{importResult.summary.imported}</div>
                      <div className="text-sm text-muted-foreground">Imported</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{importResult.summary.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{importResult.summary.skipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                  </div>

                  {importResult.results.failed.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded p-4">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Failed Imports
                      </h4>
                      <div className="space-y-2">
                        {importResult.results.failed.map((failed, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{failed.name}:</span> {failed.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleDialogClose}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to import {validationResult?.summary.validProducts} products? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport} disabled={isImporting}>
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Import Products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}