
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Home, 
  CreditCard, 
  Smartphone, 
  Building, 
  Wallet,
  Loader,
  Check,
  X,
  Download,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OwnerPayNow = () => {
  const navigate = useNavigate();
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Mock data - in real app this would come from API
  const ownerData = {
    name: "Rajesh Kumar",
    flatNumber: "A-101",
    email: "rajesh@email.com",
    phone: "+91 9876543210"
  };

  const unpaidBills = [
    {
      id: 'BILL001',
      month: 'January 2025',
      amount: 8500,
      dueDate: '2025-01-15',
      category: 'Current Month',
      isOverdue: false
    },
    {
      id: 'BILL004',
      month: 'October 2024',
      amount: 7500,
      dueDate: '2024-10-15',
      category: 'Arrears',
      isOverdue: true
    }
  ];

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', name: 'Net Banking', icon: Building, description: 'All major banks' },
    { id: 'wallet', name: 'Wallets', icon: Wallet, description: 'Paytm, Amazon Pay' }
  ];

  const totalDue = unpaidBills
    .filter(bill => selectedBills.includes(bill.id))
    .reduce((sum, bill) => sum + bill.amount, 0);

  const currentDue = unpaidBills
    .filter(bill => selectedBills.includes(bill.id) && !bill.isOverdue)
    .reduce((sum, bill) => sum + bill.amount, 0);

  const arrearsDue = unpaidBills
    .filter(bill => selectedBills.includes(bill.id) && bill.isOverdue)
    .reduce((sum, bill) => sum + bill.amount, 0);

  useEffect(() => {
    // Auto-select all unpaid bills by default
    setSelectedBills(unpaidBills.map(bill => bill.id));
  }, []);

  const handleBillSelection = (billId: string, checked: boolean) => {
    if (checked) {
      setSelectedBills(prev => [...prev, billId]);
    } else {
      setSelectedBills(prev => prev.filter(id => id !== billId));
    }
  };

  const handlePayNow = async () => {
    if (selectedBills.length === 0 || !selectedPaymentMethod) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setTransactionId(`TXN${Date.now()}`);
        setReceiptUrl(`/receipts/receipt-${Date.now()}.pdf`);
        setShowSuccessModal(true);
      } else {
        setShowFailureModal(true);
      }
    } catch (error) {
      setShowFailureModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    console.log(`Downloading receipt: ${receiptUrl}`);
    // In real app, this would trigger the actual download
    window.open(receiptUrl, '_blank');
  };

  const handleBackToDashboard = () => {
    navigate('/owner');
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
              <Button variant="ghost" onClick={() => navigate('/owner')}>Dashboard</Button>
              <Button variant="ghost" onClick={() => navigate('/owner/bills')}>My Bills</Button>
              <Button variant="ghost" className="text-blue-600 bg-blue-50">Pay Now</Button>
              <Button variant="ghost">Arrears</Button>
              <Button variant="ghost">Settings</Button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/owner')} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 animate-fade-in">Pay Now</h2>
              <p className="text-gray-600 mt-1">Secure online payment for your maintenance dues</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bills and Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dues Summary Card */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Outstanding Dues</span>
                  {totalDue > 0 && (
                    <Badge variant="destructive">
                      ₹{totalDue.toLocaleString()}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedBills.length} bill(s) selected for payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{currentDue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Current Month</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      ₹{arrearsDue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Arrears</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select Bills to Pay */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Select Bills to Pay</CardTitle>
                <CardDescription>Choose which bills you want to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unpaidBills.map((bill, index) => (
                    <div 
                      key={bill.id} 
                      className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                        bill.isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Checkbox
                        checked={selectedBills.includes(bill.id)}
                        onCheckedChange={(checked) => handleBillSelection(bill.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{bill.month}</h4>
                            <p className="text-sm text-gray-600">
                              Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">₹{bill.amount.toLocaleString()}</div>
                            <Badge 
                              variant={bill.isOverdue ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {bill.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose your preferred payment option</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-blue-500 ${
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{method.name}</h4>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Billing Details and Pay Button */}
          <div className="space-y-6">
            {/* Billing Details */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Billing Details</CardTitle>
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
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="font-medium">{ownerData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="font-medium">{ownerData.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pay Now Button */}
            <Card className="animate-fade-in">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Total Amount</div>
                    <div className="text-3xl font-bold text-gray-900 animate-pulse">
                      ₹{totalDue.toLocaleString()}
                    </div>
                  </div>
                  
                  {selectedBills.length === 0 && (
                    <Alert>
                      <AlertDescription>
                        Please select at least one bill to proceed with payment.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!selectedPaymentMethod && selectedBills.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        Please select a payment method to proceed.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    className="w-full h-12 text-lg hover-scale" 
                    size="lg"
                    onClick={handlePayNow}
                    disabled={selectedBills.length === 0 || !selectedPaymentMethod || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="mr-2 h-5 w-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-center">Payment Successful!</DialogTitle>
            <DialogDescription className="text-center">
              Your payment has been processed successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Transaction ID</div>
              <div className="font-mono text-sm">{transactionId}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Amount Paid</div>
              <div className="text-lg font-bold text-green-600">₹{totalDue.toLocaleString()}</div>
            </div>
          </div>
          <DialogFooter className="flex-col space-y-2">
            <Button onClick={handleDownloadReceipt} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Button>
            <Button variant="outline" onClick={handleBackToDashboard} className="w-full">
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failure Modal */}
      <Dialog open={showFailureModal} onOpenChange={setShowFailureModal}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-center">Payment Failed</DialogTitle>
            <DialogDescription className="text-center">
              We couldn't process your payment. Please try again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Your payment could not be completed. Please check your payment details and try again.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex-col space-y-2">
            <Button onClick={() => setShowFailureModal(false)} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={handleBackToDashboard} className="w-full">
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerPayNow;
