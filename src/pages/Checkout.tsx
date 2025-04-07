
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, calculateTotalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchShippingAddresses();
    }
  }, [user]);

  const fetchShippingAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setShippingAddresses(data || []);
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error fetching addresses",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Update the placeOrder function to handle order creation and redirect to my orders page
  const placeOrder = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to place an order",
        variant: "destructive",
      });
      return;
    }

    if (!shippingAddress) {
      setFormError("Please select a shipping address");
      return;
    }

    try {
      setProcessing(true);

      // Create the new order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            total_amount: calculateTotalPrice(),
            delivery_address_id: shippingAddress.id,
            status: 'pending',
            payment_status: 'unpaid',
            booking_amount: 0,
            paid_amount: 0,
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;
      
      console.log("Created order:", order);

      // Create order items
      for (const item of cartItems) {
        const orderItem = {
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          customization: item.customization || {},
          sizes_distribution: item.sizesDistribution || {},
          special_instructions: item.specialInstructions,
        };

        const { error: itemError } = await supabase
          .from('order_items')
          .insert(orderItem);

        if (itemError) throw itemError;
      }

      // Create initial status update using edge function to bypass RLS
      const statusUpdateResponse = await fetch('/api/update-order-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        },
        body: JSON.stringify({
          orderId: order.id,
          status: 'pending',
          notes: 'Order placed'
        })
      });

      if (!statusUpdateResponse.ok) {
        const errorData = await statusUpdateResponse.json();
        throw new Error(`Status update failed: ${errorData.error}`);
      }

      // Clear cart after successful order
      clearCart();

      // Show success message
      toast({
        title: "Order placed successfully!",
        description: "You will be redirected to your orders page.",
        variant: "default",
      });

      // Redirect to my orders page
      setTimeout(() => {
        navigate('/account/orders');
      }, 2000);
      
    } catch (error: any) {
      console.error("Error placing order:", error);
      setFormError(`Failed to place order: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl py-16 px-4">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600">Your cart is empty. Add products to continue.</p>
            <Button onClick={() => navigate('/products')}>Go to Products</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {shippingAddresses.length > 0 ? (
                  <RadioGroup defaultValue={shippingAddress?.id} onValueChange={(value) => {
                    const selectedAddress = shippingAddresses.find(addr => addr.id === value);
                    setShippingAddress(selectedAddress);
                  }}>
                    <div className="grid gap-2">
                      {shippingAddresses.map((address) => (
                        <div className="flex items-center space-x-2" key={address.id}>
                          <RadioGroupItem value={address.id} id={address.id} className="cursor-pointer" />
                          <Label htmlFor={address.id} className="cursor-pointer">
                            <div className="font-medium">{address.name}</div>
                            <div>{address.street}, {address.city}, {address.postal_code}</div>
                            <div>Phone: {address.phone}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600">No shipping addresses found. Please add one in your account settings.</p>
                    <Button onClick={() => navigate('/account/addresses')}>Add Address</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>৳{item.product.price.tier1 * item.quantity}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>৳{calculateTotalPrice()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {formError && (
              <div className="text-red-500">{formError}</div>
            )}

            <Button
              className="w-full"
              onClick={placeOrder}
              disabled={processing || !shippingAddress}
            >
              {processing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;
