import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import ImagePlaceholder from '@/components/ui/ImagePlaceholder';
import { Button } from '@/components/ui/button';
import { createRoot } from 'react-dom/client';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<'description' | 'customization' | 'sizing'>('description');
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchProduct = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error) {
          console.error('Error fetching product:', error);
          throw error;
        }
        
        if (data) {
          console.log('Fetched product:', data);
          setProduct({
            id: data.id,
            name: data.name,
            description: data.description,
            category: data.subcategory || 'uncategorized',
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
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
    // Reset quantity when product changes
    setQuantity(10);
  }, [productId]);
  
  const getPrice = () => {
    if (!product) return 0;
    if (quantity >= 10 && quantity <= 100) {
      return product.price.tier1;
    } else if (quantity > 100 && quantity <= 200) {
      return product.price.tier2;
    } else {
      return product.price.tier3;
    }
  };
  
  const totalPrice = getPrice() * quantity;
  
  const getDefaultSizesDistribution = () => {
    const totalQuantity = quantity;
    const sizesArray = ['S', 'M', 'L', 'XL', 'XXL'];
    const distribution: Record<string, number> = {};
    
    const baseCount = Math.floor(totalQuantity / sizesArray.length);
    const remainder = totalQuantity % sizesArray.length;
    
    sizesArray.forEach((size, index) => {
      if (size === 'M' || size === 'L') {
        distribution[size] = baseCount + (index < remainder ? 1 : 0) + 1;
      } else {
        distribution[size] = baseCount + (index < remainder ? 1 : 0);
      }
    });
    
    let currentTotal = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (currentTotal > totalQuantity) {
      const sizesToReduce = ['XXL', 'XL', 'S'];
      for (const size of sizesToReduce) {
        const excess = currentTotal - totalQuantity;
        if (excess <= 0) break;
        const reduction = Math.min(excess, distribution[size]);
        distribution[size] -= reduction;
        currentTotal -= reduction;
      }
    }
    
    return distribution;
  };
  
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const customization = {
        nameRequired: false,
        numberRequired: false,
        logoRequired: false,
        customDesignRequired: false,
      };
      
      await addToCart(
        product,
        quantity, 
        getDefaultSizesDistribution(),
        customization
      );
      
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} added to your cart`,
      });
      
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Could not add to cart. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="jersey-container py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jersey-purple"></div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="jersey-container py-16 text-center">
          <h1 className="text-3xl font-bold text-jersey-navy mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you are looking for might have been removed or doesn't exist.</p>
          <Link to="/products" className="button-primary">
            View All Products
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-8">
        <div className="jersey-container">
          <nav className="flex flex-wrap mb-6 text-sm">
            <Link to="/" className="text-gray-500 hover:text-jersey-purple">Home</Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <Link to="/products" className="text-gray-500 hover:text-jersey-purple">Products</Link>
            <ChevronRight className="mx-2 h-4 w-4 text-gray-400" />
            <span className="text-jersey-purple">{product.name}</span>
          </nav>
          
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <div className="rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-64 md:h-96 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const parent = (e.target as HTMLImageElement).parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'h-64 md:h-96 w-full';
                          parent.appendChild(placeholder);
                          
                          const root = createRoot(placeholder);
                          root.render(
                            <ImagePlaceholder 
                              category={product.category}
                              text={product.name}
                              height="h-full"
                            />
                          );
                        }
                      }}
                    />
                  ) : (
                    <ImagePlaceholder 
                      category={product.category}
                      text={product.name}
                      height="h-64 md:h-96"
                    />
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 md:h-20 w-16 md:w-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-jersey-purple">
                      <ImagePlaceholder 
                        category={product.category}
                        height="h-full"
                        width="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-jersey-navy mb-2">{product.name}</h1>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Bulk Pricing (per piece):</h3>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className={`p-2 md:p-3 rounded-md ${quantity >= 10 && quantity <= 100 ? 'bg-jersey-purple text-white' : 'bg-gray-100'}`}>
                      <p className="font-semibold">10-100 pcs</p>
                      <p>৳{product.price.tier1}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-md ${quantity > 100 && quantity <= 200 ? 'bg-jersey-purple text-white' : 'bg-gray-100'}`}>
                      <p className="font-semibold">101-200 pcs</p>
                      <p>৳{product.price.tier2}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-md ${quantity > 200 ? 'bg-jersey-purple text-white' : 'bg-gray-100'}`}>
                      <p className="font-semibold">200+ pcs</p>
                      <p>৳{product.price.tier3}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block font-medium text-gray-700 mb-2">Quantity (Minimum 10):</label>
                  <div className="flex items-center">
                    <button 
                      onClick={() => setQuantity(Math.max(10, quantity - 5))}
                      className="bg-gray-200 px-3 py-1 rounded-l-md hover:bg-gray-300"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="10"
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                      className="w-20 px-3 py-1 border-y text-center focus:outline-none"
                      aria-label="Quantity"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 5)}
                      className="bg-gray-200 px-3 py-1 rounded-r-md hover:bg-gray-300"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="mb-6 bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Current Price (per piece):</span>
                    <span className="font-medium">৳{getPrice()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Quantity:</span>
                    <span className="font-medium">{quantity} pcs</span>
                  </div>
                  <div className="border-t border-gray-300 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">Total Price:</span>
                    <span className="font-bold text-xl text-jersey-purple">৳{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Customization Available:</h3>
                  <ul className="space-y-1">
                    {product.customizationOptions.nameAllowed && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" /> Name Printing
                      </li>
                    )}
                    {product.customizationOptions.numberAllowed && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" /> Number Printing
                      </li>
                    )}
                    {product.customizationOptions.logoAllowed && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" /> Logo Placement
                      </li>
                    )}
                    {product.customizationOptions.customDesignAllowed && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" /> Custom Design Upload
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-jersey-purple hover:bg-jersey-purple/90 text-white px-4 py-3 rounded-md font-medium flex-1 flex items-center justify-center"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" /> Customize & Order
                  </Button>
                  <a 
                    href="https://wa.me/8801710093471?text=Hello%2C%20I'm%20interested%20in%20ordering%20the%20product%3A%20" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="button-whatsapp flex-1 justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.403 5.633A8.919 8.919 0 0 0 12.053 3c-4.948 0-8.976 4.027-8.978 8.977 0 1.582.413 3.126 1.198 4.488L3 21.116l4.759-1.249a8.981 8.981 0 0 0 4.29 1.093h.004c4.947 0 8.975-4.027 8.977-8.977a8.926 8.926 0 0 0-2.627-6.35m-6.35 13.812h-.003a7.446 7.446 0 0 1-3.798-1.041l-.272-.162-2.824.741.753-2.753-.177-.282a7.448 7.448 0 0 1-1.141-3.971c.002-4.114 3.349-7.461 7.465-7.461a7.413 7.413 0 0 1 5.275 2.188 7.42 7.42 0 0 1 2.183 5.279c-.002 4.114-3.349 7.462-7.461 7.462m4.093-5.589c-.225-.113-1.327-.655-1.533-.73-.205-.075-.354-.112-.504.112s-.58.729-.711.879-.262.168-.486.056-.947-.349-1.804-1.113c-.667-.595-1.117-1.329-1.248-1.554s-.014-.346.099-.458c.101-.1.224-.262.336-.393.112-.131.149-.224.224-.374s.038-.281-.019-.393c-.056-.113-.505-1.217-.692-1.666-.181-.435-.366-.377-.504-.383a9.65 9.65 0 0 0-.429-.008.826.826 0 0 0-.599.28c-.206.225-.785.767-.785 1.871s.804 2.171.916 2.321c.112.15 1.582 2.415 3.832 3.387.536.231.954.369 1.279.473.537.171 1.026.146 1.413.089.431-.064 1.327-.542 1.514-1.066.187-.524.187-.973.131-1.067-.056-.094-.207-.151-.43-.263"></path>
                    </svg>
                    Discuss on WhatsApp
                  </a>
                </div>
                
                <div className="mt-4 flex items-start text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p>Minimum order quantity is 10 pieces. For orders less than 10 pieces, please contact us directly via WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
            <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 md:px-0 md:mx-0 border-b">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 px-4 font-medium whitespace-nowrap ${activeTab === 'description' ? 'border-b-2 border-jersey-purple text-jersey-purple' : 'text-gray-500'}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('customization')}
                className={`pb-4 px-4 font-medium whitespace-nowrap ${activeTab === 'customization' ? 'border-b-2 border-jersey-purple text-jersey-purple' : 'text-gray-500'}`}
              >
                Customization
              </button>
              <button
                onClick={() => setActiveTab('sizing')}
                className={`pb-4 px-4 font-medium whitespace-nowrap ${activeTab === 'sizing' ? 'border-b-2 border-jersey-purple text-jersey-purple' : 'text-gray-500'}`}
              >
                Size Guide
              </button>
            </div>
            
            <div className="py-6">
              {activeTab === 'description' && (
                <div>
                  <h3 className="text-xl font-semibold text-jersey-navy mb-4">Product Description</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  
                  {product.features && (
                    <>
                      <h4 className="font-medium text-jersey-navy mt-6 mb-2">Features:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {product.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              
              {activeTab === 'customization' && (
                <div>
                  <h3 className="text-xl font-semibold text-jersey-navy mb-4">Customization Options</h3>
                  
                  {product.customizationOptions.nameAllowed && (
                    <div className="mb-6">
                      <h4 className="font-medium text-jersey-navy mb-2">Name Printing</h4>
                      <p className="text-gray-600">Add names to the back of jerseys. We offer various font options and sizes. Names can be printed in multiple colors.</p>
                    </div>
                  )}
                  
                  {product.customizationOptions.numberAllowed && (
                    <div className="mb-6">
                      <h4 className="font-medium text-jersey-navy mb-2">Number Printing</h4>
                      <p className="text-gray-600">Add numbers to the back and/or front of jerseys. Various sizes and positions available. Numbers can be printed in multiple colors and styles.</p>
                    </div>
                  )}
                  
                  {product.customizationOptions.logoAllowed && (
                    <div className="mb-6">
                      <h4 className="font-medium text-jersey-navy mb-2">Logo Placement</h4>
                      <p className="text-gray-600">Add your team logo or sponsor logos to the jersey. Logos can be placed on the chest, sleeves, or back. We accept PNG and vector files for best quality.</p>
                    </div>
                  )}
                  
                  {product.customizationOptions.customDesignAllowed && (
                    <div className="mb-6">
                      <h4 className="font-medium text-jersey-navy mb-2">Custom Design Upload</h4>
                      <p className="text-gray-600">Upload your own complete jersey design. We accept AI, PSD, PDF, or high-resolution PNG files. Our design team will work with you to ensure the best results.</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-md mt-6">
                    <h4 className="font-medium text-jersey-navy mb-2">File Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Logos: PNG or Vector (AI, EPS, PDF) with transparent background</li>
                      <li>Custom Designs: AI, PSD, PDF or high-resolution PNG</li>
                      <li>Minimum resolution: 300 DPI</li>
                      <li>Maximum file size: 20MB</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'sizing' && (
                <div>
                  <h3 className="text-xl font-semibold text-jersey-navy mb-4">Size Guide</h3>
                  
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 font-medium">Size</th>
                          <th className="px-4 py-3 font-medium">Chest (in)</th>
                          <th className="px-4 py-3 font-medium">Length (in)</th>
                          <th className="px-4 py-3 font-medium">Sleeve (in)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                          <tr key={size} className="border-b">
                            <td className="px-4 py-3 font-medium">{size}</td>
                            <td className="px-4 py-3">
                              {
                                size === 'S' ? '36-38' :
                                size === 'M' ? '38-40' :
                                size === 'L' ? '40-42' :
                                size === 'XL' ? '42-44' : '44-46'
                              }
                            </td>
                            <td className="px-4 py-3">
                              {
                                size === 'S' ? '27' :
                                size === 'M' ? '28' :
                                size === 'L' ? '29' :
                                size === 'XL' ? '30' : '31'
                              }
                            </td>
                            <td className="px-4 py-3">
                              {
                                size === 'S' ? '8' :
                                size === 'M' ? '8.5' :
                                size === 'L' ? '9' :
                                size === 'XL' ? '9.5' : '10'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <h4 className="font-medium text-jersey-navy mb-2">How to Measure:</h4>
                  <p className="text-gray-600 mb-4">For the most accurate fit, we recommend taking measurements from a similar garment that fits well.</p>
                  
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li><span className="font-medium">Chest:</span> Measure across the chest from armpit to armpit and multiply by 2.</li>
                    <li><span className="font-medium">Length:</span> Measure from the highest point of the shoulder to the bottom hem.</li>
                    <li><span className="font-medium">Sleeve:</span> Measure from the shoulder seam to the end of the sleeve.</li>
                  </ul>
                  
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-6">
                    <h4 className="font-medium text-amber-800 mb-1">Size Distribution:</h4>
                    <p className="text-amber-700">When ordering, you'll be able to specify how many pieces you need in each size. The total must match your order quantity.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-jersey-navy mb-6">You May Also Like</h3>
            
            <div id="related-products" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Related products will be populated dynamically */}
              {/* This will be implemented in a future update */}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
