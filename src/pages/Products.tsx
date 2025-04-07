
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import ProductFilter from '@/components/products/ProductFilter';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

const Products: React.FC = () => {
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortOption, setSortOption] = useState('featured');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the initial category name if categoryId is provided
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      if (!categoryId) return;
      
      try {
        // First decode the categoryId if it's URL encoded
        const decodedCategoryId = decodeURIComponent(categoryId);
        console.log("Decoded category ID/name:", decodedCategoryId);
        
        // Check if categoryId is a UUID (category ID) or string (category name)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedCategoryId);
        
        if (isUuid) {
          const { data, error } = await supabase
            .from('categories')
            .select('name')
            .eq('id', decodedCategoryId)
            .single();
            
          if (error) {
            console.error('Error fetching category by ID:', error);
          } else if (data) {
            console.log("Found category by ID:", data);
            setCategoryName(data.name);
            setSelectedCategory(data.name);
          }
        } else {
          // If it's a string/name, just use it directly
          console.log("Using category name directly:", decodedCategoryId);
          setCategoryName(decodedCategoryId);
          setSelectedCategory(decodedCategoryId);
        }
      } catch (error) {
        console.error('Error fetching category info:', error);
      }
    };
    
    fetchCategoryInfo();
  }, [categoryId]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products from Supabase
        const { data: productsData, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }
        
        if (productsData) {
          console.log("Fetched products:", productsData.length);
          // Transform database products to match our Product type
          const transformedProducts: Product[] = productsData.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            category: product.subcategory || 'uncategorized', // Use subcategory field
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
          
          // Extract unique categories from products
          const uniqueCategories = Array.from(
            new Set(transformedProducts.map(product => product.category))
          );
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...products];
    console.log("Filtering products. Total:", products.length);
    console.log("Selected category:", selectedCategory);
    
    // Filter by category - handle case-insensitive comparison
    if (selectedCategory) {
      result = result.filter(product => {
        if (!product.category && !product.subcategory) return false;
        
        const productCategory = product.category ? product.category.toLowerCase().trim() : '';
        const productSubcategory = product.subcategory ? product.subcategory.toLowerCase().trim() : '';
        const targetCategory = selectedCategory.toLowerCase().trim();
        
        return productCategory === targetCategory || productSubcategory === targetCategory;
      });
      console.log("After category filter:", result.length);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        (product.name && product.name.toLowerCase().includes(query)) || 
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    }
    
    // Filter by price range
    result = result.filter(product => {
      // Use tier1 price for comparison
      const price = product.price.tier1;
      return price >= minPrice && price <= maxPrice;
    });
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price.tier1 - b.price.tier1);
        break;
      case 'price-high':
        result.sort((a, b) => b.price.tier1 - a.price.tier1);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'featured':
      default:
        // Sort by popular first, then by name
        result.sort((a, b) => {
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, sortOption]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Search query is already applied via useEffect
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-8 md:py-12">
        <div className="jersey-container">
          <h1 className="text-3xl font-bold text-jersey-navy mb-6">
            {categoryName 
              ? `${categoryName} Jerseys`
              : selectedCategory
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Jerseys`
                : 'All Products'
            }
          </h1>
          
          <div className="mb-6">
            <form onSubmit={handleSearch} className="max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-jersey-purple focus:border-transparent"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
          
          <ProductFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onSortChange={handleSortChange}
          />
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jersey-purple"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-jersey-navy mb-2">No Products Found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
