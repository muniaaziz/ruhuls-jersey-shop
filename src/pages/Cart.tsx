
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

const CartPage = () => {
  const { cartItems, loading, updateCartItem, removeCartItem, clearCart, totalCost } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isClearing, setIsClearing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      await updateCartItem(itemId, newQuantity);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
    } finally {
      setIsClearing(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      await removeCartItem(itemId);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth', { state: { from: '/cart', message: 'Please sign in to proceed to checkout' } });
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto py-16 px-4 min-h-screen">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jersey-purple"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <ShoppingCart size={64} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add items to your cart to proceed to checkout</p>
            <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items Table */}
              <div className="lg:col-span-2">
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="hidden sm:table-cell">Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map(item => {
                        let price = item.product.price_tier1;
                        if (item.quantity > 200) {
                          price = item.product.price_tier3;
                        } else if (item.quantity > 100) {
                          price = item.product.price_tier2;
                        }
                        
                        const itemTotal = price * item.quantity;
                        
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <div className="w-16 h-16 mr-3 bg-gray-100 rounded-md overflow-hidden">
                                  {item.product.image_url ? (
                                    <img
                                      src={item.product.image_url}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <ImagePlaceholder
                                      width="w-full"
                                      height="h-16"
                                      category={item.product.category}
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{item.product.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {Object.entries(item.sizesDistribution).map(([size, count]) => (
                                      <span key={size} className="mr-2">
                                        {size}: {count}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">৳{price}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                                  disabled={updatingItems[item.id]}
                                >
                                  <Minus size={12} />
                                </Button>
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                  className="h-8 w-14 text-center"
                                  disabled={updatingItems[item.id]}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  disabled={updatingItems[item.id]}
                                >
                                  <Plus size={12} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500"
                                  onClick={() => handleRemoveItem(item.id)}
                                  disabled={updatingItems[item.id]}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">৳{itemTotal}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700"
                    onClick={handleClearCart}
                    disabled={isClearing}
                  >
                    {isClearing ? 'Clearing...' : 'Clear Cart'}
                  </Button>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="border rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>৳{totalCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>৳0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>৳{totalCost}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => navigate('/products')}
                  >
                    Continue Shopping
                  </Button>
                  
                  <div className="mt-4 text-xs text-gray-500">
                    <p>Free shipping on orders above ৳5,000</p>
                    <p>Delivery in 5-7 business days after confirmation</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
