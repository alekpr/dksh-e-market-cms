import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Calendar, User, Eye, Tag } from 'lucide-react'
import type { Content } from './types'

interface ContentDetailViewProps {
  content: Content
  onEdit: (content: Content) => void
  onBack: () => void
}

export const ContentDetailView: React.FC<ContentDetailViewProps> = ({
  content,
  onEdit,
  onBack
}) => {
  const getStatusVariant = (status: Content['status']) => {
    switch (status) {
      case 'published': return 'default'
      case 'draft': return 'secondary'
      case 'archived': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">View Content</h1>
          <p className="text-muted-foreground">
            Reading mode for your content
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => onEdit(content)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            Back to List
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{content.title}</CardTitle>
              <CardDescription>{content.excerpt}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={getStatusVariant(content.status)}>
                {content.status}
              </Badge>
              {content.featured && (
                <Badge variant="outline">Featured</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {content.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {content.publishDate}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {content.views.toLocaleString()} views
            </div>
            <Badge variant="outline">{content.category}</Badge>
          </div>

          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-foreground">
              {content.content}
            </div>
          </div>

          {content.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Tag className="h-4 w-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
