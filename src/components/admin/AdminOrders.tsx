import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Search } from "lucide-react";

const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "production", label: "In Production" },
  { value: "shipping", label: "Shipping" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
];

const getStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "verified":
      return "bg-blue-100 text-blue-800";
    case "production":
      return "bg-purple-100 text-purple-800";
    case "shipping":
      return "bg-indigo-100 text-indigo-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles:profiles(first_name, last_name),
          address:addresses(city, street)
        `);
        
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
        
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);
        
      if (orderError) throw orderError;
      
      // Add status update record
      const { error: statusError } = await supabase
        .from('status_updates')
        .insert({
          order_id: orderId,
          status: newStatus,
          notes: `Order status updated to ${newStatus}`,
        });
        
      if (statusError) throw statusError;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast({
        title: "Order status updated",
        description: `Order status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error updating order status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchString = searchQuery.toLowerCase();
    const customerName = `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.toLowerCase();
    const orderIdMatch = order.id.toLowerCase().includes(searchString);
    const customerMatch = customerName.includes(searchString);
    const cityMatch = order.address?.city?.toLowerCase().includes(searchString) || false;
    
    return orderIdMatch || customerMatch || cityMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Orders</h2>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search orders by ID, customer, or city..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      {order.profiles?.first_name
                        ? `${order.profiles.first_name} ${order.profiles.last_name}`
                        : "Unknown User"}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeStyles(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>৳{order.total_amount}</TableCell>
                    <TableCell>{order.address?.city || "N/A"}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/orders/${order.id}`} className="cursor-pointer">
                              <Eye size={14} className="mr-2" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          {ORDER_STATUSES.filter(s => s.value !== "all").map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              disabled={order.status === status.value}
                              onClick={() => updateOrderStatus(order.id, status.value)}
                              className="cursor-pointer"
                            >
                              {status.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
