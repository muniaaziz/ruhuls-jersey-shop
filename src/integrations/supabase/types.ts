export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          phone: string
          postal_code: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          phone: string
          postal_code: string
          street: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string
          postal_code?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          customization: Json | null
          id: string
          product_id: string
          quantity: number
          sizes_distribution: Json | null
          special_instructions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customization?: Json | null
          id?: string
          product_id: string
          quantity: number
          sizes_distribution?: Json | null
          special_instructions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customization?: Json | null
          id?: string
          product_id?: string
          quantity?: number
          sizes_distribution?: Json | null
          special_instructions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          subcategories: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          subcategories?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          subcategories?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          customization: Json | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          sizes_distribution: Json | null
          special_instructions: string | null
        }
        Insert: {
          created_at?: string
          customization?: Json | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          sizes_distribution?: Json | null
          special_instructions?: string | null
        }
        Update: {
          created_at?: string
          customization?: Json | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          sizes_distribution?: Json | null
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_orders"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_products"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address_id: string | null
          id: string
          paid_amount: number
          status: string
          total_amount: number
          tracking_info: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address_id?: string | null
          id?: string
          paid_amount?: number
          status?: string
          total_amount: number
          tracking_info?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address_id?: string | null
          id?: string
          paid_amount?: number
          status?: string
          total_amount?: number
          tracking_info?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          notes: string | null
          order_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          notes?: string | null
          order_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_payment_records_orders"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          custom_design_allowed: boolean | null
          description: string
          features: string[] | null
          id: string
          image_url: string
          logo_allowed: boolean | null
          name: string
          name_allowed: boolean | null
          number_allowed: boolean | null
          popular: boolean | null
          price_tier1: number
          price_tier2: number
          price_tier3: number
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          custom_design_allowed?: boolean | null
          description: string
          features?: string[] | null
          id?: string
          image_url: string
          logo_allowed?: boolean | null
          name: string
          name_allowed?: boolean | null
          number_allowed?: boolean | null
          popular?: boolean | null
          price_tier1: number
          price_tier2: number
          price_tier3: number
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          custom_design_allowed?: boolean | null
          description?: string
          features?: string[] | null
          id?: string
          image_url?: string
          logo_allowed?: boolean | null
          name?: string
          name_allowed?: boolean | null
          number_allowed?: boolean | null
          popular?: boolean | null
          price_tier1?: number
          price_tier2?: number
          price_tier3?: number
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      status_updates: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_status_updates_orders"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "status_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
