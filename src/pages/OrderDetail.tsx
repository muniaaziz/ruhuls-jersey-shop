
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Truck, Package, ShoppingBag } from "lucide-react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import PaymentHistory from '@/components/admin/PaymentHistory';

const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:profiles(first_name, last_name),
          address:addresses(*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Fetch status updates
      const { data: statusData, error: statusError } = await supabase
        .from('status_updates')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (statusError) throw statusError;

      setOrder(orderData);
      setOrderItems(itemsData || []);
      setStatusUpdates(statusData || []);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error loading order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "production":
        return "bg-purple-100 text-purple-800";
      case "shipping":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "unpaid":
        return "bg-red-100 text-red-800";
      case "partially_paid":
        return "bg-amber-100 text-amber-800";
      case "fully_paid":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ShoppingBag className="h-5 w-5" />;
      case "verified":
        return <Package className="h-5 w-5" />;
      case "production":
        return <Package className="h-5 w-5" />;
      case "shipping":
      case "delivered":
        return <Truck className="h-5 w-5" />;
      default:
        return <ShoppingBag className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto max-w-5xl py-16 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jersey-purple"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto max-w-5xl py-16 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Order Not Found</h2>
            <p className="mt-2 text-gray-600">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/account/orders">
              <Button variant="outline" className="mt-6">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl py-16 px-4">
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div>
            <Link to="/account/orders">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4">Order #{orderId?.substring(0, 8)}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="flex space-x-2">
              <Badge variant="outline" className={getStatusBadgeStyles(order.status)}>
                {getOrderStatusIcon(order.status)}
                <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </Badge>
              <Badge variant="outline" className={getPaymentStatusBadgeStyles(order.payment_status)}>
                {order.payment_status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Order Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orderItems.map((item) => {
                    const product = item.product;
                    const price = calculateItemPrice(item.quantity, product);
                    const totalPrice = price * item.quantity;

                    return (
                      <div key={item.id} className="flex border-b pb-6 last:border-0 last:pb-0">
                        <div className="w-20 h-20 mr-4">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <ImagePlaceholder
                              width="w-full"
                              height="h-full"
                              category={product.category}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          
                          {/* Display sizes distribution */}
                          {item.sizes_distribution && Object.keys(item.sizes_distribution).length > 0 && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-600">Sizes:</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(item.sizes_distribution).map(([size, count]) => (
                                  <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {size}: {count as React.ReactNode}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Display any customizations */}
                          {item.customization && Object.keys(item.customization).length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Customizations:</p>
                              <ul className="list-disc list-inside text-xs text-gray-600 mt-1">
                                {item.customization.names && item.customization.names.length > 0 && (
                                  <li>Custom names: {item.customization.names.length}</li>
                                )}
                                {item.customization.numbers && item.customization.numbers.length > 0 && (
                                  <li>Custom numbers: {item.customization.numbers.length}</li>
                                )}
                                {item.customization.logo && (
                                  <li>Custom logo</li>
                                )}
                                {item.customization.customDesign && (
                                  <li>Custom design</li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          {/* Special Instructions */}
                          {item.special_instructions && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">Instructions:</p>
                              <p className="text-xs italic">{item.special_instructions}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">৳{totalPrice}</p>
                          <p className="text-sm text-gray-600">৳{price} each</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            {/* Order Status Timeline */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Order Status Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {statusUpdates.map((update, index) => (
                    <div key={update.id} className="relative pl-8">
                      {/* Status timeline dot and line */}
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-jersey-purple"></div>
                      {index < statusUpdates.length - 1 && (
                        <div className="absolute left-2 top-5 w-0.5 h-12 bg-gray-200"></div>
                      )}
                      
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium capitalize">
                            {update.status}
                          </h4>
                          <span className="text-xs text-gray-500 ml-2">
                            {formatDate(update.created_at)}
                          </span>
                        </div>
                        {update.notes && (
                          <p className="text-sm text-gray-600 mt-1">{update.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {statusUpdates.length === 0 && (
                    <p className="text-gray-500">No status updates available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order Summary */}
          <div className="space-y-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>৳{order.total_amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>৳0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>৳{order.total_amount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid:</span>
                    <span>৳{order.paid_amount || 0}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Due:</span>
                    <span>৳{order.total_amount - (order.paid_amount || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {order.address ? (
                  <div>
                    <p className="font-medium">{order.address.name}</p>
                    <p>{order.address.street}</p>
                    <p>{order.address.city}, {order.address.postal_code}</p>
                    <p>Phone: {order.address.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address provided</p>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <PaymentHistory orderId={orderId || ''} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper function to calculate item price based on quantity tiers
const calculateItemPrice = (quantity: number, product: any) => {
  if (quantity > 200) {
    return product.price_tier3;
  } else if (quantity > 100) {
    return product.price_tier2;
  }
  return product.price_tier1;
};

export default OrderDetail;
