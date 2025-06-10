
// import React, { useState } from 'react';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';
// import { Search, Plus, Receipt, Eye, Calendar, Building2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';

// interface Bill {
//   bill_id: string;
//   flat_id: string;
//   owner_id: string;
//   flat_number: string;
//   owner_name: string;
//   apartment_name: string;
//   amount: number;
//   month: string;
//   due_date: string;
//   status: 'Paid' | 'Unpaid';
//   payment_date?: string;
//   payment_mode?: 'UPI' | 'NEFT' | 'Cash' | 'Cheque';
//   transaction_id?: string;
//   receipt_url?: string;
// }

// const Maintenance = () => {
//   const [bills, setBills] = useState<Bill[]>([
//     {
//       bill_id: 'BILL202405-G3',
//       flat_id: 'FLAT102',
//       owner_id: 'OWNER567',
//       flat_number: 'G3',
//       owner_name: 'Abhinav Reddy',
//       apartment_name: 'Sky Heights',
//       amount: 2200,
//       month: '2025-05',
//       due_date: '2025-05-10',
//       status: 'Paid',
//       payment_date: '2025-05-05',
//       payment_mode: 'UPI',
//       transaction_id: 'UPI123456789',
//       receipt_url: '/receipts/BILL202405-G3.pdf'
//     },
//     {
//       bill_id: 'BILL202405-A4',
//       flat_id: 'FLAT103',
//       owner_id: 'OWNER568',
//       flat_number: 'A4',
//       owner_name: 'Priya Sharma',
//       apartment_name: 'Sky Heights',
//       amount: 2800,
//       month: '2025-05',
//       due_date: '2025-05-10',
//       status: 'Unpaid'
//     },
//     {
//       bill_id: 'BILL202405-B2',
//       flat_id: 'FLAT104',
//       owner_id: 'OWNER569',
//       flat_number: 'B2',
//       owner_name: 'Rajesh Kumar',
//       apartment_name: 'Green Valley',
//       amount: 1800,
//       month: '2025-05',
//       due_date: '2025-05-10',
//       status: 'Unpaid'
//     }
//   ]);

//   const [selectedMonth, setSelectedMonth] = useState('2025-05');
//   const [selectedApartment, setSelectedApartment] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
//   const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
//   const [paymentMode, setPaymentMode] = useState<'UPI' | 'NEFT' | 'Cash' | 'Cheque'>('UPI');
//   const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
//   const [transactionId, setTransactionId] = useState('');

//   const apartments = [
//     { id: 'all', name: 'All Apartments' },
//     { id: 'sky-heights', name: 'Sky Heights' },
//     { id: 'green-valley', name: 'Green Valley' },
//     { id: 'blue-ridge', name: 'Blue Ridge' }
//   ];

//   const months = [
//     { value: '2025-05', label: 'May 2025' },
//     { value: '2025-04', label: 'April 2025' },
//     { value: '2025-03', label: 'March 2025' },
//     { value: '2025-02', label: 'February 2025' },
//     { value: '2025-01', label: 'January 2025' }
//   ];

//   const filteredBills = bills.filter(bill => {
//     const matchesSearch = bill.flat_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          bill.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesMonth = bill.month === selectedMonth;
//     const matchesApartment = selectedApartment === 'all' || 
//                            bill.apartment_name.toLowerCase().includes(selectedApartment.replace('-', ' '));
    
//     return matchesSearch && matchesMonth && matchesApartment;
//   });

//   const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
//   const paidAmount = filteredBills.filter(bill => bill.status === 'Paid').reduce((sum, bill) => sum + bill.amount, 0);
//   const unpaidAmount = totalAmount - paidAmount;
//   const paidCount = filteredBills.filter(bill => bill.status === 'Paid').length;
//   const unpaidCount = filteredBills.filter(bill => bill.status === 'Unpaid').length;

//   const handleGenerateBills = () => {
//     toast({
//       title: "Bills Generated",
//       description: `Successfully generated bills for ${selectedMonth}`,
//     });
//   };

//   const handleMarkAsPaid = () => {
//     if (!selectedBill) return;

//     setBills(prevBills => 
//       prevBills.map(bill => 
//         bill.bill_id === selectedBill.bill_id 
//           ? { 
//               ...bill, 
//               status: 'Paid' as const, 
//               payment_date: paymentDate,
//               payment_mode: paymentMode,
//               transaction_id: transactionId || undefined
//             }
//           : bill
//       )
//     );

//     setShowPaymentDialog(false);
//     setSelectedBill(null);
//     setTransactionId('');
    
//     toast({
//       title: "Payment Recorded",
//       description: `Payment marked for ${selectedBill.flat_number} - ${selectedBill.owner_name}`,
//     });
//   };

//   const handleViewReceipt = (bill: Bill) => {
//     if (bill.receipt_url) {
//       window.open(bill.receipt_url, '_blank');
//     } else {
//       toast({
//         title: "Receipt Not Available",
//         description: "Receipt will be generated after payment confirmation",
//         variant: "destructive"
//       });
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="space-y-6">
//         {/* Header */}
//         <div>
//           <h1 className="text-3xl font-bold">Maintenance Bills</h1>
//           <p className="text-muted-foreground">Generate and track monthly maintenance bills</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
//               <Receipt className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{filteredBills.length}</div>
//               <p className="text-xs text-muted-foreground">For {months.find(m => m.value === selectedMonth)?.label}</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
//               <p className="text-xs text-muted-foreground">Across all flats</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Paid</CardTitle>
//               <CheckCircle className="h-4 w-4 text-green-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600">{paidCount}</div>
//               <p className="text-xs text-muted-foreground">₹{paidAmount.toLocaleString()} collected</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
//               <AlertCircle className="h-4 w-4 text-red-600" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
//               <p className="text-xs text-muted-foreground">₹{unpaidAmount.toLocaleString()} pending</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Controls */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Bill Management</CardTitle>
//             <CardDescription>Generate bills and track payments</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex flex-col md:flex-row gap-4">
//               <div className="flex-1">
//                 <Label htmlFor="month-select">Month & Year</Label>
//                 <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//                   <SelectTrigger>
//                     <Calendar className="h-4 w-4 mr-2" />
//                     <SelectValue placeholder="Select month" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {months.map((month) => (
//                       <SelectItem key={month.value} value={month.value}>
//                         {month.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex-1">
//                 <Label htmlFor="apartment-select">Apartment</Label>
//                 <Select value={selectedApartment} onValueChange={setSelectedApartment}>
//                   <SelectTrigger>
//                     <Building2 className="h-4 w-4 mr-2" />
//                     <SelectValue placeholder="Select apartment" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {apartments.map((apartment) => (
//                       <SelectItem key={apartment.id} value={apartment.id}>
//                         {apartment.name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div className="flex-1">
//                 <Label htmlFor="search">Search</Label>
//                 <div className="relative">
//                   <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     id="search"
//                     placeholder="Search by flat or owner..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>

//               <div className="flex items-end">
//                 <Button onClick={handleGenerateBills} className="w-full md:w-auto">
//                   <Plus className="h-4 w-4 mr-2" />
//                   Generate Bills
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Bills Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Bills for {months.find(m => m.value === selectedMonth)?.label}</CardTitle>
//             <CardDescription>{filteredBills.length} bills found</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="rounded-md border">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Flat No</TableHead>
//                     <TableHead>Owner Name</TableHead>
//                     <TableHead>Apartment</TableHead>
//                     <TableHead>Amount</TableHead>
//                     <TableHead>Due Date</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Payment Details</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredBills.map((bill) => (
//                     <TableRow key={bill.bill_id}>
//                       <TableCell className="font-medium">{bill.flat_number}</TableCell>
//                       <TableCell>{bill.owner_name}</TableCell>
//                       <TableCell>{bill.apartment_name}</TableCell>
//                       <TableCell>₹{bill.amount.toLocaleString()}</TableCell>
//                       <TableCell>{new Date(bill.due_date).toLocaleDateString()}</TableCell>
//                       <TableCell>
//                         <Badge variant={bill.status === 'Paid' ? 'default' : 'destructive'}>
//                           {bill.status}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         {bill.status === 'Paid' && bill.payment_date ? (
//                           <div className="text-sm">
//                             <div>{bill.payment_mode}</div>
//                             <div className="text-muted-foreground">
//                               {new Date(bill.payment_date).toLocaleDateString()}
//                             </div>
//                           </div>
//                         ) : (
//                           <span className="text-muted-foreground">-</span>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex gap-2">
//                           {bill.status === 'Unpaid' ? (
//                             <Button
//                               size="sm"
//                               onClick={() => {
//                                 setSelectedBill(bill);
//                                 setShowPaymentDialog(true);
//                               }}
//                             >
//                               Mark Paid
//                             </Button>
//                           ) : (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleViewReceipt(bill)}
//                             >
//                               <Eye className="h-4 w-4 mr-1" />
//                               Receipt
//                             </Button>
//                           )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {filteredBills.length === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                         No bills found for the selected criteria
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Payment Dialog */}
//         <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Mark Bill as Paid</DialogTitle>
//               <DialogDescription>
//                 Record payment details for {selectedBill?.flat_number} - {selectedBill?.owner_name}
//               </DialogDescription>
//             </DialogHeader>
            
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="payment-mode">Payment Mode</Label>
//                 <Select value={paymentMode} onValueChange={(value: 'UPI' | 'NEFT' | 'Cash' | 'Cheque') => setPaymentMode(value)}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="UPI">UPI</SelectItem>
//                     <SelectItem value="NEFT">NEFT</SelectItem>
//                     <SelectItem value="Cash">Cash</SelectItem>
//                     <SelectItem value="Cheque">Cheque</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="payment-date">Payment Date</Label>
//                 <Input
//                   id="payment-date"
//                   type="date"
//                   value={paymentDate}
//                   onChange={(e) => setPaymentDate(e.target.value)}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="transaction-id">Transaction ID (Optional)</Label>
//                 <Input
//                   id="transaction-id"
//                   placeholder="Enter transaction/reference ID"
//                   value={transactionId}
//                   onChange={(e) => setTransactionId(e.target.value)}
//                 />
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="text-sm font-medium">Bill Amount: ₹{selectedBill?.amount.toLocaleString()}</div>
//               </div>
//             </div>

//             <DialogFooter>
//               <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleMarkAsPaid}>
//                 Confirm Payment
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </AdminLayout>
//   );
// };

// export default Maintenance;
