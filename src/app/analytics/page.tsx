'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb';

interface AnalyticsData {
  bestSellers?: Array<{ name: string; totalSold: number }>;
  revenueByPayment?: Array<{ _id: string; totalRevenue: number }>;
  totalRevenue?: number;
  totalOrders?: number;
  activeUsers?: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({});
  const [error, setError] = useState<string | null>(null);

  // Get user role from localStorage
  const getUserRole = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user)?.role : null;
    } catch {
      return null;
    }
  };

  const isMerchant = getUserRole() === 'merchant';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const baseUrl = isMerchant ? `${apiBaseUrl}/analytics/merchant` : `${apiBaseUrl}/analytics`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        console.log('Fetching analytics with URL:', baseUrl);
        console.log('Token exists:', !!token);

        // Fetch best sellers
        const bestSellersResponse = await fetch(`${baseUrl}/best-sellers`, { headers });
        const bestSellersData = await bestSellersResponse.json();
        
        // Fetch payment methods
        const paymentResponse = await fetch(`${baseUrl}/revenue-by-payment-method`, { headers });
        const paymentData = await paymentResponse.json();

        console.log('Best sellers:', bestSellersData);
        console.log('Payment data:', paymentData);

        // Extract best sellers - the data structure is different
        const bestSellers = bestSellersData.data?.bestSellers || [];
        const formattedBestSellers = bestSellers.map((item: any) => ({
          name: item.product?.name || 'Unknown Product',
          totalSold: item.salesMetrics?.totalQuantitySold || 0
        }));

        // Extract financial data
        const paymentMethods = paymentData.data?.paymentMethodAnalytics || [];
        const totalMetrics = paymentData.data?.totalMetrics || {};

        setData({
          bestSellers: formattedBestSellers,
          revenueByPayment: paymentMethods,
          totalRevenue: totalMetrics.totalRevenue || 0,
          totalOrders: totalMetrics.totalOrders || 0,
          activeUsers: 1200 // Mock data for now
        });

      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  if (loading) {
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
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Loading analytics...</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
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
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {isMerchant ? 'Using merchant analytics endpoints' : 'Using admin analytics endpoints'}
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              {isMerchant ? 'Merchant Analytics (Store-specific data)' : 'Admin Analytics (All stores data)'}
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
            </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{data.totalRevenue?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.totalOrders?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.activeUsers?.toLocaleString() || '0'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Products</CardTitle>
              <CardDescription>Top products by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              {data.bestSellers && data.bestSellers.length > 0 ? (
                <div className="space-y-2">
                  {data.bestSellers.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{product.name}</span>
                      <span className="text-sm font-medium">{product.totalSold} sold</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No best seller data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Payment Method</CardTitle>
              <CardDescription>Payment method breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {data.revenueByPayment && data.revenueByPayment.length > 0 ? (
                <div className="space-y-2">
                  {data.revenueByPayment.map((method, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">
                        {method._id || 'Cash/Transfer'}
                      </span>
                      <span className="text-sm font-medium">
                        ฿{method.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No payment method data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
