
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Address } from "@/types";
import { mapDatabaseAddress } from "@/utils/supabase";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

const addressSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  street: z.string().min(5, { message: "Street address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  postal_code: z.string().min(4, { message: "Postal code must be at least 4 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  is_default: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, totalCost, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      street: "",
      city: "",
      postal_code: "",
      phone: "",
      is_default: false,
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else if (cartItems.length === 0) {
      navigate("/cart");
    } else {
      fetchAddresses();
    }
  }, [user, cartItems.length, navigate]);

  const fetchAddresses = async () => {
    if (!user) return;

    try {
      setLoadingAddresses(true);
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) {
        throw error;
      }

      const mappedAddresses = data?.map(address => mapDatabaseAddress(address)) || [];
      setAddresses(mappedAddresses);
      
      // Set default address as selected if available
      const defaultAddress = mappedAddresses.find(address => address.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (mappedAddresses && mappedAddresses.length > 0) {
        setSelectedAddressId(mappedAddresses[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error loading addresses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingAddresses(false);
    }
  };

  const onSubmitAddress = async (values: AddressFormValues) => {
    if (!user) return;

    try {
      // Fix: Make sure all required fields are included in the insert
      const addressData = {
        user_id: user.id,
        name: values.name,
        street: values.street,
        city: values.city,
        postal_code: values.postal_code,
        phone: values.phone,
        is_default: values.is_default
      };
      
      const { error } = await supabase
        .from("addresses")
        .insert(addressData);

      if (error) {
        throw error;
      }

      toast({
        title: "Address added",
        description: "Your new address has been added successfully.",
      });
      
      // Reload addresses
      await fetchAddresses();
      setIsAddingAddress(false);
    } catch (error: any) {
      console.error("Error adding address:", error);
      toast({
        title: "Error adding address",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const placeOrder = async () => {
    if (!user || !selectedAddressId || cartItems.length === 0 || !agreeToTerms) {
      if (!agreeToTerms) {
        toast({
          title: "Terms and conditions",
          description: "Please agree to the terms and conditions to continue.",
          variant: "destructive",
        });
      } else if (!selectedAddressId) {
        toast({
          title: "Delivery address required",
          description: "Please select or add a delivery address.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the order first with payment tracking
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalCost,
          booking_amount: 0, // Default booking amount is 0
          paid_amount: 0, // Initial paid amount is 0
          payment_status: 'unpaid', // Initial status is unpaid
          delivery_address_id: selectedAddressId,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      if (!orderData) {
        throw new Error("Failed to create order. No data returned.");
      }

      console.log("Order created successfully:", orderData);
      
      // 2. Create order items individually to avoid RLS policy issues
      let allItemsCreated = true;
      const orderItemPromises = cartItems.map(async (item) => {
        const orderItemData = {
          order_id: orderData.id,
          product_id: item.product.id,
          quantity: item.quantity,
          customization: item.customization || {},
          sizes_distribution: item.sizesDistribution || {},
          special_instructions: item.specialInstructions || ""
        };

        console.log("Creating order item:", orderItemData);
        
        const { error: itemError } = await supabase
          .from("order_items")
          .insert(orderItemData);

        if (itemError) {
          console.error("Order item creation error for item:", item, "Error:", itemError);
          allItemsCreated = false;
          throw itemError;
        }
      });
      
      // Wait for all order items to be created
      await Promise.all(orderItemPromises);

      if (!allItemsCreated) {
        throw new Error("Failed to create one or more order items");
      }

      // 3. Create initial status update
      const { error: statusError } = await supabase
        .from("status_updates")
        .insert({
          order_id: orderData.id,
          status: "pending",
          notes: "Order placed",
        });

      if (statusError) {
        console.error("Status update error:", statusError);
        throw statusError;
      }

      // 4. Clear cart
      await clearCart();

      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and is being processed.",
      });

      // Redirect to order confirmation
      navigate(`/account/orders/${orderData.id}`);
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Error placing order",
        description: error.message || "Failed to place your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || cartItems.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Shipping & Payment */}
          <div className="lg:col-span-2">
            {/* Delivery Address */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAddresses ? (
                  <div>Loading addresses...</div>
                ) : (
                  <>
                    {!isAddingAddress && (
                      <div className="space-y-4">
                        {addresses.length > 0 ? (
                          <RadioGroup
                            value={selectedAddressId || ""}
                            onValueChange={setSelectedAddressId}
                          >
                            {addresses.map((address) => (
                              <div key={address.id} className="flex items-start space-x-2">
                                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                                <div className="grid gap-1.5">
                                  <label
                                    htmlFor={`address-${address.id}`}
                                    className="font-medium cursor-pointer"
                                  >
                                    {address.name} {address.isDefault && <span className="text-xs text-jersey-purple">(Default)</span>}
                                  </label>
                                  <p className="text-sm text-gray-500">
                                    {address.street}, {address.city}, {address.postalCode}
                                  </p>
                                  <p className="text-sm text-gray-500">Phone: {address.phone}</p>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : (
                          <p className="text-gray-500">
                            You don't have any saved addresses. Please add a delivery address.
                          </p>
                        )}
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddingAddress(true)}
                        >
                          Add New Address
                        </Button>
                      </div>
                    )}

                    {isAddingAddress && (
                      <div className="space-y-4">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitAddress)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main St" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Dhaka" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="postal_code"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="1207" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="01712345678" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="is_default"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Set as default address</FormLabel>
                                  </div>
                                </FormItem>
                              )}
                            />
                            <div className="flex space-x-2">
                              <Button type="submit">Save Address</Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddingAddress(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="cash_on_delivery" id="cod" />
                    <div className="grid gap-1.5">
                      <label htmlFor="cod" className="font-medium cursor-pointer">
                        Cash on Delivery
                      </label>
                      <p className="text-sm text-gray-500">
                        Pay when you receive your order
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank" />
                    <div className="grid gap-1.5">
                      <label htmlFor="bank" className="font-medium cursor-pointer">
                        Bank Transfer
                      </label>
                      <p className="text-sm text-gray-500">
                        Pay via bank transfer. Order will be confirmed after payment verification.
                      </p>
                      <div className="bg-gray-50 p-3 mt-1 rounded-md text-sm">
                        <p className="font-medium">Bank Details:</p>
                        <p>Bank: ABC Bank</p>
                        <p>Account Number: 12345678901</p>
                        <p>Account Name: Ruhul's Jersey Shop</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Special Instructions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label htmlFor="specialInstructions" className="text-sm font-medium">
                    Special Instructions (Optional)
                  </label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="Add any special instructions or notes for your order"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const { product, quantity } = item;
                    
                    let price = product.price_tier1;
                    if (quantity > 200) {
                      price = product.price_tier3;
                    } else if (quantity > 100) {
                      price = product.price_tier2;
                    }
                    
                    return (
                      <div key={item.id} className="flex items-center">
                        <div className="w-12 h-12 mr-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImagePlaceholder
                              width="w-full"
                              height="h-12"
                              category={product.category}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {quantity} × ৳{price}</p>
                        </div>
                        <div className="ml-2">
                          <p className="font-medium">৳{price * quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{totalCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span>৳0</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>৳{totalCost}</span>
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the terms and conditions
                    </label>
                    <p className="text-sm text-muted-foreground">
                      By placing this order, you agree to our terms of service and privacy policy.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={placeOrder}
                  disabled={
                    isSubmitting ||
                    !selectedAddressId ||
                    !agreeToTerms ||
                    cartItems.length === 0
                  }
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
