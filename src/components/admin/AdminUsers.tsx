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
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, MoreHorizontal, Search, UserPlus, Shield, ShieldOff } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Get all user_roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;
      
      // Map and add isAdmin property
      const usersWithRoles = profilesData?.map(profile => {
        const userRoles = rolesData?.filter(role => role.user_id === profile.id) || [];
        return {
          ...profile,
          isAdmin: userRoles.some(role => role.role === 'admin')
        };
      }) || [];
      
      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRoleChange = async () => {
    if (!selectedUser) return;
    
    try {
      if (isAdmin) {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.id,
            role: 'admin'
          });
          
        if (error) throw error;
        
        toast({
          title: "Admin rights granted",
          description: `Admin rights have been granted to ${selectedUser.first_name || 'the user'}.`,
        });
      } else {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('role', 'admin');
          
        if (error) throw error;
        
        toast({
          title: "Admin rights removed",
          description: `Admin rights have been removed from ${selectedUser.first_name || 'the user'}.`,
        });
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, isAdmin } : user
      ));
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error updating user role",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdminDialogOpen(false);
    }
  };

  const openAdminDialog = (user: any, makeAdmin: boolean) => {
    setSelectedUser(user);
    setIsAdmin(makeAdmin);
    setAdminDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const searchString = searchQuery.toLowerCase();
    const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    
    return name.includes(searchString) || email.includes(searchString);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Users</h2>
        <Button>
          <UserPlus size={16} className="mr-2" /> Invite User
        </Button>
      </div>

      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search users..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <User size={14} className="text-gray-500" />
                        </div>
                        {user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Unnamed User'}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'Not provided'}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.isAdmin ? (
                            <DropdownMenuItem 
                              onClick={() => openAdminDialog(user, false)}
                              className="text-red-600 focus:text-red-600 cursor-pointer"
                            >
                              <ShieldOff size={14} className="mr-2" /> Remove Admin Rights
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => openAdminDialog(user, true)}
                              className="text-purple-600 focus:text-purple-600 cursor-pointer"
                            >
                              <Shield size={14} className="mr-2" /> Make Admin
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Admin Role Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAdmin ? "Grant Admin Rights" : "Remove Admin Rights"}
            </DialogTitle>
            <DialogDescription>
              {isAdmin
                ? `Are you sure you want to make ${selectedUser?.first_name || 'this user'} an admin? They will have full access to manage the store.`
                : `Are you sure you want to remove admin rights from ${selectedUser?.first_name || 'this user'}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant={isAdmin ? "default" : "destructive"} onClick={handleAdminRoleChange}>
              {isAdmin ? "Grant Admin Access" : "Remove Admin Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
