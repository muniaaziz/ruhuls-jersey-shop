import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Line, Bar } from 'recharts';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format, subDays, addDays, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type ReportType = 'sales' | 'orders' | 'products';

interface OrdersByDate {
  date: string;
  count: number;
  revenue: number;
}

interface ProductSales {
  product: string;
  count: number;
  revenue: number;
}

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  const [ordersByDate, setOrdersByDate] = useState<OrdersByDate[]>([]);
  const [topProducts, setTopProducts] = useState<ProductSales[]>([]);
  const [revenueTotals, setRevenueTotals] = useState({
    total: 0,
    average: 0,
    growth: 0
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Predefined date ranges
  const dateRangeOptions = [
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Custom', value: 'custom' }
  ];

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchReportData();
    }
  }, [reportType, dateRange, currentPage]);

  const handleDateRangePreset = (preset: string) => {
    const today = new Date();
    
    switch (preset) {
      case 'last7':
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case 'last30':
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: endOfMonth(today) });
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        setDateRange({ 
          from: startOfMonth(lastMonth), 
          to: endOfMonth(lastMonth) 
        });
        break;
      default:
        // Keep current custom range
        break;
    }
  };

  const fetchReportData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    
    try {
      const fromDate = format(dateRange.from, 'yyyy-MM-dd');
      const toDate = format(dateRange.to, 'yyyy-MM-dd');
      
      // Get total days in range for pagination
      const daysDiff = differenceInDays(dateRange.to, dateRange.from) + 1;
      const calculatedTotalPages = Math.ceil(daysDiff / itemsPerPage);
      setTotalPages(calculatedTotalPages);
      
      if (reportType === 'sales' || reportType === 'orders') {
        // Fetch orders data
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select(`
            id, 
            created_at, 
            total_amount,
            order_items(quantity, product_id, products:product_id(name))
          `)
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (ordersData) {
          // Process orders by date
          const groupedByDate: Record<string, { count: number; revenue: number }> = {};
          
          ordersData.forEach(order => {
            const date = format(new Date(order.created_at), 'yyyy-MM-dd');
            
            if (!groupedByDate[date]) {
              groupedByDate[date] = { count: 0, revenue: 0 };
            }
            
            groupedByDate[date].count += 1;
            groupedByDate[date].revenue += order.total_amount;
          });
          
          // Convert to array format for charts
          const ordersByDateArray = Object.entries(groupedByDate).map(([date, stats]) => ({
            date,
            count: stats.count,
            revenue: stats.revenue
          })).sort((a, b) => a.date.localeCompare(b.date));
          
          setOrdersByDate(ordersByDateArray);
          
          // Calculate revenue totals
          const totalRevenue = ordersByDateArray.reduce((sum, item) => sum + item.revenue, 0);
          const avgRevenue = totalRevenue / Math.max(ordersByDateArray.length, 1);
          
          setRevenueTotals({
            total: totalRevenue,
            average: avgRevenue,
            growth: 0 // Would need previous period data for accurate calculation
          });
          
          // Process top products
          const productSales: Record<string, { count: number; revenue: number; name: string }> = {};
          
          ordersData.forEach(order => {
            if (!order.order_items) return;
            
            order.order_items.forEach((item: any) => {
              const productId = item.product_id;
              const productName = item.products?.name || 'Unknown Product';
              const quantity = item.quantity || 0;
              // Estimate revenue per item based on order total and quantities
              const estimatedRevenue = (quantity / order.order_items.length) * order.total_amount;
              
              if (!productSales[productId]) {
                productSales[productId] = { count: 0, revenue: 0, name: productName };
              }
              
              productSales[productId].count += quantity;
              productSales[productId].revenue += estimatedRevenue;
            });
          });
          
          // Convert to array and sort by revenue
          const topProductsArray = Object.values(productSales)
            .map(({ name, count, revenue }) => ({ product: name, count, revenue }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
          
          setTopProducts(topProductsArray);
        }
      } else if (reportType === 'products') {
        // Fetch products data
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Would process product performance data here
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold">Reports & Analytics</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="orders">Order Analytics</SelectItem>
                <SelectItem value="products">Product Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-48">
            <Select onValueChange={handleDateRangePreset} defaultValue="thisMonth">
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-auto">
            <DateRangePicker date={dateRange} onUpdate={setDateRange} />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jersey-purple"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {reportType === 'sales' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">৳{revenueTotals.total.toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500">Average Daily Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">৳{Math.round(revenueTotals.average).toLocaleString()}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-500">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {ordersByDate.reduce((sum, day) => sum + day.count, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Main Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportType === 'sales' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={ordersByDate}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`৳${value}`, 'Revenue']} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#8b5cf6" 
                            name="Revenue" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="product" tick={false} />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => {
                              return name === 'revenue' 
                                ? [`৳${Number(value).toLocaleString()}`, 'Revenue'] 
                                : [value, 'Quantity'];
                            }} 
                            labelFormatter={(label) => {
                              // Truncate long product names
                              return label.length > 30 ? label.substring(0, 27) + '...' : label;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                          <Bar dataKey="count" fill="#22c55e" name="Units Sold" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {reportType === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ordersByDate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8b5cf6" name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pageNumber;
                  
                  if (totalPages <= 5) {
                    pageNumber = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + idx;
                  } else {
                    pageNumber = currentPage - 2 + idx;
                  }
                  
                  return (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        isActive={pageNumber === currentPage}
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
