
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Home, 
  AlertTriangle, 
  Download, 
  CreditCard, 
  TrendingUp,
  Calendar,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OwnerArrears = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');

  // Mock data - in real app this would come from API
  const ownerData = {
    name: "Rajesh Kumar",
    flatNumber: "A-101",
    email: "rajesh@email.com",
    phone: "+91 9876543210"
  };

  const arrearsData = [
    {
      id: 'BILL004',
      month: 'October 2024',
      amount: 7500,
      dueDate: '2024-10-15',
      status: 'Unpaid',
      daysOverdue: 52,
      ageGroup: '30-60 days'
    },
    {
      id: 'BILL003',
      month: 'September 2024',
      amount: 7500,
      dueDate: '2024-09-15',
      status: 'Unpaid',
      daysOverdue: 82,
      ageGroup: '60-90 days'
    },
    {
      id: 'BILL002',
      month: 'August 2024',
      amount: 7600,
      dueDate: '2024-08-15',
      status: 'Unpaid',
      daysOverdue: 113,
      ageGroup: '90+ days'
    }
  ];

  const summary = {
    totalOverdue: 22600,
    pendingMonths: 3,
    oldestDue: '2024-08-15',
    averageMonthly: 7533
  };

  const agingReport = {
    '0-30 days': 0,
    '30-60 days': 7500,
    '60-90 days': 7500,
    '90+ days': 7600
  };

  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup) {
      case '0-30 days': return 'bg-yellow-100 text-yellow-800';
      case '30-60 days': return 'bg-orange-100 text-orange-800';
      case '60-90 days': return 'bg-red-100 text-red-800';
      case '90+ days': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayNow = () => {
    navigate('/owner/pay-now');
  };

  const handleExportPDF = () => {
    console.log('Exporting arrears statement as PDF');
    // In real app, this would trigger PDF generation and download
  };

  const isHighArrears = summary.totalOverdue > 15000 || summary.pendingMonths >= 3;

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
              <Button variant="ghost" onClick={() => navigate('/owner')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/bills')}>My Bills</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/pay-now')}>Pay Now</Button>
              <Button variant="ghost" className="text-blue-600 bg-blue-50">Arrears</Button>
              <Button variant="ghost">Settings</Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/owner')} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 animate-fade-in">Arrears Overview</h2>
              <p className="text-gray-600 mt-1">Outstanding dues and payment history</p>
            </div>
          </div>
        </div>

        {/* High Arrears Warning Banner */}
        {isHighArrears && (
          <Alert className="mb-6 border-red-200 bg-red-50 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Urgent:</strong> Your account has significant overdue amounts. Please clear your dues to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{summary.totalOverdue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {summary.pendingMonths}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Oldest Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {new Date(summary.oldestDue).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Monthly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ₹{summary.averageMonthly.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Aging Report */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Aging Report
              </CardTitle>
              <CardDescription>Breakdown by overdue period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(agingReport).map(([period, amount]) => (
                  <div key={period} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{period}</span>
                    <Badge className={getAgeGroupColor(period)}>
                      ₹{amount.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your arrears</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full hover-scale animate-pulse" 
                size="lg"
                onClick={handlePayNow}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Pay All Arrears
              </Button>
              <Button 
                variant="outline" 
                className="w-full hover-scale"
                onClick={handleExportPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Statement
              </Button>
            </CardContent>
          </Card>

          {/* Owner Details */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Owner Name</label>
                <p className="font-medium">{ownerData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Flat Number</label>
                <p className="font-medium">{ownerData.flatNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Contact</label>
                <p className="font-medium">{ownerData.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arrears Timeline/Table */}
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Overdue Bills Timeline</CardTitle>
                <CardDescription>
                  {arrearsData.length} bill(s) pending payment
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Table View
                </Button>
                <Button
                  variant={viewMode === 'graph' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('graph')}
                >
                  Graph View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arrearsData.map((bill, index) => (
                    <TableRow 
                      key={bill.id} 
                      className="hover:bg-red-50 border-l-4 border-l-red-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {bill.month}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-red-600">
                        ₹{bill.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {bill.daysOverdue} days
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAgeGroupColor(bill.ageGroup)}>
                          {bill.ageGroup}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="hover-scale">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Graph View</h3>
                  <p className="text-gray-600">Arrears trend visualization would appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerArrears;
