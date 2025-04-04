
import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/mockData';
import ImagePlaceholder from '../ui/ImagePlaceholder';

const FeaturedCategories: React.FC = () => {
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link 
              to={`/products/${category.id}`} 
              key={category.id}
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full">
                <div className="relative aspect-square">
                  <ImagePlaceholder 
                    category={category.id}
                    text={category.name}
                    height="h-full"
                  />
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
      </div>
    </section>
  );
};

export default FeaturedCategories;
