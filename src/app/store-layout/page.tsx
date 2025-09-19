import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreLayoutTemplateGallery } from '@/components/store-layout/store-layout-template-gallery';
import { StoreLayoutManager } from '@/components/store-layout/store-layout-manager';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Palette, Layout, Settings, Store } from 'lucide-react';
import type { StoreLayoutTemplate } from '@/hooks/use-store-layout-templates';
import { useStoreLayoutTemplates } from '@/hooks/use-store-layout-templates';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

/**
 * Store Layout Management Page
 * Allows merchants to customize their mobile app layout using templates
 */
export default function StoreLayoutPage() {
  const { user } = useAuth();
  const { 
    updateStoreTemplate, 
    getStoreLayout, 
    selectedTemplate,
    setSelectedTemplate 
  } = useStoreLayoutTemplates();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');

  // Get store ID from user data for merchants
  React.useEffect(() => {
    if (user?.role === 'merchant' && user?.merchantInfo?.storeId) {
      setSelectedStoreId(user.merchantInfo.storeId);
    }
  }, [user]);

  // Load current store layout when storeId is available
  React.useEffect(() => {
    if (selectedStoreId && getStoreLayout) {
      getStoreLayout(selectedStoreId);
    }
  }, [selectedStoreId]); // Remove getStoreLayout from dependency array to prevent infinite loop

  // Debug log for selectedTemplate changes
  React.useEffect(() => {
    console.log('🏪 StoreLayoutPage - selectedTemplate changed:', {
      selectedTemplate,
      selectedTemplateId: selectedTemplate?._id,
      isNull: selectedTemplate === null,
      isUndefined: selectedTemplate === undefined
    });
  }, [selectedTemplate]);

  // Handle template selection and save
  const handleSelectTemplate = async (template: StoreLayoutTemplate) => {
    setSelectedTemplate(template);
    
    // If we have a store ID, save the template selection immediately
    if (selectedStoreId && template._id) {
      try {
        await updateStoreTemplate(selectedStoreId, template._id);
      } catch (error) {
        console.error('Failed to save template selection:', error);
      }
    }
  };

  const isAdmin = user?.role === 'admin';
  const isMerchant = user?.role === 'merchant';

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  Store Layout
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Store Layout Management</h1>
              <p className="text-muted-foreground mt-2">
                Customize your mobile app appearance with layout templates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                {isAdmin ? 'Admin View' : 'Merchant View'}
              </Badge>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Layout Templates</CardTitle>
                <Layout className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Available</div>
                <p className="text-xs text-muted-foreground">
                  Choose from pre-designed layouts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customization</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Colors & Fonts</div>
                <p className="text-xs text-muted-foreground">
                  Match your brand identity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Preview</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Live Preview</div>
                <p className="text-xs text-muted-foreground">
                  See changes in real-time
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Layout Management Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout Customization
              </CardTitle>
              <CardDescription>
                {isMerchant 
                  ? 'Customize your store\'s mobile app layout and appearance'
                  : 'Manage store layout templates and customizations'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="templates" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Layout Templates
                  </TabsTrigger>
                  <TabsTrigger value="customize" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Customize Layout
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Choose a Layout Template</h3>
                        <p className="text-sm text-muted-foreground">
                          Select a pre-designed template that best fits your store type and preferences.
                          You can customize colors and typography after selecting a template.
                        </p>
                      </div>
                      {selectedStoreId && (
                        <Badge variant="outline" className="flex items-center gap-2">
                          <Store className="h-3 w-3" />
                          Store Connected
                        </Badge>
                      )}
                    </div>
                    
                    {!selectedStoreId && isMerchant && (
                      <Card className="mb-4">
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-3 text-amber-600">
                            <Settings className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Store Not Found</p>
                              <p className="text-sm text-muted-foreground">
                                Unable to find your store information. Please contact support to link your account.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <StoreLayoutTemplateGallery 
                      onSelectTemplate={handleSelectTemplate}
                      selectedTemplateId={selectedTemplate?._id}
                      showCategoryTabs={true}
                      showFilters={true}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="customize" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Customize Your Layout</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Personalize your chosen template with custom colors, typography, and layout settings.
                    </p>
                    {selectedStoreId ? (
                      <StoreLayoutManager storeId={selectedStoreId} />
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center py-8">
                            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Store Selected</h3>
                            <p className="text-sm text-muted-foreground">
                              {isAdmin 
                                ? 'Please select a store to manage its layout customization.'
                                : 'Unable to detect your store. Please contact support.'
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Layout Management Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Getting Started</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Browse available layout templates</li>
                    <li>• Preview templates before applying</li>
                    <li>• Select the template that fits your business</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Customization</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Adjust colors to match your brand</li>
                    <li>• Choose typography that reflects your style</li>
                    <li>• Preview changes in real-time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}