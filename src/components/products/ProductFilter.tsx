
import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onSortChange: (sort: string) => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onPriceRangeChange,
  onSortChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortOption, setSortOption] = useState('featured');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const availableFeatures = [
    'Name Printing',
    'Number Printing',
    'Logo Placement',
    'Custom Design'
  ];

  const handlePriceChange = () => {
    onPriceRangeChange(minPrice, maxPrice);
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
    onSortChange(option);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFeatureChange = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-jersey-navy">Filter Products</h2>
        <Button 
          variant="outline"
          className="md:hidden flex items-center gap-2"
          onClick={toggleFilter}
        >
          <Filter size={18} />
          Filters
          <ChevronDown size={16} className={isFilterOpen ? "transform rotate-180" : ""} />
        </Button>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${isFilterOpen ? 'block' : 'hidden md:grid'}`}>
        {/* Categories */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3 text-jersey-navy">Categories</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <div 
              className={`cursor-pointer flex items-center ${selectedCategory === null ? 'text-jersey-purple font-medium' : 'text-gray-600'}`}
              onClick={() => onCategoryChange(null)}
            >
              {selectedCategory === null && <Check size={16} className="mr-2 flex-shrink-0" />}
              <span>All Products</span>
            </div>
            {categories.map((category) => (
              <div 
                key={category}
                className={`cursor-pointer flex items-center ${selectedCategory === category ? 'text-jersey-purple font-medium' : 'text-gray-600'}`}
                onClick={() => onCategoryChange(category)}
              >
                {selectedCategory === category && <Check size={16} className="mr-2 flex-shrink-0" />}
                <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3 text-jersey-navy">Price Range</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">৳{minPrice}</span>
              <span className="text-sm text-gray-500">৳{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              value={minPrice}
              onChange={(e) => setMinPrice(parseInt(e.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min="1000"
              max="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full"
            />
            <Button
              variant="outline" 
              className="w-full mt-2"
              onClick={handlePriceChange}
            >
              Apply Price Filter
            </Button>
          </div>
        </div>

        {/* Sort By */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3 text-jersey-navy">Sort By</h3>
          <div className="space-y-2">
            {[
              { value: 'featured', label: 'Featured' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'name-asc', label: 'Name: A to Z' },
              { value: 'name-desc', label: 'Name: Z to A' }
            ].map((option) => (
              <div 
                key={option.value}
                className={`cursor-pointer flex items-center ${sortOption === option.value ? 'text-jersey-purple font-medium' : 'text-gray-600'}`}
                onClick={() => handleSortChange(option.value)}
              >
                {sortOption === option.value && <Check size={16} className="mr-2 flex-shrink-0" />}
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Filter & Features */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3 text-jersey-navy">Popular Products</h3>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <Checkbox 
                checked={showPopularOnly}
                onCheckedChange={() => setShowPopularOnly(!showPopularOnly)}
                className="text-jersey-purple focus:ring-jersey-purple"
              />
              <span className="ml-2">Show Popular Only</span>
            </label>
          </div>
          <div className="mt-6">
            <h3 className="font-medium mb-3 text-jersey-navy">Features</h3>
            <div className="space-y-2">
              {availableFeatures.map(feature => (
                <label key={feature} className="flex items-center cursor-pointer">
                  <Checkbox 
                    checked={selectedFeatures.includes(feature)}
                    onCheckedChange={() => handleFeatureChange(feature)}
                    className="text-jersey-purple focus:ring-jersey-purple"
                  />
                  <span className="ml-2">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
