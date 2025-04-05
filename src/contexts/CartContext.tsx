
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CartItem, Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/utils/supabase";
import { mapDatabaseCartItem } from "@/utils/supabase";

type CartContextType = {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity: number, sizesDistribution: Record<string, number>, customization?: any, specialInstructions?: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number, sizesDistribution?: Record<string, number>) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalCost: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const loadCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      const mappedItems = data?.map(item => mapDatabaseCartItem(item)) || [];
      setCartItems(mappedItems);
    } catch (error: any) {
      console.error('Error loading cart:', error);
      toast({
        title: "Error loading cart",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);
  
  const addToCart = async (
    product: Product,
    quantity: number,
    sizesDistribution: Record<string, number>,
    customization: any = {},
    specialInstructions: string = ""
  ) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (existingItem) {
        // Update existing cart item
        // Fix: Use type assertion to handle the spread operator correctly
        const sizeDist = existingItem.sizes_distribution as Record<string, number> || {};
        const customOpts = existingItem.customization as Record<string, any> || {};
        
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity: existingItem.quantity + quantity,
            sizes_distribution: { ...sizeDist, ...sizesDistribution },
            customization: { ...customOpts, ...customization },
            special_instructions: specialInstructions || existingItem.special_instructions,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);
          
        if (updateError) {
          throw updateError;
        }
        
        toast({
          title: "Cart updated",
          description: `${product.name} quantity increased to ${existingItem.quantity + quantity}`,
        });
      } else {
        // Add new cart item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity,
            sizes_distribution: sizesDistribution,
            customization: customization,
            special_instructions: specialInstructions
          });
          
        if (insertError) {
          throw insertError;
        }
        
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} added to your cart`,
        });
      }
      
      await loadCart();
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const updateCartItem = async (itemId: string, quantity: number, sizesDistribution?: Record<string, number>) => {
    if (!user) return;
    
    try {
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!existingItem) {
        throw new Error('Cart item not found');
      }
      
      const updateData: any = {
        quantity,
        updated_at: new Date().toISOString()
      };
      
      if (sizesDistribution) {
        updateData.sizes_distribution = sizesDistribution;
      }
      
      const { error: updateError } = await supabase
        .from('cart_items')
        .update(updateData)
        .eq('id', itemId);
        
      if (updateError) {
        throw updateError;
      }
      
      await loadCart();
      
      toast({
        title: "Cart updated",
        description: "Your cart has been updated",
      });
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      toast({
        title: "Error updating cart",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const removeCartItem = async (itemId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
        
      if (error) {
        throw error;
      }
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const clearCart = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setCartItems([]);
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error clearing cart",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalCost = cartItems.reduce((sum, item) => {
    const product = item.product;
    let price = product.price_tier1;
    
    if (item.quantity > 200) {
      price = product.price_tier3;
    } else if (item.quantity > 100) {
      price = product.price_tier2;
    }
    
    return sum + (price * item.quantity);
  }, 0);
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        totalItems,
        totalCost
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
