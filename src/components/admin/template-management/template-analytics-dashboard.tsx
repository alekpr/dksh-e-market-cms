/**
 * Template Analytics Dashboard
 * Comprehensive analytics for template performance and insights
 */
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Star,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react'

interface TemplateAnalytics {
  templateId: string
  templateName: string
  category: string
  metrics: {
    views: number
    viewsChange: number
    selections: number
    selectionsChange: number
    conversionRate: number
    conversionRateChange: number
    averageRating: number
    ratingChange: number
    qualityScore: number
    trendingScore: number
  }
  timeline: {
    daily: Array<{
      date: string
      views: number
      selections: number
    }>
    weekly: Array<{
      week: string
      views: number
      selections: number
    }>
    monthly: Array<{
      month: string
      views: number
      selections: number
    }>
  }
  demographics: {
    categories: Array<{
      name: string
      value: number
      percentage: number
    }>
    difficulties: Array<{
      name: string
      value: number
      percentage: number
    }>
    ratings: Array<{
      rating: number
      count: number
      percentage: number
    }>
  }
  insights: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    engagementLevel: 'low' | 'medium' | 'high'
  }
}

interface OverallAnalytics {
  summary: {
    totalTemplates: number
    totalViews: number
    totalSelections: number
    averageConversionRate: number
    averageRating: number
    topPerformingCategory: string
  }
  trends: {
    viewsTrend: number
    selectionsTrend: number
    conversionTrend: number
    ratingTrend: number
  }
  topPerformers: Array<{
    templateId: string
    templateName: string
    metric: string
    value: number
    change: number
  }>
  categoryBreakdown: Array<{
    category: string
    templates: number
    views: number
    selections: number
    rating: number
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function TemplateAnalyticsDashboard() {
  const [overallAnalytics, setOverallAnalytics] = useState<OverallAnalytics | null>(null)
  const [templateAnalytics, setTemplateAnalytics] = useState<TemplateAnalytics[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load overall analytics
      const overallResponse = await fetch(`/api/v1/store-layout-templates/admin/analytics/overview?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!overallResponse.ok) {
        throw new Error('Failed to load analytics data')
      }

      const overallData = await overallResponse.json()
      setOverallAnalytics(overallData.data.analytics)

      // Load individual template analytics
      const templatesResponse = await fetch(`/api/v1/store-layout-templates/admin/analytics/templates?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setTemplateAnalytics(templatesData.data.templates)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`
  }

  const getSelectedTemplateData = () => {
    if (selectedTemplate === 'all') return null
    return templateAnalytics.find(t => t.templateId === selectedTemplate)
  }

  const getTrendIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-red-600 font-medium">Error loading analytics</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <Button 
            onClick={loadAnalyticsData} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const selectedTemplateData = getSelectedTemplateData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Analytics</h1>
          <p className="text-gray-600 mt-1">Performance insights and metrics for store layout templates</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      {overallAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overallAnalytics.summary.totalViews)}</div>
              <div className={`text-xs flex items-center ${getTrendColor(overallAnalytics.trends.viewsTrend)}`}>
                {React.createElement(getTrendIcon(overallAnalytics.trends.viewsTrend), { className: "h-3 w-3 mr-1" })}
                {formatPercentage(overallAnalytics.trends.viewsTrend)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Selections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overallAnalytics.summary.totalSelections)}</div>
              <div className={`text-xs flex items-center ${getTrendColor(overallAnalytics.trends.selectionsTrend)}`}>
                {React.createElement(getTrendIcon(overallAnalytics.trends.selectionsTrend), { className: "h-3 w-3 mr-1" })}
                {formatPercentage(overallAnalytics.trends.selectionsTrend)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAnalytics.summary.averageConversionRate.toFixed(1)}%</div>
              <div className={`text-xs flex items-center ${getTrendColor(overallAnalytics.trends.conversionTrend)}`}>
                {React.createElement(getTrendIcon(overallAnalytics.trends.conversionTrend), { className: "h-3 w-3 mr-1" })}
                {formatPercentage(overallAnalytics.trends.conversionTrend)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallAnalytics.summary.averageRating.toFixed(1)}</div>
              <div className={`text-xs flex items-center ${getTrendColor(overallAnalytics.trends.ratingTrend)}`}>
                {React.createElement(getTrendIcon(overallAnalytics.trends.ratingTrend), { className: "h-3 w-3 mr-1" })}
                {formatPercentage(overallAnalytics.trends.ratingTrend)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Template Performance</CardTitle>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates Overview</SelectItem>
                {templateAnalytics.map(template => (
                  <SelectItem key={template.templateId} value={template.templateId}>
                    {template.templateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {selectedTemplate === 'all' ? (
            // Overall Overview
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {overallAnalytics?.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{performer.templateName}</p>
                        <p className="text-sm text-gray-600">{performer.metric}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatNumber(performer.value)}</p>
                        <p className={`text-sm ${getTrendColor(performer.change)}`}>
                          {formatPercentage(performer.change)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Category Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={overallAnalytics?.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="views"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {overallAnalytics?.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : selectedTemplateData ? (
            // Individual Template Overview
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Key Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{selectedTemplateData.templateName}</CardTitle>
                  <CardDescription>Performance metrics overview</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(selectedTemplateData.metrics.views)}</p>
                    <p className="text-sm text-gray-600">Views</p>
                    <p className={`text-xs ${getTrendColor(selectedTemplateData.metrics.viewsChange)}`}>
                      {formatPercentage(selectedTemplateData.metrics.viewsChange)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{formatNumber(selectedTemplateData.metrics.selections)}</p>
                    <p className="text-sm text-gray-600">Selections</p>
                    <p className={`text-xs ${getTrendColor(selectedTemplateData.metrics.selectionsChange)}`}>
                      {formatPercentage(selectedTemplateData.metrics.selectionsChange)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{selectedTemplateData.metrics.conversionRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Conversion</p>
                    <p className={`text-xs ${getTrendColor(selectedTemplateData.metrics.conversionRateChange)}`}>
                      {formatPercentage(selectedTemplateData.metrics.conversionRateChange)}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-600">{selectedTemplateData.metrics.averageRating.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className={`text-xs ${getTrendColor(selectedTemplateData.metrics.ratingChange)}`}>
                      {formatPercentage(selectedTemplateData.metrics.ratingChange)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quality & Trending Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quality Score</span>
                      <span>{selectedTemplateData.metrics.qualityScore}%</span>
                    </div>
                    <Progress value={selectedTemplateData.metrics.qualityScore} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Trending Score</span>
                      <span>{selectedTemplateData.metrics.trendingScore}</span>
                    </div>
                    <Progress value={Math.min(selectedTemplateData.metrics.trendingScore, 100)} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <Badge 
                      variant="outline"
                      className={
                        selectedTemplateData.insights.engagementLevel === 'high' ? 'bg-green-50 text-green-700' :
                        selectedTemplateData.insights.engagementLevel === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-red-50 text-red-700'
                      }
                    >
                      {selectedTemplateData.insights.engagementLevel.toUpperCase()} Engagement
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {selectedTemplateData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Views & Selections Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Views & Selections Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={selectedTemplateData.timeline.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="selections" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Rate Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedTemplateData.timeline.daily.map(item => ({
                      ...item,
                      conversionRate: item.views > 0 ? (item.selections / item.views) * 100 : 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Conversion Rate']} />
                      <Line type="monotone" dataKey="conversionRate" stroke="#ff7300" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          {selectedTemplateData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={selectedTemplateData.demographics.categories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, percentage}) => `${name} ${percentage}%`}
                      >
                        {selectedTemplateData.demographics.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Difficulty Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={selectedTemplateData.demographics.difficulties}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedTemplateData.demographics.ratings.map((rating) => (
                      <div key={rating.rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm">{rating.rating}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <Progress value={rating.percentage} className="h-2" />
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {rating.count} ({rating.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {selectedTemplateData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedTemplateData.insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                    {selectedTemplateData.insights.strengths.length === 0 && (
                      <p className="text-gray-500 text-sm">No notable strengths identified</p>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedTemplateData.insights.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                    {selectedTemplateData.insights.weaknesses.length === 0 && (
                      <p className="text-gray-500 text-sm">No areas for improvement identified</p>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedTemplateData.insights.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                    {selectedTemplateData.insights.recommendations.length === 0 && (
                      <p className="text-gray-500 text-sm">No specific recommendations available</p>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}