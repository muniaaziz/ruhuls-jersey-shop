
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ShoppingCart } from "lucide-react";

const Cart: React.FC = () => {
  const { cartItems, updateItemQuantity, removeItemFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // Add null check for product and price
      const price = item.product?.price?.tier1 || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to proceed to checkout",
        variant: "destructive",
      });
      return;
    }
    navigate('/checkout');
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const value = e.target.value;
  
    if (value === '') {
      // Allow empty input temporarily for typing
      updateItemQuantity(itemId, value);
      return;
    }
  
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateItemQuantity(itemId, numValue);
    }
  };

  // Add this function to validate quantity on blur
  const handleQuantityBlur = (itemId: string, currentValue: any) => {
    if (currentValue === '' || typeof currentValue === 'string') {
      // Fallback to 1 if the input is empty or not a number
      updateItemQuantity(itemId, 1);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="bg-gray-50 py-16">
          <div className="jersey-container">
            <Card className="max-w-md mx-auto">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 text-center mb-4">Looks like you haven't added any items yet. Browse our products and find something you love!</p>
                <Button asChild>
                  <Link to="/products">
                    Start Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="jersey-container">
          <h1 className="text-3xl font-bold text-jersey-navy mb-6">Shopping Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {cartItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex items-center">
                          <Link to={`/product/${item.product?.id || '#'}`} className="mr-4">
                            <img
                              src={item.product?.imageUrl || '/placeholder.svg'}
                              alt={item.product?.name || 'Product'}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                          </Link>
                          <div>
                            <Link to={`/product/${item.product?.id || '#'}`} className="font-medium text-gray-700 hover:text-jersey-purple">
                              {item.product?.name || 'Product'}
                            </Link>
                            <div className="text-sm text-gray-500">৳{item.product?.price?.tier1 || 0}</div>
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="px-3 py-1 hover:bg-gray-100"
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={item.quantity}
                                onChange={(e) => handleQuantityInputChange(e, item.id)}
                                onBlur={() => handleQuantityBlur(item.id, item.quantity)}
                                className="w-12 text-center border-x py-1 focus:outline-none focus:ring-1 focus:ring-jersey-purple"
                              />
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 hover:bg-gray-100"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">
                            ৳{(item.product?.price?.tier1 || 0) * item.quantity}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeItemFromCart(item.id)}>
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-jersey-navy mb-4">Order Summary</h2>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">৳{calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">৳0</span>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-semibold">৳{calculateSubtotal()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 p-6">
                  <Button className="w-full" onClick={handleCheckout} disabled={isSubmitting}>
                    Proceed to Checkout <ArrowRight className="ml-2" />
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
