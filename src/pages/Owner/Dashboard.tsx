
// import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Home, 
  Bell, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const OwnerDashboard = () => {
  // Mock data - in real app this would come from API
  const ownerData = {
    name: "Rajesh Kumar",
    flats: ["A-101", "B-205"],
    currentDue: 8500,
    dueDate: "2025-01-15",
    lastPaymentDate: "2024-12-10",
    lastPaymentAmount: 7500,
    arrears: 2500,
    hasReminders: true
  };

  const monthlyPayments = [
    { month: 'Jul', amount: 7500 },
    { month: 'Aug', amount: 7800 },
    { month: 'Sep', amount: 7500 },
    { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 7600 },
    { month: 'Dec', amount: 7500 }
  ];

  const expenseBreakdown = [
    { name: 'Maintenance', value: 5000, color: '#3b82f6' },
    { name: 'Electricity', value: 2000, color: '#10b981' },
    { name: 'Water', value: 800, color: '#f59e0b' },
    { name: 'Security', value: 700, color: '#8b5cf6' }
  ];

  const recentBills = [
    { month: 'December 2024', amount: 7500, status: 'Paid', dueDate: '2024-12-15', receiptId: 'RCP001' },
    { month: 'November 2024', amount: 7600, status: 'Paid', dueDate: '2024-11-15', receiptId: 'RCP002' },
    { month: 'October 2024', amount: 7500, status: 'Overdue', dueDate: '2024-10-15', receiptId: null }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueSeverity = () => {
    const daysUntilDue = Math.ceil((new Date(ownerData.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'normal';
  };

  const severity = getDueSeverity();

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
              <Button variant="ghost" className="text-blue-600 bg-blue-50">Dashboard</Button>
              <Button variant="ghost">My Bills</Button>
              <Button variant="ghost">Pay Now</Button>
              <Button variant="ghost">Arrears</Button>
              <Button variant="ghost">Settings</Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Widget */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 animate-fade-in">
            Welcome back, {ownerData.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            Managing flats: {ownerData.flats.join(', ')}
          </p>
        </div>

        {/* Alerts Section */}
        {(ownerData.hasReminders || ownerData.arrears > 0) && (
          <div className="mb-6 space-y-3">
            {ownerData.arrears > 0 && (
              <Alert className="border-red-200 bg-red-50 animate-pulse">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  You have outstanding arrears of ₹{ownerData.arrears.toLocaleString()}. 
                  <Button variant="link" className="p-0 h-auto ml-2 text-red-700 underline">
                    View Details
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {severity === 'overdue' && (
              <Alert className="border-red-200 bg-red-50">
                <Bell className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Your payment is overdue. Please pay immediately to avoid penalties.
                </AlertDescription>
              </Alert>
            )}
            {severity === 'urgent' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Bell className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Payment due in 3 days or less. Please pay to avoid late fees.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Outstanding Summary Card */}
          <Card className="lg:col-span-1 animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>Outstanding Dues</span>
                <div className={`w-3 h-3 rounded-full ${
                  severity === 'overdue' ? 'bg-red-500' :
                  severity === 'urgent' ? 'bg-yellow-500' :
                  severity === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                }`} />
              </CardTitle>
              <CardDescription>Due by {new Date(ownerData.dueDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                ₹{ownerData.currentDue.toLocaleString()}
              </div>
              <Button className="w-full hover-scale" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Quick Pay Now
              </Button>
            </CardContent>
          </Card>

          {/* Last Payment Widget */}
          <Card className="lg:col-span-1 animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-green-600" />
                Last Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                ₹{ownerData.lastPaymentAmount.toLocaleString()}
              </div>
              <p className="text-gray-600">
                Paid on {new Date(ownerData.lastPaymentDate).toLocaleDateString()}
              </p>
              <Badge className="mt-3 bg-green-100 text-green-800">
                Payment Successful
              </Badge>
            </CardContent>
          </Card>

          {/* Payment History Chart */}
          <Card className="lg:col-span-1 animate-fade-in">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                6-Month Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={monthlyPayments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense Breakdown */}
          <Card className="lg:col-span-1 animate-fade-in">
            <CardHeader>
              <CardTitle>Current Bill Breakdown</CardTitle>
              <CardDescription>December 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {expenseBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </div>
                    <span className="font-medium">₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bills Table */}
          <Card className="lg:col-span-2 animate-fade-in">
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBills.map((bill, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{bill.month}</TableCell>
                      <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                      <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bill.status)}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {bill.receiptId && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
