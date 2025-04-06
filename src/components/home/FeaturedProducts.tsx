
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('popular', true)
          .limit(6);

        if (error) throw error;
        
        if (data) {
          // Transform database products to match our Product type
          const transformedProducts: Product[] = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.subcategory || 'uncategorized',
            subcategory: product.subcategory,
            imageUrl: product.image_url,
            price: {
              tier1: product.price_tier1,
              tier2: product.price_tier2,
              tier3: product.price_tier3 || 0,
            },
            popular: product.popular || false,
            features: product.features || [],
            customizationOptions: {
              nameAllowed: product.name_allowed || false,
              numberAllowed: product.number_allowed || false,
              logoAllowed: product.logo_allowed || false,
              customDesignAllowed: product.custom_design_allowed || false,
            }
          }));
          
          setProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="bg-gray-50 section-padding">
      <div className="jersey-container">
        <div className="text-center mb-10">
          <h2 className="heading-secondary mb-4">Popular Jerseys</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our most popular custom jersey designs, perfect for teams, events, and bulk orders.
            All jerseys can be customized with your team's colors, names, and numbers.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jersey-purple"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link 
                to={`/product/${product.id}`}
                key={product.id}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                  <div className="relative">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show placeholder if image fails to load
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-64';
                            parent.appendChild(placeholder);
                            
                            const root = createRoot(placeholder);
                            root.render(
                              <ImagePlaceholder 
                                category={product.category}
                                text={product.name}
                                height="h-64"
                              />
                            );
                          }
                        }}
                      />
                    ) : (
                      <ImagePlaceholder 
                        category={product.category}
                        text={product.name}
                        height="h-64"
                      />
                    )}
                    {product.popular && (
                      <div className="absolute top-2 right-2 bg-jersey-red text-white text-xs px-3 py-1 rounded-full">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-medium text-jersey-navy group-hover:text-jersey-purple transition-colors mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 flex-grow">
                      {product.description.substring(0, 100)}
                      {product.description.length > 100 ? "..." : ""}
                    </p>
                    <div className="flex flex-col mt-auto">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Bulk Pricing (per piece):</p>
                        <div className="flex justify-between mt-1">
                          <span>10-100 pcs: ৳{product.price.tier1}</span>
                          <span>101+ pcs: ৳{product.price.tier2}+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link 
            to="/products"
            className="button-primary inline-block"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
