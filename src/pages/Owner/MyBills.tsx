import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/lib/api/api';
import { Bill, Flat } from '@/types'; // Import Bill interface, Flat, Apartment for populated data
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Receipt, RefreshCw, Download, Eye, AlertCircle, IndianRupee, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

// Define a type for populated bills for frontend display
interface DisplayBill extends Omit<Bill, 'flatId' | 'ownerId'> {
  flatId: Flat; // Flat will be populated
  ownerId: { _id: string; name: string; email: string; }; // Owner will be populated with name and email
  // Add any other populated fields needed for display
}

export default function MyBills() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bills, setBills] = useState<DisplayBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyBills = async () => {
    try {
      setLoading(true);
      const response = await API.get<DisplayBill[]>('/owner/bills');
      setBills(response.data);
    } catch (error: any) {
      console.error('Failed to fetch my bills:', error);
      toast({
        title: 'Error',
        description: `Failed to load bills: ${error.response?.data?.message || error.message}`,
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
    fetchMyBills();
  }, [toast, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyBills();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewBill = (bill: DisplayBill) => {
    // This could navigate to a detailed view or open a modal
    toast({
      title: 'View Bill',
      description: `Viewing details for bill: ${bill.month} - ₹${bill.amount}`,
    });
    // Example: navigate(`/owner/bill-details/${bill._id}`);
  };

  const handleDownloadReceipt = async (receiptId: string) => {
    try {
      const response = await API.get(`/owner/receipts/${receiptId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({
        title: 'Download Successful',
        description: 'Your receipt has been downloaded.',
      });
    } catch (error) {
      console.error('Failed to download receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to download receipt. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Skeleton className="h-16 w-full mb-8" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

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
              <Button variant="ghost" className="text-blue-600 bg-blue-50" onClick={() => navigate('/owner/bills')}>
                <Receipt className="h-4 w-4 mr-1" /> My Bills
              </Button>
              <Button variant="ghost" onClick={() => navigate('/owner/pay')}>
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
            <h1 className="text-3xl font-bold tracking-tight">My Bills</h1>
            <p className="text-muted-foreground">View all your current and past bills.</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bill History</CardTitle>
            <CardDescription>{bills.length} bills found.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {bills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">No bills found.</p>
                  <p className="text-sm">New bills will appear here once generated.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Flat No</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {bill.month ? format(new Date(bill.year, bill.month - 1), 'MMMM yyyy') : '-'}
                        </TableCell>
                        <TableCell>{bill.flatId?.flatNumber || 'N/A'}</TableCell>
                        <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                        <TableCell>{bill.dueDate ? format(new Date(bill.dueDate), 'PPP') : 'N/A'}</TableCell>
                        <TableCell>{bill.paymentDate ? format(new Date(bill.paymentDate), 'PPP') : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bill.status)}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewBill(bill)}
                              aria-label="View Bill"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {bill.receiptId && bill.status === 'Paid' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadReceipt(bill.receiptId)}
                                aria-label="Download Receipt"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            {bill.status === 'Unpaid' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/owner/pay?billId=${bill._id}`)} // Pass bill ID for specific payment
                                aria-label="Pay Now"
                              >
                                <IndianRupee className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 