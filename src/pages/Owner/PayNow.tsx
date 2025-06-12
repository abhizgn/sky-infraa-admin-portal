import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '@/lib/api/api';
import { Bill } from '@/types'; // Import Bill interface
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, DollarSign, RefreshCw, AlertCircle, Receipt } from 'lucide-react';
import { format } from 'date-fns';

// Declare Razorpay globally to avoid TypeScript errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayNow() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBillId = searchParams.get('billId');

  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchUnpaidBills = async () => {
    try {
      setLoading(true);
      const params: any = { status: 'Unpaid' };
      if (preselectedBillId) {
        params.billId = preselectedBillId; // Fetch specific bill if ID is in params
      }
      const response = await API.get<Bill[]>('/owner/bills', { params });
      setUnpaidBills(response.data);

      const calculatedTotal = response.data.reduce((acc, b) => acc + b.amount, 0);
      setTotalAmount(calculatedTotal);

      // If a preselected bill was passed and it's not found, maybe show an alert
      if (preselectedBillId && response.data.length === 0) {
        toast({
          title: 'Info',
          description: 'The specified bill is not found or already paid.',
          variant: 'default',
        });
      }

    } catch (error: any) {
      console.error('Failed to fetch unpaid bills:', error);
      toast({
        title: 'Error',
        description: `Failed to load unpaid bills: ${error.response?.data?.message || error.message}`,
        variant: 'destructive',
      });
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaidBills();
  }, [toast, navigate, preselectedBillId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUnpaidBills();
    setRefreshing(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (totalAmount <= 0 || unpaidBills.length === 0) {
      toast({
        title: 'Info',
        description: 'No outstanding bills to pay.',
        variant: 'default',
      });
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast({
        title: 'Payment Error',
        description: 'Failed to load Razorpay script. Please check your internet connection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Step 1: Create order on backend
      const orderResponse = await API.post('/owner/create-payment-order', {
        amount: totalAmount,
        billIds: unpaidBills.map(bill => bill._id), // Pass bill IDs to backend
      });

      const { orderId, currency, amount, key, ownerName, ownerEmail, ownerPhone } = orderResponse.data;

      const options = {
        key: key, // Your Razorpay Key ID
        amount: amount, // Amount in paise
        currency: currency,
        name: 'Sky Infraa',
        description: `Payment for flat bills`,
        order_id: orderId, // This is the order ID obtained from the backend
        handler: async (response: any) => {
          try {
            // Step 2: Verify payment on backend
            await API.post('/owner/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              billIds: unpaidBills.map(bill => bill._id), // Send bill IDs for marking as paid
            });
            toast({
              title: 'Payment Successful',
              description: 'Your bills have been marked as paid.',
              variant: 'success',
            });
            fetchUnpaidBills(); // Refresh list
            navigate('/owner/bills'); // Navigate to My Bills page
          } catch (error: any) {
            console.error('Payment verification failed:', error);
            toast({
              title: 'Payment Failed',
              description: `Verification failed: ${error.response?.data?.message || error.message}`,
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: ownerName,
          email: ownerEmail,
          contact: ownerPhone,
        },
        notes: {
          'address': 'Sky Infraa Office',
        },
        theme: {
          'color': '#3B82F6' // Primary color
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast({
        title: 'Payment Error',
        description: `Failed to initiate payment: ${error.response?.data?.message || error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Owner Portal</h1>
            </div>
            <nav className="flex space-x-6">
              <Button variant="ghost" onClick={() => navigate('/owner/dashboard')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/bills')}>
                <Receipt className="h-4 w-4 mr-1" /> My Bills
              </Button>
              <Button variant="ghost" className="text-blue-600 bg-blue-50" onClick={() => navigate('/owner/pay')}>
                <DollarSign className="h-4 w-4 mr-1" /> Pay Now
              </Button>
              <Button variant="ghost" onClick={() => navigate('/owner/arrears')}>
                <AlertCircle className="h-4 w-4 mr-1" /> Arrears
              </Button>
              <Button variant="ghost" onClick={() => navigate('/owner/settings')}>Settings</Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">Pay Now</h1>
            <p className="text-muted-foreground">Manage your outstanding payments.</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card className="max-w-md mx-auto">
              <CardHeader>
            <CardTitle>Outstanding Bills</CardTitle>
            <CardDescription>Select bills to pay or pay all outstanding.</CardDescription>
              </CardHeader>
              <CardContent>
            {loading ? (
                <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-2/3" />
                          </div>
            ) : unpaidBills.length === 0 ? (
                    <Alert>
                <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                  You have no outstanding bills. Everything is paid up! 🎉
                      </AlertDescription>
                    </Alert>
                    ) : (
                      <>
                <ul className="mb-4 space-y-2">
                  {unpaidBills.map((bill) => (
                    <li key={bill._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md shadow-sm">
                      <span className="font-medium">
                        {bill.month ? format(new Date(bill.year, bill.month - 1), 'MMMM yyyy') : '-'} - Flat {bill.flatId?.flatNumber || 'N/A'}
                      </span>
                      <span className="font-semibold text-lg">₹{bill.amount.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
                <div className="font-bold text-xl mb-4 flex justify-between items-center border-t pt-4 mt-4">
                  <span>Total Amount Due:</span>
                  <span className="text-red-600">₹{totalAmount.toLocaleString()}</span>
                </div>
                <Button className="w-full text-lg py-6" onClick={handlePay} disabled={totalAmount === 0}>
                  Proceed to Pay
                </Button>
              </>
            )}
              </CardContent>
            </Card>
          </div>
    </div>
  );
}
