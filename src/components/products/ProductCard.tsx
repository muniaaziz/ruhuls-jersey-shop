
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import { createRoot } from 'react-dom/client';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg h-full flex flex-col">
        <div className="relative">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-64 object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loops
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'w-full h-64';
                  parent.appendChild(placeholder);
                  
                  // Render placeholder inside the new div using createRoot from react-dom/client
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
            {product.description.substring(0, 80)}
            {product.description.length > 80 ? "..." : ""}
          </p>
          <div className="flex flex-col mt-auto">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Bulk Pricing (per piece):</p>
              <div className="flex justify-between mt-1">
                <span>10-100: ৳{product.price?.tier1 ?? 0}</span>
                <span>101+: ৳{product.price?.tier2 ?? 0}+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
