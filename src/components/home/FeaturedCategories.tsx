
import React from "react";
import { Link } from "react-router-dom";
import { categories } from "@/data/mockData";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

const FeaturedCategories = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Categories</h2>
        <p className="text-gray-600 text-center mb-10">
          Explore our wide range of jersey categories
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group block"
            >
              <div className="rounded-lg overflow-hidden h-40 sm:h-48 bg-gray-100 relative">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <ImagePlaceholder 
                    width="w-full" 
                    height="h-full" 
                    category={category.name}
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity group-hover:bg-opacity-10" />
              </div>
              <h3 className="mt-3 text-center font-medium">{category.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
