/**
 * Simple Template Approval Workflow
 * Basic approval interface (simplified to prevent React loops)
 */
'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'

export function TemplateApprovalWorkflow() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Template Approval</h1>
        <p className="text-muted-foreground">
          Review and approve pending template submissions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Templates waiting for review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Templates approved today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Revision</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Templates requiring changes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Approval Queue
          </CardTitle>
          <CardDescription>
            Templates pending your review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Modern eCommerce Template</h4>
                <p className="text-sm text-muted-foreground">Submitted 2 hours ago</p>
                <Badge variant="outline" className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Reject
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Food & Beverage Layout</h4>
                <p className="text-sm text-muted-foreground">Submitted 4 hours ago</p>
                <Badge variant="outline" className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Status</CardTitle>
          <CardDescription>
            Full approval workflow functionality is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The complete approval system will include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Template quality assessment</li>
              <li>Approval workflow management</li>
              <li>Comment and feedback system</li>
              <li>Notification system</li>
              <li>Audit trail and history</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}