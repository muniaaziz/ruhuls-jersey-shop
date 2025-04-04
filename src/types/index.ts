
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  imageUrl: string;
  price: {
    tier1: number; // 10-100 pieces
    tier2: number; // 101-200 pieces
    tier3: number; // 200+ pieces
  };
  popular: boolean;
  features?: string[];
  customizationOptions: CustomizationOptions;
}

export interface CustomizationOptions {
  nameAllowed: boolean;
  numberAllowed: boolean;
  logoAllowed: boolean;
  customDesignAllowed: boolean;
}

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  subcategories?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  customization: {
    names?: { name: string; size: string }[];
    numbers?: { number: string; size: string }[];
    logo?: string;
    customDesign?: string;
  };
  sizesDistribution: {
    [key: string]: number; // e.g., "S": 5, "M": 10
  };
  specialInstructions?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'pending' | 'verified' | 'production' | 'shipping' | 'delivered' | 'completed';
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
  deliveryAddress: Address;
  trackingInfo?: string;
  statusHistory: StatusUpdate[];
  paymentHistory: PaymentRecord[];
}

export interface StatusUpdate {
  status: string;
  timestamp: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  timestamp: string;
  method: string;
  notes?: string;
}
