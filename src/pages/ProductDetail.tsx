
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { useCart } from "@/contexts/CartContext";

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number | string>(1);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (!productId) throw new Error("No product ID provided");

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        // Transform database product to match our Product type
        const transformedProduct: Product = {
          id: data.id,
          name: data.name,
          description: data.description,
          category: data.subcategory || 'uncategorized', // Use subcategory field
          subcategory: data.subcategory,
          imageUrl: data.image_url,
          price: {
            tier1: data.price_tier1,
            tier2: data.price_tier2,
            tier3: data.price_tier3 || 0,
          },
          popular: data.popular || false,
          features: data.features || [],
          customizationOptions: {
            nameAllowed: data.name_allowed || false,
            numberAllowed: data.number_allowed || false,
            logoAllowed: data.logo_allowed || false,
            customDesignAllowed: data.custom_design_allowed || false,
          }
        };

        setProduct(transformedProduct);
      } catch (error: any) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error loading product",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, toast]);

  const openCustomizationModal = () => {
    setIsCustomizationModalOpen(true);
  };

  const closeCustomizationModal = () => {
    setIsCustomizationModalOpen(false);
    setCustomName('');
    setCustomNumber('');
    setSpecialInstructions('');
  };

  const handleAddToCart = () => {
    if (!product) return;

    const quantityValue = typeof quantity === 'string' ? parseInt(quantity) : quantity;

    if (isNaN(quantityValue) || quantityValue < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    // Create empty sizes distribution object (required by type)
    const sizesDistribution: Record<string, number> = { "default": quantityValue };

    // Create customization object
    const customization = {
      name: customName,
      number: customNumber,
    };

    addToCart(product, quantityValue, sizesDistribution, customization, specialInstructions);
    
    toast({
      title: "Added to cart",
      description: `${quantityValue} ${product.name} added to cart`,
    });
    closeCustomizationModal();
  };

  const handleWhatsAppClick = () => {
    if (!product) return;
    const message = encodeURIComponent(
      `I'm interested in the ${product.name}. Can you provide more details?`
    );
    window.open(`https://wa.me/+8801624700344?text=${message}`, '_blank');
  };

  // Update the quantity change handler to properly handle manual input
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      // Allow empty input for typing
      if (e.target.value === '') {
        setQuantity('');
        return;
      }
      // Else set to minimum 1
      value = 1;
    }
    setQuantity(value);
  };

  // Add a blur handler to ensure final value is valid
  const handleQuantityBlur = () => {
    if (quantity === '' || typeof quantity === 'string') {
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-16">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jersey-purple"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Product Not Found</h2>
            <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
            <Button variant="outline" onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              <ImagePlaceholder
                width="w-full"
                height="h-auto"
                category={product.category}
              />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-jersey-navy mb-4">{product.name}</h1>
            <p className="text-gray-700 mb-6">{product.description}</p>
            <p className="text-xl font-semibold text-jersey-purple mb-4">
              ৳{product.price.tier1}
            </p>

            {/* Display available features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Features:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display customization options */}
            {product.customizationOptions && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Customization Options:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {product.customizationOptions.nameAllowed && <li>Name Printing Available</li>}
                  {product.customizationOptions.numberAllowed && <li>Number Printing Available</li>}
                  {product.customizationOptions.logoAllowed && <li>Logo Placement Available</li>}
                  {product.customizationOptions.customDesignAllowed && <li>Custom Design Available</li>}
                </ul>
              </div>
            )}

            {/* Quantity selection */}
            <div className="flex items-center mt-6">
              <label htmlFor="quantity" className="mr-4 text-gray-700 font-medium">
                Quantity:
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(prev => typeof prev === 'number' && prev > 1 ? prev - 1 : 1)}
                  className="px-3 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  onBlur={handleQuantityBlur}
                  className="w-16 text-center border-y border-gray-200 py-1 focus:outline-none focus:ring-1 focus:ring-jersey-purple"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(prev => typeof prev === 'number' ? prev + 1 : 1)}
                  className="px-3 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action buttons - fix alignment */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
              <Button
                onClick={openCustomizationModal}
                className="w-full sm:flex-1 bg-jersey-purple hover:bg-jersey-purple-dark text-white"
              >
                Customize & Order
              </Button>
              <Button
                variant="outline"
                onClick={handleWhatsAppClick}
                className="w-full sm:flex-1 border-jersey-purple text-jersey-purple hover:bg-jersey-purple/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zM8.46 14.45l-1.36.1c-.71.07-1.4-.3-1.79-.86l-.12-.15c-.44-.58-.49-1.32-.04-1.85.68-.86 1.66-1.53 2.7-1.83l.29-.09c.57-.17 1.16-.02 1.57.37l.16.15c.36.33.55.79.54 1.26-.04.12-.08.24-.14.35-.33.7-1.15.95-1.81.65z"
                    clipRule="evenodd"
                  />
                </svg>
                Discuss on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      <Dialog open={isCustomizationModalOpen} onOpenChange={setIsCustomizationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Your Jersey</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {product?.customizationOptions?.nameAllowed && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Custom Name
                </Label>
                <Input
                  id="name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
            {product?.customizationOptions?.numberAllowed && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">
                  Custom Number
                </Label>
                <Input
                  id="number"
                  value={customNumber}
                  onChange={(e) => setCustomNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructions" className="text-right">
                Special Instructions
              </Label>
              <Input
                id="instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="col-span-3"
                placeholder="Any special requests?"
              />
            </div>
          </div>
          <div className='flex justify-end'>
            <Button onClick={handleAddToCart}>Add to Cart</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
