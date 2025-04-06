import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import { supabase } from '@/integrations/supabase/client';
import { createRoot } from 'react-dom/client';

interface Category {
  id: string;
  name: string;
  subcategories: string[];
  image_url?: string;
}

const FeaturedCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*');

        if (error) throw error;
        
        if (data) {
          setCategories(data.map(cat => ({
            id: cat.id,
            name: cat.name,
            subcategories: cat.subcategories || [],
            image_url: cat.image_url
          })));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="bg-white section-padding">
      <div className="jersey-container">
        <div className="text-center mb-10">
          <h2 className="heading-secondary mb-4">Our Jersey Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of custom jerseys for various sports and events. 
            All jerseys can be fully customized with names, numbers, and logos.
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jersey-purple"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link 
                to={`/products/${category.name.toLowerCase()}`}
                key={category.id}
                className="group"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full">
                  <div className="relative aspect-square">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          // Show placeholder if image fails to load
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'w-full h-full';
                            parent.appendChild(placeholder);
                            
                            const root = createRoot(placeholder);
                            root.render(
                              <ImagePlaceholder 
                                category={category.name.toLowerCase()}
                                text={category.name}
                                height="h-full"
                              />
                            );
                          }
                        }}
                      />
                    ) : (
                      <ImagePlaceholder 
                        category={category.name.toLowerCase()}
                        text={category.name}
                        height="h-full"
                      />
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-medium text-jersey-navy group-hover:text-jersey-purple transition-colors">
                      {category.name}
                    </h3>
                    {category.subcategories && (
                      <p className="text-sm text-gray-500 mt-1">
                        {category.subcategories.length} styles
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;
