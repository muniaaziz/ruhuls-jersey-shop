
import React from 'react';
import { Link } from 'react-router-dom';
import { featuredProducts } from '@/data/mockData';
import ImagePlaceholder from '../ui/ImagePlaceholder';

const FeaturedProducts: React.FC = () => {
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.slice(0, 6).map((product) => (
            <Link 
              to={`/products/${product.id}`}
              key={product.id}
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                <div className="relative">
                  <ImagePlaceholder 
                    category={product.category}
                    text={product.name}
                    height="h-64"
                  />
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
