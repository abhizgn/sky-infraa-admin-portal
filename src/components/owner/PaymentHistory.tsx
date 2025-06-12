import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import API from '@/lib/api/api';
import { useToast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Payment {
  _id: string;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  transactionId: string;
  billId: {
    month: string;
    year: number;
  };
}

export function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await API.get('/owner/payments');
        setPayments(response.data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to fetch payment history',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const downloadReceipt = async (paymentId: string) => {
    try {
      const response = await API.get(`/owner/payments/${paymentId}/receipt`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading payment history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Bill Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{format(new Date(payment.paymentDate), 'PPP')}</TableCell>
                <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{payment.paymentMode}</Badge>
                </TableCell>
                <TableCell className="font-mono">{payment.transactionId}</TableCell>
                <TableCell>
                  {payment.billId.month} {payment.billId.year}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadReceipt(payment._id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 