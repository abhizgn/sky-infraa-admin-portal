import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import API from '@/lib/api/api';
import { Arrear } from '@/types'; // Import the Arrear interface
// import { OwnerLayout } from '@/components/owner/OwnerLayout'; // No longer needed
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns'; // For date formatting and parsing
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // For loading states
import { Alert, AlertDescription } from '@/components/ui/alert'; // For error states
import { Home, IndianRupee, AlertCircle, RefreshCw, Receipt, DollarSign, CreditCard } from 'lucide-react'; // Icons

export default function ArrearsOverview() {
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize useNavigate
  const [arrears, setArrears] = useState<Arrear[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArrears = async () => {
    try {
      setLoading(true);
      const response = await API.get<Arrear[]>('/owner/arrears');
      setArrears(response.data);
    } catch (error: any) {
      console.error('Failed to fetch arrears:', error);
      toast({
        title: 'Error',
        description: `Failed to load arrears: ${error.response?.data?.message || error.message}`,
        variant: 'destructive',
      });
      if (error.response?.status === 401) {
        navigate('/login'); // Redirect to login if unauthorized
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrears();
  }, [toast, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchArrears();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-red-100 text-red-800'; // Arrears are usually pending/overdue
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'reminded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMonthsOverdue = (monthString: string): number => {
    try {
      // Assuming monthString is in "YYYY-MM" or "MMMM yyyy" format.
      // If it's "YYYY-MM", we can parse it to the first day of the month.
      // If it's "MMMM yyyy", `parseISO` might not work directly, you might need a more robust parser.
      // For now, assuming "YYYY-MM" or "MMMM yyyy" that date-fns can handle.
      const arrearDate = parseISO(monthString + '-01'); // Append -01 for YYYY-MM
      const today = new Date();
      const diffInMonths = (today.getFullYear() - arrearDate.getFullYear()) * 12 + (today.getMonth() - arrearDate.getMonth());
      return Math.max(0, diffInMonths); // Ensure it's not negative
    } catch (e) {
      console.error("Error calculating overdue months for:", monthString, e);
      return 0;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Skeleton for Navigation Header */}
        <Skeleton className="h-16 w-full mb-8" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <Skeleton className="h-20 w-full" /> {/* Header Section */}
          <Skeleton className="h-40 w-full" /> {/* Summary Card */}
          <Skeleton className="h-64 w-full" /> {/* Arrears Table */}
        </div>
      </div>
    );
  }

  if (!arrears) { // This case should ideally not be reached if loading is handled well
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Owner Portal</h1>
              </div>
              <nav className="flex space-x-6">
                <Button variant="ghost" onClick={() => navigate('/owner/dashboard')}>Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/owner/bills')}>My Bills</Button>
                <Button variant="ghost" onClick={() => navigate('/owner/pay')}>Pay Now</Button>
                <Button variant="ghost" className="text-blue-600 bg-blue-50" onClick={() => navigate('/owner/arrears')}>Arrears</Button>
                <Button variant="ghost" onClick={() => navigate('/owner/settings')}>Settings</Button>
              </nav>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load arrears data. Please try again.
              <Button variant="link" onClick={handleRefresh} className="ml-2">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const totalArrearsAmount = arrears.reduce((sum, arrear) => sum + arrear.amount, 0);
  const totalPendingArrears = arrears.filter(arrear => arrear.status === 'pending' || arrear.status === 'partial').length;

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
              <Button variant="ghost" onClick={() => navigate('/owner/pay')}>
                <DollarSign className="h-4 w-4 mr-1" /> Pay Now
              </Button>
              <Button variant="ghost" className="text-blue-600 bg-blue-50" onClick={() => navigate('/owner/arrears')}>
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
            <h1 className="text-3xl font-bold tracking-tight">Arrears Overview</h1>
            <p className="text-muted-foreground">
              Your comprehensive view of outstanding dues
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-red-600" />
              Your Outstanding Summary
            </CardTitle>
            <CardDescription>Quick glance at your current arrear status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">₹{totalArrearsAmount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Outstanding Arrears</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{totalPendingArrears}</div>
                <div className="text-sm text-muted-foreground">Pending Arrear Records</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arrears Table */}
        <Card>
          <CardHeader>
            <CardTitle>Arrears Details</CardTitle>
            <CardDescription>
              {arrears.length} record(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {arrears.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">🎉 No outstanding arrears at the moment!</p>
                  <p className="text-sm">All your bills are up to date.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Months Overdue</TableHead>
                      <TableHead>Last Reminder Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arrears.map((arrear) => (
                      <TableRow key={arrear._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {arrear.month ? format(parseISO(`${arrear.month}-01`), 'MMMM yyyy') : '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-red-600">
                          ₹{arrear.amount?.toLocaleString() || '0'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(arrear.status)}>
                            {arrear.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={calculateMonthsOverdue(arrear.month) >= 3 ? 'destructive' : 'default'}>
                            {calculateMonthsOverdue(arrear.month)} month(s)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {arrear.lastReminderSentAt
                            ? format(new Date(arrear.lastReminderSentAt), 'PPP')
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/owner/pay?arrearId=${arrear._id}`)}
                            aria-label={`Pay ${arrear.month} arrear`}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
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