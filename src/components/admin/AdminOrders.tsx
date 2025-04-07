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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, Search, DollarSign } from "lucide-react";

const ORDER_STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "production", label: "In Production" },
  { value: "shipping", label: "Shipping" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
];

const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "fully_paid", label: "Fully Paid" },
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

const getPaymentStatusBadgeStyles = (status: string) => {
  switch (status) {
    case "unpaid":
      return "bg-red-100 text-red-800";
    case "partially_paid":
      return "bg-amber-100 text-amber-800";
    case "fully_paid":
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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentNotes, setPaymentNotes] = useState<string>("");
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
      // First try using direct update
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);
        
      if (orderError) {
        console.error('Direct update failed, trying edge function:', orderError);
        // If direct update fails due to RLS, try edge function
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) throw new Error("User not authenticated");
        
        const { data, error } = await supabase.functions.invoke('update-order-status', {
          body: { 
            orderId, 
            status: newStatus,
            notes: `Order status updated to ${newStatus}`
          }
        });
        
        if (error) throw error;
      }
      
      // Add status update record directly (may need separate RLS policy)
      const { error: statusError } = await supabase
        .from('status_updates')
        .insert({
          order_id: orderId,
          status: newStatus,
          notes: `Order status updated to ${newStatus}`,
        });
      
      if (statusError) {
        console.error('Status update insert error:', statusError);
        // Continue even if this fails, as the order status was updated
      }
      
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

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);
        
      if (orderError) throw orderError;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, payment_status: newStatus } : order
      ));
      
      toast({
        title: "Payment status updated",
        description: `Payment status has been updated to ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error updating payment status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openPaymentDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setPaymentAmount("");
    setPaymentMethod("cash");
    setPaymentNotes("");
    setIsPaymentDialogOpen(true);
  };

  const recordPayment = async () => {
    if (!selectedOrderId || !paymentAmount) return;
    
    const amount = parseInt(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid payment amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Get current order details
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('paid_amount, total_amount')
        .eq('id', selectedOrderId)
        .single();
        
      if (orderFetchError) throw orderFetchError;
      
      // 2. Calculate new paid amount
      const newPaidAmount = (orderData.paid_amount || 0) + amount;
      const totalAmount = orderData.total_amount;
      
      // 3. Determine new payment status
      let newPaymentStatus = 'partially_paid';
      if (newPaidAmount >= totalAmount) {
        newPaymentStatus = 'fully_paid';
      } else if (newPaidAmount <= 0) {
        newPaymentStatus = 'unpaid';
      }
      
      // 4. Update order
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({ 
          paid_amount: newPaidAmount,
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrderId)
        .select();
        
      if (updateError) throw updateError;
      
      // 5. Record payment
      const { error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          order_id: selectedOrderId,
          amount: amount,
          method: paymentMethod,
          notes: paymentNotes
        });
        
      if (paymentError) throw paymentError;
      
      // 6. Update local state immediately (no need to wait for a refresh)
      setOrders(orders.map(order => 
        order.id === selectedOrderId 
          ? { 
              ...order, 
              paid_amount: newPaidAmount, 
              payment_status: newPaymentStatus 
            } 
          : order
      ));
      
      toast({
        title: "Payment recorded",
        description: `Payment of ৳${amount} has been recorded`,
      });
      
      // 7. Close dialog
      setIsPaymentDialogOpen(false);
      
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error recording payment",
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
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
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
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusBadgeStyles(order.payment_status)}`}>
                        {order.payment_status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </TableCell>
                    <TableCell>৳{order.total_amount}</TableCell>
                    <TableCell>৳{order.paid_amount}</TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/orders/${order.id}`} className="cursor-pointer">
                              <Eye size={14} className="mr-2" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPaymentDialog(order.id)} className="cursor-pointer">
                            <DollarSign size={14} className="mr-2" /> Record Payment
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
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Payment Status</DropdownMenuLabel>
                          {PAYMENT_STATUSES.map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              disabled={order.payment_status === status.value}
                              onClick={() => updatePaymentStatus(order.id, status.value)}
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
                  <TableCell colSpan={9} className="text-center py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter payment details for order #{selectedOrderId?.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="amount" className="text-right">Amount</label>
              <Input
                id="amount"
                type="number"
                className="col-span-3"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="method" className="text-right">Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="notes" className="text-right">Notes</label>
              <Input
                id="notes"
                className="col-span-3"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Payment notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={recordPayment}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
