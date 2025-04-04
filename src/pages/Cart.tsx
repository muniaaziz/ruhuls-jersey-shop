
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trash, Plus, Minus, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

const Cart = () => {
  const { cartItems, loading, updateCartItem, removeCartItem, totalItems, totalCost } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Cart</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-8">
                Please sign in to view your cart or add items
              </p>
              <Button asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-16 px-4">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          <p>Loading your cart...</p>
        </div>
      </Layout>
    );
  }

  const handleQuantityChange = async (itemId: string, currentQuantity: number, increment: boolean) => {
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await updateCartItem(itemId, newQuantity);
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await removeCartItem(itemId);
    } finally {
      setIsUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const proceedToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartItems.map(item => {
                const { id, product, quantity, sizes_distribution } = item;
                
                let price = product.price_tier1;
                if (quantity > 200) {
                  price = product.price_tier3;
                } else if (quantity > 100) {
                  price = product.price_tier2;
                }
                
                const itemTotal = price * quantity;
                const isItemUpdating = isUpdating[id] || false;
                
                return (
                  <Card key={id} className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-24 h-24 mb-4 sm:mb-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <ImagePlaceholder
                              width="w-full"
                              height="h-24"
                              category={product.category}
                              text={product.name}
                            />
                          )}
                        </div>
                        <div className="flex-1 sm:ml-6">
                          <div className="flex flex-col sm:flex-row justify-between">
                            <div>
                              <h3 className="text-lg font-medium">
                                <Link to={`/product/${product.id}`} className="text-jersey-navy hover:text-jersey-purple">
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">
                                Price: ৳{price} per piece
                              </p>
                              
                              {/* Show size distribution if available */}
                              {sizes_distribution && Object.keys(sizes_distribution).length > 0 && (
                                <div className="text-sm text-gray-600 mb-2">
                                  <span className="font-medium">Sizes: </span>
                                  {Object.entries(sizes_distribution)
                                    .map(([size, count]) => `${size} (${count})`)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center mt-4 sm:mt-0">
                              <div className="flex items-center mr-6">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(id, quantity, false)}
                                  disabled={isItemUpdating || quantity <= 1}
                                  className="h-8 w-8"
                                >
                                  <Minus size={14} />
                                </Button>
                                <Input
                                  type="number"
                                  value={quantity}
                                  disabled={isItemUpdating}
                                  className="w-16 mx-2 text-center"
                                  readOnly
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(id, quantity, true)}
                                  disabled={isItemUpdating}
                                  className="h-8 w-8"
                                >
                                  <Plus size={14} />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(id)}
                                disabled={isItemUpdating}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash size={18} />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2 sm:text-right">
                            <span className="font-medium">Total: ৳{itemTotal}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Items ({totalItems}):</span>
                      <span>৳{totalCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>৳0</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>৳{totalCost}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={proceedToCheckout}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Import for icon when cart is empty
const ShoppingCart = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
};

export default Cart;
