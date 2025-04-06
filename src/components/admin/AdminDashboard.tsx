
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { subMonths, format, startOfMonth } from 'date-fns';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch product count
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        if (productError) throw productError;
        
        // Fetch order count
        const { count: orderCount, error: orderError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
          
        if (orderError) throw orderError;
        
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (userError) throw userError;
        
        // Fetch pending order count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (pendingError) throw pendingError;
        
        // Fetch recent orders
        const { data: recentOrders, error: recentError } = await supabase
          .from('orders')
          .select(`
            *,
            profiles:user_id(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentError) throw recentError;

        // Fetch monthly orders for the last 6 months
        const sixMonthsAgo = subMonths(new Date(), 6);
        
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('orders')
          .select('created_at, total_amount')
          .gte('created_at', sixMonthsAgo.toISOString());
        
        if (monthlyError) throw monthlyError;
        
        // Process monthly orders
        const monthlyOrdersMap = {};
        const monthlyRevenueMap = {};
        
        if (monthlyData) {
          monthlyData.forEach(order => {
            const month = format(new Date(order.created_at), 'MMM');
            monthlyOrdersMap[month] = (monthlyOrdersMap[month] || 0) + 1;
            monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + order.total_amount;
          });
          
          // Create datasets for charts
          const months = Object.keys(monthlyOrdersMap);
          
          const ordersData = months.map(month => ({
            name: month,
            orders: monthlyOrdersMap[month]
          }));
          
          const revenueData = months.map(month => ({
            name: month,
            revenue: monthlyRevenueMap[month]
          }));
          
          setMonthlyOrders(ordersData);
          setRevenueTrend(revenueData);
        }
        
        setStats({
          totalProducts: productCount || 0,
          totalOrders: orderCount || 0,
          totalUsers: userCount || 0,
          pendingOrders: pendingCount || 0,
          recentOrders: recentOrders || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jersey-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <Link to="/admin/reports" className="text-jersey-purple hover:text-jersey-purple/80 font-medium flex items-center">
          View Detailed Reports
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-500">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProducts}</div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/products" className="text-sm text-jersey-purple">View all products</Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/orders" className="text-sm text-jersey-purple">View all orders</Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-500">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/users" className="text-sm text-jersey-purple">View all users</Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-500">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
          <CardFooter>
            <Link to="/admin/orders?status=pending" className="text-sm text-jersey-purple">View pending orders</Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyOrders}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#8B5CF6" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrend}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#22C55E" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {order.profiles?.first_name
                            ? `${order.profiles.first_name} ${order.profiles.last_name || ''}`
                            : "User"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">৳{order.total_amount}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">No recent orders</div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/admin/orders" className="text-jersey-purple text-sm">
              View all orders
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
