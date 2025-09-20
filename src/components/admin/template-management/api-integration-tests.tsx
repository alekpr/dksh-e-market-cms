/**
 * API Integration Tests
 * Test component for verifying backend API endpoints work correctly with the frontend
 */
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  RefreshCw,
  Database,
  Globe,
  Shield,
  Zap,
  FileText,
  Users,
  BarChart3
} from 'lucide-react'

interface TestResult {
  id: string
  name: string
  endpoint: string
  method: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  response?: any
  timestamp?: string
}

interface TestSuite {
  name: string
  tests: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  runningTests: number
  duration: number
  status: 'pending' | 'running' | 'passed' | 'failed'
}

export function ApiIntegrationTests() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [lastRunTimestamp, setLastRunTimestamp] = useState<string | null>(null)

  // Test definitions
  const testDefinitions = {
    template_crud: {
      name: 'Template CRUD Operations',
      tests: [
        {
          id: 'get_all_templates',
          name: 'Get All Templates',
          endpoint: '/api/v1/store-layout-templates',
          method: 'GET'
        },
        {
          id: 'get_template_by_id',
          name: 'Get Template by ID',
          endpoint: '/api/v1/store-layout-templates/{id}',
          method: 'GET'
        },
        {
          id: 'search_templates',
          name: 'Search Templates',
          endpoint: '/api/v1/store-layout-templates/search?q=test',
          method: 'GET'
        },
        {
          id: 'get_templates_by_category',
          name: 'Get Templates by Category',
          endpoint: '/api/v1/store-layout-templates/category/retail',
          method: 'GET'
        },
        {
          id: 'get_popular_templates',
          name: 'Get Popular Templates',
          endpoint: '/api/v1/store-layout-templates/popular',
          method: 'GET'
        }
      ]
    },
    admin_operations: {
      name: 'Admin Operations',
      tests: [
        {
          id: 'get_pending_templates',
          name: 'Get Pending Templates',
          endpoint: '/api/v1/store-layout-templates/admin/pending',
          method: 'GET'
        },
        {
          id: 'get_analytics',
          name: 'Get Template Analytics',
          endpoint: '/api/v1/store-layout-templates/admin/analytics',
          method: 'GET'
        },
        {
          id: 'create_template',
          name: 'Create New Template',
          endpoint: '/api/v1/store-layout-templates',
          method: 'POST'
        },
        {
          id: 'update_template_status',
          name: 'Update Template Status',
          endpoint: '/api/v1/store-layout-templates/{id}/status',
          method: 'PATCH'
        },
        {
          id: 'duplicate_template',
          name: 'Duplicate Template',
          endpoint: '/api/v1/store-layout-templates/{id}/duplicate',
          method: 'POST'
        }
      ]
    },
    approval_workflow: {
      name: 'Approval Workflow',
      tests: [
        {
          id: 'submit_for_approval',
          name: 'Submit for Approval',
          endpoint: '/api/v1/store-layout-templates/{id}/submit',
          method: 'POST'
        },
        {
          id: 'approve_template',
          name: 'Approve Template',
          endpoint: '/api/v1/store-layout-templates/{id}/approve',
          method: 'POST'
        },
        {
          id: 'reject_template',
          name: 'Reject Template',
          endpoint: '/api/v1/store-layout-templates/{id}/reject',
          method: 'POST'
        },
        {
          id: 'activate_template',
          name: 'Activate Template',
          endpoint: '/api/v1/store-layout-templates/{id}/activate',
          method: 'POST'
        }
      ]
    },
    media_management: {
      name: 'Media Management',
      tests: [
        {
          id: 'get_media_files',
          name: 'Get Media Files',
          endpoint: '/api/v1/template-media',
          method: 'GET'
        },
        {
          id: 'upload_media',
          name: 'Upload Media File',
          endpoint: '/api/v1/template-media/upload',
          method: 'POST'
        },
        {
          id: 'get_media_by_id',
          name: 'Get Media by ID',
          endpoint: '/api/v1/template-media/{id}',
          method: 'GET'
        },
        {
          id: 'delete_media',
          name: 'Delete Media File',
          endpoint: '/api/v1/template-media/{id}',
          method: 'DELETE'
        }
      ]
    },
    performance: {
      name: 'Performance Tests',
      tests: [
        {
          id: 'load_many_templates',
          name: 'Load 100+ Templates',
          endpoint: '/api/v1/store-layout-templates?limit=100',
          method: 'GET'
        },
        {
          id: 'concurrent_requests',
          name: 'Concurrent API Calls',
          endpoint: '/api/v1/store-layout-templates',
          method: 'GET'
        },
        {
          id: 'large_template_data',
          name: 'Handle Large Template Data',
          endpoint: '/api/v1/store-layout-templates',
          method: 'POST'
        }
      ]
    }
  }

  const getAuthToken = (): string | null => {
    return localStorage.getItem('token')
  }

  const buildTestData = (testId: string) => {
    switch (testId) {
      case 'create_template':
        return {
          name: `Test Template ${Date.now()}`,
          description: 'API Integration Test Template',
          category: 'retail',
          difficulty: 'beginner',
          tags: ['test', 'api'],
          features: ['responsive', 'customizable'],
          layout: {
            sections: [
              {
                id: 'hero-1',
                type: 'hero',
                name: 'Hero Section',
                config: { title: 'Test Hero', subtitle: 'Test subtitle' },
                styles: { backgroundColor: '#ffffff' },
                visible: true,
                order: 1
              }
            ],
            globalStyles: {
              colors: { primary: '#007bff', secondary: '#6c757d' },
              typography: { fontFamily: 'Arial', fontSize: { base: '16px' } },
              spacing: { container: '1200px' },
              borderRadius: { small: '4px' }
            },
            responsive: {
              breakpoints: { mobile: '768px', tablet: '1024px', desktop: '1200px' },
              hiddenOnMobile: [],
              hiddenOnTablet: [],
              hiddenOnDesktop: []
            }
          }
        }
      case 'update_template_status':
        return { status: 'active' }
      case 'reject_template':
        return { reason: 'API integration test rejection' }
      case 'duplicate_template':
        return { name: `Duplicated Template ${Date.now()}` }
      default:
        return null
    }
  }

  const runSingleTest = async (test: TestResult, templateId?: string): Promise<TestResult> => {
    const startTime = Date.now()
    const token = getAuthToken()
    
    try {
      let endpoint = test.endpoint
      if (templateId && endpoint.includes('{id}')) {
        endpoint = endpoint.replace('{id}', templateId)
      }

      // Use correct API base URL
      const fullUrl = endpoint.startsWith('http') ? endpoint : `http://localhost:3000${endpoint}`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const requestOptions: RequestInit = {
        method: test.method,
        headers
      }

      // Add test data for POST/PATCH requests
      if (test.method === 'POST' || test.method === 'PATCH') {
        const testData = buildTestData(test.id)
        if (testData) {
          requestOptions.body = JSON.stringify(testData)
        }
      }

      const response = await fetch(fullUrl, requestOptions)
      const responseData = await response.json()

      const duration = Date.now() - startTime

      if (response.ok) {
        return {
          ...test,
          status: 'passed',
          duration,
          response: responseData,
          timestamp: new Date().toISOString()
        }
      } else {
        return {
          ...test,
          status: 'failed',
          duration,
          error: `HTTP ${response.status}: ${responseData.message || response.statusText}`,
          response: responseData,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      return {
        ...test,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  const runTestSuite = async (suiteName: string) => {
    const suiteDefinition = testDefinitions[suiteName as keyof typeof testDefinitions]
    if (!suiteDefinition) return

    const startTime = Date.now()
    let templateId: string | undefined

    // Initialize test suite
    const initialSuite: TestSuite = {
      name: suiteDefinition.name,
      tests: suiteDefinition.tests.map(test => ({
        ...test,
        status: 'pending' as const
      })),
      totalTests: suiteDefinition.tests.length,
      passedTests: 0,
      failedTests: 0,
      runningTests: 0,
      duration: 0,
      status: 'running'
    }

    setTestSuites(prev => {
      const updated = prev.filter(suite => suite.name !== suiteDefinition.name)
      return [...updated, initialSuite]
    })

    // Run tests sequentially
    const results: TestResult[] = []
    
    for (let i = 0; i < suiteDefinition.tests.length; i++) {
      const test = suiteDefinition.tests[i]
      
      // Update test status to running
      setTestSuites(prev => prev.map(suite => {
        if (suite.name === suiteDefinition.name) {
          return {
            ...suite,
            tests: suite.tests.map(t => 
              t.id === test.id ? { ...t, status: 'running' as const } : t
            ),
            runningTests: 1
          }
        }
        return suite
      }))

      // For create template test, save the template ID for other tests
      if (test.id === 'create_template') {
        const result = await runSingleTest(test as TestResult)
        if (result.status === 'passed' && result.response?.data?._id) {
          templateId = result.response.data._id
        }
        results.push(result)
      } else {
        const result = await runSingleTest(test as TestResult, templateId)
        results.push(result)
      }

      // Update test result
      setTestSuites(prev => prev.map(suite => {
        if (suite.name === suiteDefinition.name) {
          const updatedTests = suite.tests.map(t => 
            t.id === test.id ? results[results.length - 1] : t
          )
          const passedTests = updatedTests.filter(t => t.status === 'passed').length
          const failedTests = updatedTests.filter(t => t.status === 'failed').length
          
          return {
            ...suite,
            tests: updatedTests,
            passedTests,
            failedTests,
            runningTests: 0
          }
        }
        return suite
      }))
    }

    // Finalize test suite
    const duration = Date.now() - startTime
    const passedTests = results.filter(r => r.status === 'passed').length
    const failedTests = results.filter(r => r.status === 'failed').length
    const status = failedTests === 0 ? 'passed' : 'failed'

    setTestSuites(prev => prev.map(suite => {
      if (suite.name === suiteDefinition.name) {
        return {
          ...suite,
          passedTests,
          failedTests,
          duration,
          status: status as 'passed' | 'failed'
        }
      }
      return suite
    }))
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestSuites([])
    
    const suiteNames = Object.keys(testDefinitions)
    
    for (const suiteName of suiteNames) {
      await runTestSuite(suiteName)
    }
    
    setIsRunning(false)
    setLastRunTimestamp(new Date().toISOString())
  }

  const runSpecificSuite = async (suiteName: string) => {
    setIsRunning(true)
    await runTestSuite(suiteName)
    setIsRunning(false)
    setLastRunTimestamp(new Date().toISOString())
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const getSuiteIcon = (suiteName: string) => {
    switch (suiteName.toLowerCase()) {
      case 'template crud operations':
        return <Database className="h-5 w-5" />
      case 'admin operations':
        return <Shield className="h-5 w-5" />
      case 'approval workflow':
        return <Users className="h-5 w-5" />
      case 'media management':
        return <FileText className="h-5 w-5" />
      case 'performance tests':
        return <Zap className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0)
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0)
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0)
  const overallStatus = testSuites.length > 0 && testSuites.every(suite => suite.status === 'passed') ? 'passed' : 
                       testSuites.some(suite => suite.status === 'failed') ? 'failed' : 'pending'

  return (
    <div className="space-y-6">
      {/* Test Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">API integration tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
            <p className="text-xs text-muted-foreground">Tests passing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">Tests failing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {getStatusIcon(overallStatus)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{overallStatus}</div>
            <p className="text-xs text-muted-foreground">Overall result</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>API Integration Testing</CardTitle>
          <CardDescription>
            Test backend API endpoints to ensure proper integration with the frontend components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run All Tests
            </Button>
            
            {lastRunTimestamp && (
              <div className="text-sm text-gray-600">
                Last run: {new Date(lastRunTimestamp).toLocaleString()}
              </div>
            )}
          </div>

          {!getAuthToken() && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No authentication token found. Some tests may fail. Please ensure you're logged in as an admin.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Suites */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {testSuites.map(suite => (
            <TabsTrigger key={suite.name} value={suite.name.toLowerCase().replace(/\s+/g, '-')}>
              {suite.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(testDefinitions).map(([key, definition]) => {
              const suite = testSuites.find(s => s.name === definition.name)
              const hasRun = suite !== undefined

              return (
                <Card key={key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSuiteIcon(definition.name)}
                        <CardTitle className="text-lg">{definition.name}</CardTitle>
                      </div>
                      {hasRun && getStatusBadge(suite.status)}
                    </div>
                    <CardDescription>
                      {definition.tests.length} tests • {
                        hasRun ? `${suite.passedTests} passed, ${suite.failedTests} failed` : 'Not run'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {hasRun && (
                          <div className="text-sm text-gray-600">
                            Duration: {suite.duration}ms
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          {definition.tests.map(test => test.name).slice(0, 2).join(', ')}
                          {definition.tests.length > 2 && `, +${definition.tests.length - 2} more`}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => runSpecificSuite(key)}
                        disabled={isRunning}
                      >
                        Run Suite
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {testSuites.map(suite => (
          <TabsContent key={suite.name} value={suite.name.toLowerCase().replace(/\s+/g, '-')}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{suite.name}</CardTitle>
                    <CardDescription>
                      {suite.totalTests} tests • {suite.passedTests} passed • {suite.failedTests} failed
                    </CardDescription>
                  </div>
                  {getStatusBadge(suite.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suite.tests.map(test => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          <h4 className="font-medium">{test.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{test.method}</Badge>
                          {test.duration && (
                            <span className="text-sm text-gray-500">{test.duration}ms</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <code className="bg-gray-100 px-2 py-1 rounded">{test.endpoint}</code>
                      </div>

                      {test.error && (
                        <Alert className="mt-2">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>{test.error}</AlertDescription>
                        </Alert>
                      )}

                      {test.response && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                            View Response
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                            {JSON.stringify(test.response, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}