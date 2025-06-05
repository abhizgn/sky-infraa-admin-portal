
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  Home, 
  Download, 
  Search, 
  Calendar, 
  CreditCard, 
  AlertCircle,
  Filter
} from 'lucide-react';

const OwnerBills = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - in real app this would come from API
  const bills = [
    {
      id: 'BILL001',
      month: 'January 2025',
      amount: 8500,
      dueDate: '2025-01-15',
      status: 'Unpaid',
      paymentDate: null,
      receiptUrl: null,
      isPriority: true
    },
    {
      id: 'BILL002',
      month: 'December 2024',
      amount: 7500,
      dueDate: '2024-12-15',
      status: 'Paid',
      paymentDate: '2024-12-10',
      receiptUrl: '/receipts/dec2024.pdf'
    },
    {
      id: 'BILL003',
      month: 'November 2024',
      amount: 7600,
      dueDate: '2024-11-15',
      status: 'Paid',
      paymentDate: '2024-11-08',
      receiptUrl: '/receipts/nov2024.pdf'
    },
    {
      id: 'BILL004',
      month: 'October 2024',
      amount: 7500,
      dueDate: '2024-10-15',
      status: 'Unpaid',
      paymentDate: null,
      receiptUrl: null
    },
    {
      id: 'BILL005',
      month: 'September 2024',
      amount: 7500,
      dueDate: '2024-09-15',
      status: 'Paid',
      paymentDate: '2024-09-12',
      receiptUrl: '/receipts/sep2024.pdf'
    }
  ];

  const summary = {
    totalUnpaid: 16000,
    currentMonthDue: 8500,
    totalPaid: 22600,
    averageMonthly: 7533
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.amount.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || bill.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueSeverity = (dueDate: string, status: string) => {
    if (status === 'Paid') return 'normal';
    const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'normal';
  };

  const handleDownloadReceipt = (receiptUrl: string, month: string) => {
    console.log(`Downloading receipt for ${month}: ${receiptUrl}`);
    // In real app, this would trigger the actual download
    window.open(receiptUrl, '_blank');
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              <Button variant="ghost">Dashboard</Button>
              <Button variant="ghost" className="text-blue-600 bg-blue-50">My Bills</Button>
              <Button variant="ghost">Pay Now</Button>
              <Button variant="ghost">Arrears</Button>
              <Button variant="ghost">Settings</Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 animate-fade-in">My Bills</h2>
          <p className="text-gray-600 mt-1">View and manage your maintenance bills</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Unpaid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{summary.totalUnpaid.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Current Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ₹{summary.currentMonthDue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{summary.totalPaid.toLocaleString()}
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

        {/* Filters and Search */}
        <Card className="mb-6 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by month or amount..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="current-year">This Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bills Table */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Bills History</CardTitle>
            <CardDescription>
              {filteredBills.length} bill(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBills.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBills.map((bill, index) => {
                      const severity = getDueSeverity(bill.dueDate, bill.status);
                      return (
                        <TableRow 
                          key={bill.id} 
                          className={`hover:bg-gray-50 ${bill.isPriority ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {bill.month}
                              {bill.isPriority && (
                                <AlertCircle className="h-4 w-4 text-blue-600 ml-2" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className={`flex items-center ${
                              severity === 'overdue' ? 'text-red-600' :
                              severity === 'urgent' ? 'text-orange-600' :
                              severity === 'warning' ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {new Date(bill.dueDate).toLocaleDateString()}
                              {severity === 'overdue' && <AlertCircle className="h-4 w-4 ml-1" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(bill.status)}>
                              {bill.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bill.paymentDate ? 
                              new Date(bill.paymentDate).toLocaleDateString() : 
                              <span className="text-gray-400">-</span>
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {bill.receiptUrl ? (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDownloadReceipt(bill.receiptUrl!, bill.month)}
                                  className="hover-scale"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-sm">No receipt</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              onClick={() => setCurrentPage(i + 1)}
                              isActive={currentPage === i + 1}
                              className="cursor-pointer"
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerBills;
