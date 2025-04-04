
import { Database } from "@/integrations/supabase/types";

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Mapping database types to our frontend types
export const mapDatabaseCartItem = (item: Tables<'cart_items'> & { product: Tables<'products'> }): any => {
  return {
    id: item.id,
    productId: item.product_id,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      image_url: item.product.image_url,
      price_tier1: item.product.price_tier1,
      price_tier2: item.product.price_tier2,
      price_tier3: item.product.price_tier3,
      // Add other fields as needed
    },
    quantity: item.quantity,
    customization: item.customization || {},
    sizesDistribution: item.sizes_distribution || {},
    specialInstructions: item.special_instructions,
  };
};

export const mapDatabaseAddress = (item: Tables<'addresses'>): any => {
  return {
    id: item.id,
    name: item.name,
    street: item.street,
    city: item.city,
    postalCode: item.postal_code,
    phone: item.phone,
    isDefault: item.is_default,
  };
};
