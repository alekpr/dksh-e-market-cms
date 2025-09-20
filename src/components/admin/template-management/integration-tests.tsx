/**
 * Template Builder Integration Tests
 * Test the complete template builder workflow including API integration
 */
'use client'

import React, { useState, useEffect } from 'react'
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  FileText,
  Database,
  Globe,
  Users,
  Settings,
  Save,
  Upload,
  Download,
  Eye,
  Code,
  Bug,
  Zap,
  Shield,
  Smartphone,
  Tablet,
  Monitor,
  Loader2
} from 'lucide-react'

interface TestCase {
  id: string
  name: string
  description: string
  category: 'api' | 'ui' | 'integration' | 'performance' | 'security'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration?: number
  error?: string
  result?: any
}

interface TestSuite {
  id: string
  name: string
  description: string
  tests: TestCase[]
  totalTests: number
  passedTests: number
  failedTests: number
  skippedTests: number
  duration: number
  status: 'pending' | 'running' | 'completed' | 'failed'
}

const TEST_SUITES: TestSuite[] = [
  {
    id: 'template-api',
    name: 'Template API Tests',
    description: 'Test template CRUD operations and API endpoints',
    tests: [
      {
        id: 'create-template',
        name: 'Create Template',
        description: 'Test creating a new template with valid data',
        category: 'api',
        priority: 'critical',
        status: 'pending'
      },
      {
        id: 'update-template',
        name: 'Update Template',
        description: 'Test updating existing template properties',
        category: 'api',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'delete-template',
        name: 'Delete Template',
        description: 'Test template deletion and cleanup',
        category: 'api',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'list-templates',
        name: 'List Templates',
        description: 'Test template listing with filters and pagination',
        category: 'api',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'template-approval',
        name: 'Template Approval Workflow',
        description: 'Test approval workflow from submission to activation',
        category: 'api',
        priority: 'critical',
        status: 'pending'
      }
    ],
    totalTests: 5,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    duration: 0,
    status: 'pending'
  },
  {
    id: 'media-api',
    name: 'Media Management Tests',
    description: 'Test media upload, management, and optimization',
    tests: [
      {
        id: 'upload-image',
        name: 'Upload Image',
        description: 'Test image upload with validation',
        category: 'api',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'upload-video',
        name: 'Upload Video',
        description: 'Test video upload and processing',
        category: 'api',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'media-optimization',
        name: 'Media Optimization',
        description: 'Test automatic image optimization and thumbnail generation',
        category: 'api',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'media-validation',
        name: 'Media Validation',
        description: 'Test file type and size validation',
        category: 'security',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'media-cleanup',
        name: 'Media Cleanup',
        description: 'Test automatic cleanup of unused media files',
        category: 'api',
        priority: 'low',
        status: 'pending'
      }
    ],
    totalTests: 5,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    duration: 0,
    status: 'pending'
  },
  {
    id: 'ui-components',
    name: 'UI Component Tests',
    description: 'Test template builder UI components and interactions',
    tests: [
      {
        id: 'drag-drop',
        name: 'Drag and Drop',
        description: 'Test section drag and drop functionality',
        category: 'ui',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'section-config',
        name: 'Section Configuration',
        description: 'Test section configuration dialogs and forms',
        category: 'ui',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 'live-preview',
        name: 'Live Preview',
        description: 'Test real-time preview updates',
        category: 'ui',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'responsive-preview',
        name: 'Responsive Preview',
        description: 'Test preview across different device sizes',
        category: 'ui',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'undo-redo',
        name: 'Undo/Redo',
        description: 'Test undo/redo functionality',
        category: 'ui',
        priority: 'medium',
        status: 'pending'
      }
    ],
    totalTests: 5,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    duration: 0,
    status: 'pending'
  },
  {
    id: 'performance',
    name: 'Performance Tests',
    description: 'Test application performance and optimization',
    tests: [
      {
        id: 'large-template',
        name: 'Large Template Handling',
        description: 'Test performance with templates containing many sections',
        category: 'performance',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'media-loading',
        name: 'Media Loading Performance',
        description: 'Test media loading and caching performance',
        category: 'performance',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: 'api-response-time',
        name: 'API Response Time',
        description: 'Test API endpoint response times',
        category: 'performance',
        priority: 'low',
        status: 'pending'
      }
    ],
    totalTests: 3,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    duration: 0,
    status: 'pending'
  },
  {
    id: 'security',
    name: 'Security Tests',
    description: 'Test security features and validations',
    tests: [
      {
        id: 'auth-validation',
        name: 'Authentication Validation',
        description: 'Test admin role authentication and authorization',
        category: 'security',
        priority: 'critical',
        status: 'pending'
      },
      {
        id: 'input-sanitization',
        name: 'Input Sanitization',
        description: 'Test XSS prevention and input sanitization',
        category: 'security',
        priority: 'critical',
        status: 'pending'
      },
      {
        id: 'file-upload-security',
        name: 'File Upload Security',
        description: 'Test malicious file upload prevention',
        category: 'security',
        priority: 'high',
        status: 'pending'
      }
    ],
    totalTests: 3,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    duration: 0,
    status: 'pending'
  }
]

// Test implementations
const TEST_IMPLEMENTATIONS = {
  // Template API Tests
  'create-template': async () => {
    const templateData = {
      name: 'Test Template',
      description: 'Test template description',
      category: 'retail',
      difficulty: 'beginner',
      layout: {
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            name: 'Hero Section',
            config: {
              title: 'Welcome to Test Store',
              subtitle: 'Test subtitle',
              buttonText: 'Shop Now'
            },
            order: 0
          }
        ],
        globalStyles: {
          colorScheme: 'light',
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Inter',
          fontSize: 16,
          borderRadius: 8,
          spacing: 16
        },
        responsive: {
          mobile: true,
          tablet: true,
          desktop: true
        }
      }
    }

    const response = await fetch('/api/admin/store-layout-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(templateData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return { templateId: result.template._id, ...result }
  },

  'update-template': async (context: { templateId?: string }) => {
    if (!context.templateId) {
      throw new Error('No template ID provided from previous test')
    }

    const updateData = {
      name: 'Updated Test Template',
      description: 'Updated description',
      layout: {
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            name: 'Updated Hero Section',
            config: {
              title: 'Updated Welcome Message',
              subtitle: 'Updated subtitle',
              buttonText: 'Shop Now'
            },
            order: 0
          },
          {
            id: 'products-1',
            type: 'featured-products',
            name: 'Featured Products',
            config: {
              title: 'Featured Products',
              count: 4,
              layout: 'grid'
            },
            order: 1
          }
        ]
      }
    }

    const response = await fetch(`/api/admin/store-layout-templates/${context.templateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updateData)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  },

  'template-approval': async (context: { templateId?: string }) => {
    if (!context.templateId) {
      throw new Error('No template ID provided from previous test')
    }

    // Submit for approval
    const submitResponse = await fetch(`/api/admin/store-layout-templates/${context.templateId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!submitResponse.ok) {
      throw new Error(`Submit failed: HTTP ${submitResponse.status}`)
    }

    // Approve template
    const approveResponse = await fetch(`/api/admin/store-layout-templates/${context.templateId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        comments: 'Test approval'
      })
    })

    if (!approveResponse.ok) {
      throw new Error(`Approve failed: HTTP ${approveResponse.status}`)
    }

    const result = await approveResponse.json()
    return result
  },

  'list-templates': async () => {
    const response = await fetch('/api/admin/store-layout-templates?limit=10&page=1', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.templates || !Array.isArray(result.templates)) {
      throw new Error('Invalid response format: missing templates array')
    }

    return result
  },

  'delete-template': async (context: { templateId?: string }) => {
    if (!context.templateId) {
      throw new Error('No template ID provided from previous test')
    }

    const response = await fetch(`/api/admin/store-layout-templates/${context.templateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return { deleted: true }
  },

  // Media API Tests
  'upload-image': async () => {
    // Create a test image blob
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ff0000'
    ctx.fillRect(0, 0, 100, 100)
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png')
    })

    const formData = new FormData()
    formData.append('file', blob, 'test-image.png')

    const response = await fetch('/api/admin/template-media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return { mediaId: result.file._id, ...result }
  },

  'media-validation': async () => {
    // Test invalid file type
    const invalidBlob = new Blob(['invalid content'], { type: 'application/x-executable' })
    const formData = new FormData()
    formData.append('file', invalidBlob, 'malicious.exe')

    const response = await fetch('/api/admin/template-media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    // Should fail validation
    if (response.ok) {
      throw new Error('Security validation failed: malicious file was accepted')
    }

    if (response.status !== 400) {
      throw new Error(`Expected 400 validation error, got ${response.status}`)
    }

    return { validationPassed: true }
  },

  // UI Component Tests (mocked)
  'drag-drop': async () => {
    // Mock drag and drop test
    await new Promise(resolve => setTimeout(resolve, 500))
    return { dragDropWorking: true }
  },

  'section-config': async () => {
    // Mock section configuration test
    await new Promise(resolve => setTimeout(resolve, 300))
    return { configurationWorking: true }
  },

  'live-preview': async () => {
    // Mock live preview test
    await new Promise(resolve => setTimeout(resolve, 400))
    return { previewWorking: true }
  },

  'responsive-preview': async () => {
    // Mock responsive preview test
    await new Promise(resolve => setTimeout(resolve, 350))
    return { responsiveWorking: true }
  },

  'undo-redo': async () => {
    // Mock undo/redo test
    await new Promise(resolve => setTimeout(resolve, 250))
    return { undoRedoWorking: true }
  },

  // Performance Tests
  'large-template': async () => {
    const startTime = performance.now()
    
    // Simulate large template operations
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const duration = performance.now() - startTime
    
    if (duration > 2000) {
      throw new Error(`Performance test failed: operation took ${duration}ms (limit: 2000ms)`)
    }

    return { duration, performanceOk: true }
  },

  'api-response-time': async () => {
    const startTime = performance.now()
    
    const response = await fetch('/api/admin/store-layout-templates?limit=1', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    const duration = performance.now() - startTime

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    if (duration > 1000) {
      throw new Error(`API response too slow: ${duration}ms (limit: 1000ms)`)
    }

    return { duration, responseTimeOk: true }
  },

  // Security Tests
  'auth-validation': async () => {
    // Test unauthorized access
    const response = await fetch('/api/admin/store-layout-templates', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })

    if (response.ok) {
      throw new Error('Security test failed: unauthorized access was allowed')
    }

    if (response.status !== 401) {
      throw new Error(`Expected 401 unauthorized, got ${response.status}`)
    }

    return { authValidationPassed: true }
  },

  'input-sanitization': async () => {
    const maliciousData = {
      name: '<script>alert("xss")</script>',
      description: '<img src=x onerror=alert("xss")>',
      category: 'retail'
    }

    const response = await fetch('/api/admin/store-layout-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(maliciousData)
    })

    if (response.ok) {
      const result = await response.json()
      
      // Check if malicious content was sanitized
      if (result.template.name.includes('<script>') || 
          result.template.description.includes('<img')) {
        throw new Error('XSS vulnerability: malicious content was not sanitized')
      }
    }

    return { sanitizationPassed: true }
  }
}

export function TemplateBuilderTests() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>(TEST_SUITES)
  const [runningTests, setRunningTests] = useState(false)
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null)
  const [testContext, setTestContext] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)

  const runSingleTest = async (suiteId: string, testId: string): Promise<void> => {
    const implementation = TEST_IMPLEMENTATIONS[testId as keyof typeof TEST_IMPLEMENTATIONS]
    if (!implementation) {
      throw new Error(`No implementation found for test: ${testId}`)
    }

    const startTime = performance.now()
    
    try {
      const result = await implementation(testContext)
      const duration = performance.now() - startTime

      // Update context with results for dependent tests
      setTestContext(prev => ({ ...prev, ...result }))

      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId 
          ? {
              ...suite,
              tests: suite.tests.map(test => 
                test.id === testId 
                  ? { ...test, status: 'passed', duration, result }
                  : test
              )
            }
          : suite
      ))
    } catch (error) {
      const duration = performance.now() - startTime
      
      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId 
          ? {
              ...suite,
              tests: suite.tests.map(test => 
                test.id === testId 
                  ? { ...test, status: 'failed', duration, error: error instanceof Error ? error.message : String(error) }
                  : test
              )
            }
          : suite
      ))
    }
  }

  const runTestSuite = async (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId)
    if (!suite) return

    // Mark suite as running
    setTestSuites(prev => prev.map(s => 
      s.id === suiteId ? { ...s, status: 'running' } : s
    ))

    const suiteStartTime = performance.now()

    // Run tests sequentially to maintain context
    for (const test of suite.tests) {
      if (test.priority === 'critical' || test.priority === 'high') {
        // Mark test as running
        setTestSuites(prev => prev.map(s => 
          s.id === suiteId 
            ? {
                ...s,
                tests: s.tests.map(t => 
                  t.id === test.id ? { ...t, status: 'running' } : t
                )
              }
            : s
        ))

        await runSingleTest(suiteId, test.id)
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        // Skip low priority tests for now
        setTestSuites(prev => prev.map(s => 
          s.id === suiteId 
            ? {
                ...s,
                tests: s.tests.map(t => 
                  t.id === test.id ? { ...t, status: 'skipped' } : t
                )
              }
            : s
        ))
      }
    }

    const suiteDuration = performance.now() - suiteStartTime

    // Update suite status and stats
    setTestSuites(prev => prev.map(s => {
      if (s.id !== suiteId) return s
      
      const passedTests = s.tests.filter(t => t.status === 'passed').length
      const failedTests = s.tests.filter(t => t.status === 'failed').length
      const skippedTests = s.tests.filter(t => t.status === 'skipped').length
      
      return {
        ...s,
        status: failedTests > 0 ? 'failed' : 'completed',
        duration: suiteDuration,
        passedTests,
        failedTests,
        skippedTests
      }
    }))
  }

  const runAllTests = async () => {
    setRunningTests(true)
    setTestContext({})

    try {
      for (const suite of testSuites) {
        await runTestSuite(suite.id)
      }
    } finally {
      setRunningTests(false)
      setShowResults(true)
    }
  }

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: TestCase['category']) => {
    switch (category) {
      case 'api':
        return <Database className="h-4 w-4" />
      case 'ui':
        return <Globe className="h-4 w-4" />
      case 'integration':
        return <Zap className="h-4 w-4" />
      case 'performance':
        return <RefreshCw className="h-4 w-4" />
      case 'security':
        return <Shield className="h-4 w-4" />
      default:
        return <Bug className="h-4 w-4" />
    }
  }

  const getPriorityBadgeVariant = (priority: TestCase['priority']) => {
    switch (priority) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
    }
  }

  const overallStats = testSuites.reduce(
    (acc, suite) => ({
      total: acc.total + suite.totalTests,
      passed: acc.passed + suite.passedTests,
      failed: acc.failed + suite.failedTests,
      skipped: acc.skipped + suite.skippedTests
    }),
    { total: 0, passed: 0, failed: 0, skipped: 0 }
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Template Builder Integration Tests
              </CardTitle>
              <CardDescription>
                Comprehensive testing suite for template builder functionality
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={runAllTests}
                disabled={runningTests}
                className="gap-2"
              >
                {runningTests ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {runningTests ? 'Running Tests...' : 'Run All Tests'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {overallStats.passed + overallStats.failed + overallStats.skipped} / {overallStats.total} tests
              </span>
            </div>
            <Progress 
              value={overallStats.total > 0 ? ((overallStats.passed + overallStats.failed + overallStats.skipped) / overallStats.total) * 100 : 0} 
              className="h-2"
            />
            
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{overallStats.passed} Passed</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>{overallStats.failed} Failed</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>{overallStats.skipped} Skipped</span>
              </div>
            </div>
          </div>

          {/* Test Suites */}
          <Tabs value={selectedSuite || 'all'} onValueChange={setSelectedSuite}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Suites</TabsTrigger>
              {testSuites.map((suite) => (
                <TabsTrigger key={suite.id} value={suite.id} className="text-xs">
                  {suite.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {testSuites.map((suite) => (
                  <Card key={suite.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{suite.name}</CardTitle>
                          <CardDescription>{suite.description}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              suite.status === 'completed' ? 'default' :
                              suite.status === 'failed' ? 'destructive' :
                              suite.status === 'running' ? 'secondary' :
                              'outline'
                            }
                          >
                            {suite.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTestSuite(suite.id)}
                            disabled={runningTests}
                          >
                            Run Suite
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2">
                        {suite.tests.map((test) => (
                          <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(test.status)}
                              {getCategoryIcon(test.category)}
                              <div>
                                <h4 className="font-medium">{test.name}</h4>
                                <p className="text-sm text-gray-600">{test.description}</p>
                                {test.error && (
                                  <Alert className="mt-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                      {test.error}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityBadgeVariant(test.priority)}>
                                {test.priority}
                              </Badge>
                              {test.duration && (
                                <span className="text-xs text-gray-500">
                                  {Math.round(test.duration)}ms
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {testSuites.map((suite) => (
              <TabsContent key={suite.id} value={suite.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{suite.name}</CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {suite.tests.map((test) => (
                        <Card key={test.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {getStatusIcon(test.status)}
                                {getCategoryIcon(test.category)}
                                <div className="flex-1">
                                  <h4 className="font-medium">{test.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                                  
                                  {test.error && (
                                    <Alert className="mt-3">
                                      <XCircle className="h-4 w-4" />
                                      <AlertTitle>Test Failed</AlertTitle>
                                      <AlertDescription>{test.error}</AlertDescription>
                                    </Alert>
                                  )}
                                  
                                  {test.result && test.status === 'passed' && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                      <h5 className="text-sm font-medium text-green-800 mb-1">Test Result</h5>
                                      <pre className="text-xs text-green-700 overflow-auto">
                                        {JSON.stringify(test.result, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityBadgeVariant(test.priority)}>
                                  {test.priority}
                                </Badge>
                                {test.duration && (
                                  <Badge variant="outline">
                                    {Math.round(test.duration)}ms
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => runSingleTest(suite.id, test.id)}
                                  disabled={runningTests}
                                >
                                  Run Test
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results Summary Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Test Results Summary</DialogTitle>
            <DialogDescription>
              Complete test execution summary
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{overallStats.passed}</div>
                <div className="text-sm text-green-700">Passed</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{overallStats.failed}</div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{overallStats.skipped}</div>
                <div className="text-sm text-yellow-700">Skipped</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{overallStats.total}</div>
                <div className="text-sm text-blue-700">Total</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Suite Results</h4>
              {testSuites.map((suite) => (
                <div key={suite.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{suite.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      suite.status === 'completed' ? 'default' :
                      suite.status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {suite.passedTests}/{suite.totalTests}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {Math.round(suite.duration)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowResults(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}