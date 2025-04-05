
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Pencil, Trash2, Search, Tag, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<null | { id: string; name: string }>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image_url: "",
    subcategories: [] as string[]
  });
  const [newSubcategory, setNewSubcategory] = useState("");
  const [editNewSubcategory, setEditNewSubcategory] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) {
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
            image_url: newCategory.image_url.trim() || null,
            subcategories: newCategory.subcategories
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Category added",
        description: `${newCategory.name} has been added successfully.`
      });
      
      setCategories([...(data || []), ...categories]);
      setIsAddDialogOpen(false);
      setNewCategory({ name: "", image_url: "", subcategories: [] });
      fetchCategories();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error adding category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = async () => {
    if (!categoryToEdit || !categoryToEdit.name) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          name: categoryToEdit.name.trim(),
          image_url: categoryToEdit.image_url?.trim() || null,
          subcategories: categoryToEdit.subcategories || []
        })
        .eq('id', categoryToEdit.id);

      if (error) throw error;
      
      toast({
        title: "Category updated",
        description: `${categoryToEdit.name} has been updated successfully.`
      });
      
      setCategories(categories.map(cat => 
        cat.id === categoryToEdit.id ? categoryToEdit : cat
      ));
      setIsEditDialogOpen(false);
      setCategoryToEdit(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (error) throw error;
      
      toast({
        title: "Category deleted",
        description: `${categoryToDelete.name} has been deleted successfully.`
      });
      
      setCategories(categories.filter(category => category.id !== categoryToDelete.id));
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const confirmDelete = (category: { id: string; name: string }) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (category: any) => {
    setCategoryToEdit({
      ...category,
      subcategories: category.subcategories || []
    });
    setIsEditDialogOpen(true);
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

  const addEditSubcategory = () => {
    if (!editNewSubcategory.trim() || !categoryToEdit) return;
    
    const updatedSubcategories = [...(categoryToEdit.subcategories || []), editNewSubcategory.trim()];
    setCategoryToEdit({
      ...categoryToEdit,
      subcategories: updatedSubcategories
    });
    
    setEditNewSubcategory("");
  };

  const removeEditSubcategory = (index: number) => {
    if (!categoryToEdit) return;
    
    const updatedSubcategories = [...categoryToEdit.subcategories];
    updatedSubcategories.splice(index, 1);
    setCategoryToEdit({ ...categoryToEdit, subcategories: updatedSubcategories });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Categories</h2>
        <Button className="flex items-center" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle size={16} className="mr-2" />
          Add New Category
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jersey-purple"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Image URL</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{category.image_url || 'No image'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {category.subcategories && category.subcategories.length > 0 ? (
                          category.subcategories.map((subcat: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {subcat}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No subcategories</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => confirmDelete(category)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Add a new product category to your store.
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
                placeholder="https://example.com/image.jpg"
              />
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
                Subcategories help organize products and improve navigation for customers.
                You can add, edit, or remove subcategories later.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update category information.
            </DialogDescription>
          </DialogHeader>
          {categoryToEdit && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Category Name*</Label>
                <Input
                  id="edit-name"
                  value={categoryToEdit.name}
                  onChange={(e) => setCategoryToEdit({...categoryToEdit, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={categoryToEdit.image_url || ''}
                  onChange={(e) => setCategoryToEdit({...categoryToEdit, image_url: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subcategories">Subcategories</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit-subcategories"
                    value={editNewSubcategory}
                    onChange={(e) => setEditNewSubcategory(e.target.value)}
                    placeholder="e.g., Club Jerseys"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEditSubcategory();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={addEditSubcategory}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Press Enter to add a subcategory
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {categoryToEdit.subcategories && categoryToEdit.subcategories.map((subcategory: string, index: number) => (
                    <Badge key={index} variant="secondary" className="pr-1 flex items-center gap-1">
                      <Tag size={12} />
                      {subcategory}
                      <button 
                        onClick={() => removeEditSubcategory(index)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Adding or removing subcategories will affect product filtering and navigation.
                  Products with removed subcategories will still exist, but may need to be recategorized.
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
