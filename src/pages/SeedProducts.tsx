
import React, { useState } from "react";
import { seedProducts } from "@/utils/seed-products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Database } from "lucide-react";

const SeedProducts = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSeedProducts = async () => {
    try {
      setLoading(true);
      await seedProducts();
      toast({
        title: "Products added successfully",
        description: "Demo products have been added to the database",
      });
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
            This will add approximately 60-70 demo products to the database for testing purposes.
            Each product will have appropriate descriptions and images.
          </p>
          <div className="bg-yellow-50 border-yellow-200 border p-3 rounded-md">
            <p className="text-sm text-yellow-800">
              Warning: This is intended for development and testing only.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Cancel
          </Button>
          <Button onClick={handleSeedProducts} disabled={loading}>
            {loading ? "Adding Products..." : "Add Demo Products"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SeedProducts;
