
import React, { useState, useEffect } from "react";
import { seedProducts } from "@/utils/seed-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Database, Loader, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Tag } from "lucide-react";

const SeedProducts = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [isCheckingCategories, setIsCheckingCategories] = useState(true);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", image_url: "", subcategories: [] as string[] });
  const [newSubcategory, setNewSubcategory] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkCategories();
  }, []);

  const checkCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      
      setCategories(data || []);
      setIsCheckingCategories(false);
    } catch (error: any) {
      console.error("Error checking categories:", error);
      toast({
        title: "Error checking categories",
        description: error.message,
        variant: "destructive",
      });
      setIsCheckingCategories(false);
    }
  };

  const addSubcategory = () => {
    if (!newSubcategory.trim()) return;
    
    setNewCategory({
      ...newCategory,
      subcategories: [...newCategory.subcategories, newSubcategory.trim()]
    });
    
    setNewSubcategory("");
  };

  const removeSubcategory = (index: number) => {
    const updatedSubcategories = [...newCategory.subcategories];
    updatedSubcategories.splice(index, 1);
    setNewCategory({ ...newCategory, subcategories: updatedSubcategories });
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([
          { 
            name: newCategory.name.trim(),
            image_url: newCategory.image_url.trim() || `https://picsum.photos/400/300?random=${Math.random()}`,
            subcategories: newCategory.subcategories
          }
        ])
        .select();

      if (error) throw error;
      
      setCategories([...categories, ...(data || [])]);
      setNewCategory({ name: "", image_url: "", subcategories: [] });
      setIsAddCategoryDialogOpen(false);
      
      toast({
        title: "Category added",
        description: `${newCategory.name} has been added successfully.`,
      });
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error adding category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSeedProducts = async () => {
    try {
      setLoading(true);
      setProgress(0);

      // Set up progress callback
      const updateProgress = (value: number) => {
        setProgress(value);
      };

      await seedProducts(updateProgress);
      
      toast({
        title: "Products added successfully",
        description: "Demo products have been added to the database",
      });
      
      // Navigate to admin products page after successful seeding
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
      
    } catch (error: any) {
      console.error("Error seeding products:", error);
      toast({
        title: "Error adding products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} /> Seed Products
          </CardTitle>
          <CardDescription>
            Add demo products to the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCheckingCategories ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jersey-purple"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-yellow-50 border-yellow-200 border p-4 rounded-md mb-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                No categories found in database
              </p>
              <p className="text-sm text-yellow-700 mb-3">
                You need to create at least one category before seeding products.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white"
                onClick={() => setIsAddCategoryDialogOpen(true)}
              >
                <Plus size={14} className="mr-1" /> Create Category
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                This will add more than 60 demo products to the database for testing purposes.
                Each product will have appropriate descriptions and images from picsum.photos.
              </p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Available Categories:</h3>
                <div className="flex flex-wrap gap-1">
                  {categories.map((category) => (
                    <Badge key={category.id} variant="outline">
                      {category.name} {category.subcategories?.length > 0 && `(${category.subcategories.length} subcategories)`}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {loading && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Adding products...</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <div className="bg-yellow-50 border-yellow-200 border p-3 rounded-md">
                <p className="text-sm text-yellow-800">
                  Warning: This will replace any existing products. This action is intended for development and testing only.
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/admin")} disabled={loading}>
            Cancel
          </Button>
          {categories.length > 0 && (
            <Button onClick={handleSeedProducts} disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <Loader size={16} className="mr-2 animate-spin" />
                  Adding Products...
                </span>
              ) : (
                "Add Demo Products"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Add a new product category before seeding products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name*</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder="e.g., Football Jerseys"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={newCategory.image_url}
                onChange={(e) => setNewCategory({...newCategory, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg (optional)"
              />
              <span className="text-xs text-gray-500">
                Leave empty to use a random image from picsum.photos
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subcategories">Subcategories</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subcategories"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="e.g., Club Jerseys"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubcategory();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline" 
                  onClick={addSubcategory}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Press Enter to add a subcategory
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {newCategory.subcategories.map((subcategory, index) => (
                  <Badge key={index} variant="secondary" className="pr-1 flex items-center gap-1">
                    <Tag size={12} />
                    {subcategory}
                    <button 
                      onClick={() => removeSubcategory(index)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-1"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Adding subcategories helps organize products. You can add, edit, or remove them later from the Categories section.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeedProducts;
