
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: '/my-orders' } });
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items:order_items(
            id,
            quantity,
            product_id,
            sizes_distribution,
            customization,
            special_instructions,
            product:products(
              id,
              name,
              image_url,
              price_tier1,
              price_tier2,
              price_tier3
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-blue-100 text-blue-800';
      case 'production':
        return 'bg-purple-100 text-purple-800';
      case 'shipping':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return null; // Redirect happens in useEffect
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jersey-purple"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <ShoppingBag size={64} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Button onClick={() => navigate('/products')}>Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <CardDescription>ORDER #{order.id.slice(0, 8)}</CardDescription>
                      <CardTitle className="text-lg">{formatDate(order.created_at)}</CardTitle>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="mt-1 font-medium">৳{order.total_amount}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.order_items && order.order_items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          {item.product?.image_url ? (
                            <img 
                              src={item.product.image_url} 
                              alt={item.product?.name || 'Product image'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product?.name || 'Unknown Product'}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          {item.sizes_distribution && Object.keys(item.sizes_distribution).length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {Object.entries(item.sizes_distribution).map(([size, count]) => (
                                <span key={size} className="mr-2">
                                  {size}: {String(count)}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">৳{(item.product?.price_tier1 || 0) * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" className="flex items-center" onClick={() => navigate(`/products`)}>
                      Reorder <ArrowRight size={16} className="ml-2" />
                    </Button>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-lg">৳{order.total_amount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrders;
