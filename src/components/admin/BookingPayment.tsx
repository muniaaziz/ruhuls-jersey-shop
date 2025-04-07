
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookingPaymentProps {
  orderId: string;
  orderTotal: number;
  currentBookingAmount: number;
  onBookingUpdated: () => void;
}

const BookingPayment = ({ orderId, orderTotal, currentBookingAmount, onBookingUpdated }: BookingPaymentProps) => {
  const [bookingAmount, setBookingAmount] = useState<string>(currentBookingAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleBookingPayment = async () => {
    const amount = parseInt(bookingAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid booking amount",
        variant: "destructive",
      });
      return;
    }

    if (amount > orderTotal) {
      toast({
        title: "Amount too high",
        description: "Booking amount cannot be higher than the order total",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update the order with the new booking amount
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          booking_amount: amount,
          paid_amount: amount, // Set paid amount equal to booking amount
          payment_status: amount === orderTotal ? 'fully_paid' : 'partially_paid',
          status: 'verified', // Automatically verify the order when booking payment is received
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // 2. Create a payment record
      const { error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          order_id: orderId,
          amount: amount,
          method: paymentMethod,
          notes: `Booking payment: ${notes}`
        });

      if (paymentError) throw paymentError;

      // 3. Add a status update
      const { error: statusError } = await supabase
        .from('status_updates')
        .insert({
          order_id: orderId,
          status: 'verified',
          notes: `Order verified with booking payment of ৳${amount}`
        });

      if (statusError) throw statusError;

      toast({
        title: "Booking payment recorded",
        description: `Booking payment of ৳${amount} has been recorded and order verified`,
      });

      // 4. Notify parent component to refresh data
      onBookingUpdated();

    } catch (error: any) {
      console.error('Error recording booking payment:', error);
      toast({
        title: "Error recording payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Booking Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="bookingAmount" className="text-sm font-medium">Booking Amount</label>
          <Input
            id="bookingAmount"
            type="number"
            value={bookingAmount}
            onChange={(e) => setBookingAmount(e.target.value)}
            placeholder="Enter booking amount"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleBookingPayment}
          disabled={isSubmitting || parseInt(bookingAmount) <= 0}
          className="w-full"
        >
          {isSubmitting ? "Processing..." : "Record Booking Payment"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookingPayment;
