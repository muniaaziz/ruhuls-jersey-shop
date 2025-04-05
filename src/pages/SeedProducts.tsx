
import React, { useState } from "react";
import { seedProducts } from "@/utils/seed-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Database, Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SeedProducts = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} /> Seed Products
          </CardTitle>
          <CardDescription>
            Add demo products to the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            This will add more than 60 demo products to the database for testing purposes.
            Each product will have appropriate descriptions and images.
          </p>
          
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
              Warning: This is intended for development and testing only.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/admin")} disabled={loading}>
            Cancel
          </Button>
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
        </CardFooter>
      </Card>
    </div>
  );
};

export default SeedProducts;
