
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentHistoryProps {
  orderId: string;
}

const PaymentHistory = ({ orderId }: PaymentHistoryProps) => {
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentRecords();
  }, [orderId]);

  const fetchPaymentRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_records')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPaymentRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching payment records:', error);
      toast({
        title: "Error loading payment history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500" />
          </div>
        ) : paymentRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRecords.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.created_at)}</TableCell>
                  <TableCell>৳{payment.amount}</TableCell>
                  <TableCell>
                    {payment.method.split('_').map(
                      (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </TableCell>
                  <TableCell>{payment.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No payment records found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
