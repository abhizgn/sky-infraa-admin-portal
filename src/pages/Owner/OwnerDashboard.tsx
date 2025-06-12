import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '@/lib/api/api';
import { Owner, RecentBill, MonthlyPayment, ExpenseBreakdownItem, Arrear } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, 
  IndianRupee, 
  AlertCircle,
  CreditCard,
  TrendingUp,
  Download,
  Eye,
  RefreshCw,
  Home,
  DollarSign,
  Receipt
} from 'lucide-react';
import { format, isAfter, addDays } from 'date-fns';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OwnerDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOwnerDashboardData = async () => {
    try {
      setLoading(true);
      const response = await API.get<Owner>('/owner/dashboard');
      setOwnerData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch owner dashboard data:', error);
      toast({
        title: 'Error',
        description: `Failed to load dashboard: ${error.response?.data?.message || error.message}`,
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
    fetchOwnerDashboardData();
  }, [toast, navigate]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOwnerDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    if (isAfter(today, due)) return 'Overdue';
    if (isAfter(addDays(due, -7), today)) return 'Pending';
    return 'Paid';
  };

  const handleViewBill = (bill: RecentBill) => {
    console.log('View bill:', bill);
    toast({
      title: 'View Bill',
      description: `Viewing details for bill: ${bill.month} - ₹${bill.amount}`,
    });
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
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!ownerData) {
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
                <Button variant="ghost" className="text-blue-600 bg-blue-50" onClick={() => navigate('/owner/dashboard')}>Dashboard</Button>
                <Button variant="ghost" onClick={() => navigate('/owner/bills')}>My Bills</Button>
                <Button variant="ghost" onClick={() => navigate('/owner/pay')}>Pay Now</Button>
                <Button variant="ghost" onClick={() => navigate('/owner/arrears')}>Arrears</Button>
                <Button variant="ghost" onClick={() => navigate('/owner/settings')}>Settings</Button>
              </nav>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load owner data. Please try again.
              <Button variant="link" onClick={handleRefresh} className="ml-2">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const displayedMonthlyPayments = ownerData.monthlyPayments || [];
  const displayedExpenseBreakdown = ownerData.expenseBreakdown || [];
  const displayedRecentBills = ownerData.recentBills || [];
  const displayedArrears = ownerData.arrears || [];

  const earliestUnpaidBill = displayedRecentBills.find(bill => getDueStatus(bill.dueDate) !== 'Paid');
  const alertDueDate = earliestUnpaidBill ? format(new Date(earliestUnpaidBill.dueDate), 'PPP') : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Owner Portal</h1>
            </div>
            <nav className="flex space-x-6">
              <Button variant="ghost" className="text-blue-600 bg-blue-50" onClick={() => navigate('/owner/dashboard')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/bills')}>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {ownerData.name}!</h1>
            <p className="text-muted-foreground mt-1">
              {ownerData.flat ? `Managing flat: ${ownerData.flat.flatNumber}` : 'No flat assigned'}
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {ownerData.currentDue && ownerData.currentDue > 0 && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have outstanding dues of ₹{ownerData.currentDue.toLocaleString()}. 
              <Button variant="link" className="p-0 h-auto ml-2 text-red-700 underline" onClick={() => navigate('/owner/pay')}>
                Pay Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Outstanding Dues</span>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              {ownerData.currentDue && ownerData.currentDue > 0 ? (
                <CardDescription>Due by {alertDueDate}</CardDescription>
              ) : (
                <CardDescription>No outstanding dues</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-4">
                ₹{(ownerData.currentDue ?? 0).toLocaleString()}
              </div>
              <Button className="w-full" size="lg" onClick={() => navigate('/owner/pay')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Quick Pay Now
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                Flat Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ownerData.flat ? (
                <>
                  <div className="text-2xl font-bold mb-2">{ownerData.flat.flatNumber}</div>
                  <p className="text-gray-600">
                    {ownerData.flat.apartment?.name || 'N/A'}
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{ownerData.flat.type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Area:</span>
                      <span>{ownerData.flat.areaSqft ? `${ownerData.flat.areaSqft} sq.ft` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maintenance:</span>
                      <span>₹{ownerData.flat.maintenanceCharge?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-lg text-muted-foreground">No flat assigned</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                6-Month Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={displayedMonthlyPayments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: any) => [`₹${(value as number).toLocaleString()}`, 'Amount']}
                    labelFormatter={(label: any) => `Month: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bills" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bills">Recent Bills</TabsTrigger>
            <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
            <TabsTrigger value="arrears">Arrears</TabsTrigger>
          </TabsList>

          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bills</CardTitle>
                <CardDescription>Last 3 months billing history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedRecentBills.length > 0 ? (
                      displayedRecentBills.map((bill: RecentBill, index: number) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{bill.month}</TableCell>
                          <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                          <TableCell>{format(new Date(bill.dueDate), 'PPP')}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(getDueStatus(bill.dueDate))}>
                              {getDueStatus(bill.dueDate)}
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
                              {bill.receiptId && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDownloadReceipt(bill.receiptId!)}
                                  aria-label="Download Receipt"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No recent bills found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Current Bill Breakdown</CardTitle>
                <CardDescription>{ownerData.month || format(new Date(), 'MMMM yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={displayedExpenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {displayedExpenseBreakdown.map((entry: ExpenseBreakdownItem, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `₹${(value as number).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {displayedExpenseBreakdown.length > 0 ? (
                      displayedExpenseBreakdown.map((item: ExpenseBreakdownItem, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="text-lg font-semibold">₹{item.value.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No expense breakdown data for this month.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arrears">
            <Card>
              <CardHeader>
                <CardTitle>Arrears History</CardTitle>
                <CardDescription>Track your payment history and arrears</CardDescription>
              </CardHeader>
              <CardContent>
                {displayedArrears.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Reminder</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedArrears.map((arrear: Arrear) => (
                        <TableRow key={arrear._id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{arrear.month}</TableCell>
                          <TableCell>₹{arrear.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(arrear.status)}>
                              {arrear.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {arrear.lastReminderSentAt 
                              ? format(new Date(arrear.lastReminderSentAt), 'PPP')
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/owner/pay?arrearId=${arrear._id}`)}
                              aria-label="Pay Arrear"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No outstanding arrears.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 