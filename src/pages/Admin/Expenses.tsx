
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Upload, Calculator, FileText, Building2, Calendar, DollarSign, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CommonExpense {
  expense_id: string;
  apartment_id: string;
  month: string;
  category: string;
  amount: number;
  distribution_mode: 'equal' | 'sqft';
  per_flat_cost: number;
  notes?: string;
  uploaded_by: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<CommonExpense[]>([
    {
      expense_id: 'EXP202505-001',
      apartment_id: 'sky-heights',
      month: '2025-05',
      category: 'Electricity',
      amount: 15000,
      distribution_mode: 'equal',
      per_flat_cost: 500,
      notes: 'Common area electricity bill',
      uploaded_by: 'admin123'
    },
    {
      expense_id: 'EXP202505-002',
      apartment_id: 'sky-heights',
      month: '2025-05',
      category: 'Security',
      amount: 12000,
      distribution_mode: 'sqft',
      per_flat_cost: 0,
      notes: 'Security guards salary',
      uploaded_by: 'admin123'
    },
    {
      expense_id: 'EXP202505-003',
      apartment_id: 'green-valley',
      month: '2025-05',
      category: 'Water',
      amount: 8000,
      distribution_mode: 'equal',
      per_flat_cost: 400,
      notes: 'Water tank maintenance',
      uploaded_by: 'admin123'
    }
  ]);

  const [selectedMonth, setSelectedMonth] = useState('2025-05');
  const [selectedApartment, setSelectedApartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [distributionMode, setDistributionMode] = useState<'equal' | 'sqft'>('equal');
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  
  // Form states
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const apartments = [
    { id: 'all', name: 'All Apartments' },
    { id: 'sky-heights', name: 'Sky Heights' },
    { id: 'green-valley', name: 'Green Valley' },
    { id: 'blue-ridge', name: 'Blue Ridge' }
  ];

  const months = [
    { value: '2025-05', label: 'May 2025' },
    { value: '2025-04', label: 'April 2025' },
    { value: '2025-03', label: 'March 2025' },
    { value: '2025-02', label: 'February 2025' },
    { value: '2025-01', label: 'January 2025' }
  ];

  const categories = [
    'Electricity',
    'Water',
    'Security',
    'Lift Maintenance',
    'Generator',
    'Cleaning',
    'Garden Maintenance',
    'Pest Control',
    'Insurance',
    'Other'
  ];

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = expense.month === selectedMonth;
    const matchesApartment = selectedApartment === 'all' || expense.apartment_id === selectedApartment;
    
    return matchesSearch && matchesMonth && matchesApartment;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCategories = new Set(filteredExpenses.map(expense => expense.category)).size;

  const handleAddExpense = () => {
    if (!newCategory || !newAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in category and amount",
        variant: "destructive"
      });
      return;
    }

    const newExpense: CommonExpense = {
      expense_id: `EXP${selectedMonth.replace('-', '')}-${String(Date.now()).slice(-3)}`,
      apartment_id: selectedApartment === 'all' ? 'sky-heights' : selectedApartment,
      month: selectedMonth,
      category: newCategory,
      amount: parseFloat(newAmount),
      distribution_mode: distributionMode,
      per_flat_cost: 0, // Will be calculated during distribution
      notes: newNotes,
      uploaded_by: 'admin123'
    };

    setExpenses([...expenses, newExpense]);
    setShowAddExpenseDialog(false);
    setNewCategory('');
    setNewAmount('');
    setNewNotes('');

    toast({
      title: "Expense Added",
      description: `${newCategory} expense of ₹${newAmount} added successfully`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file processing
      toast({
        title: "File Uploaded",
        description: `Processing ${file.name}...`,
      });
      setShowUploadDialog(false);
      
      // Simulate adding expenses from file
      setTimeout(() => {
        toast({
          title: "Expenses Imported",
          description: "Successfully imported 5 expense entries",
        });
      }, 2000);
    }
  };

  const handleDistribute = () => {
    setShowSummaryDialog(true);
  };

  const confirmDistribution = () => {
    toast({
      title: "Expenses Distributed",
      description: `Successfully distributed ₹${totalAmount.toLocaleString()} across all flats`,
    });
    setShowSummaryDialog(false);
  };

  const updateDistributionMode = (newMode: 'equal' | 'sqft') => {
    setDistributionMode(newMode);
    // Update all expenses with new distribution mode
    setExpenses(prevExpenses => 
      prevExpenses.map(expense => ({
        ...expense,
        distribution_mode: newMode
      }))
    );
  };

  // Mock distribution summary
  const distributionSummary = [
    { flat: 'A1', owner: 'John Doe', sqft: 1200, share: 1250 },
    { flat: 'A2', owner: 'Jane Smith', sqft: 1000, share: 1042 },
    { flat: 'B1', owner: 'Mike Johnson', sqft: 1100, share: 1146 },
    { flat: 'B2', owner: 'Sarah Wilson', sqft: 950, share: 990 }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Common Expenses</h1>
          <p className="text-muted-foreground">Upload and distribute shared community expenses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">For {months.find(m => m.value === selectedMonth)?.label}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCategories}</div>
              <p className="text-xs text-muted-foreground">Expense categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distribution Mode</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{distributionMode}</div>
              <p className="text-xs text-muted-foreground">
                {distributionMode === 'equal' ? 'Equal split' : 'Per sq.ft basis'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affected Flats</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Occupied flats</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Management</CardTitle>
            <CardDescription>Upload or add community expenses and distribute costs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="month-select">Month & Year</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="apartment-select">Apartment</Label>
                <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select apartment" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartments.map((apartment) => (
                      <SelectItem key={apartment.id} value={apartment.id}>
                        {apartment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="distribution-mode">Distribution Mode</Label>
                <Select value={distributionMode} onValueChange={(value: 'equal' | 'sqft') => updateDistributionMode(value)}>
                  <SelectTrigger>
                    <Calculator className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">Equal Split</SelectItem>
                    <SelectItem value="sqft">Per Sq.Ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Expense File</DialogTitle>
                    <DialogDescription>
                      Upload a CSV or Excel file containing expense details
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Drop files here or click to upload
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showAddExpenseDialog} onOpenChange={setShowAddExpenseDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manually
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Manual Expense</DialogTitle>
                    <DialogDescription>
                      Enter expense details manually
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add notes about this expense"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddExpenseDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddExpense}>
                      Add Expense
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button onClick={handleDistribute} disabled={filteredExpenses.length === 0}>
                <Calculator className="h-4 w-4 mr-2" />
                Distribute Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses for {months.find(m => m.value === selectedMonth)?.label}</CardTitle>
            <CardDescription>{filteredExpenses.length} expenses found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Distribution Mode</TableHead>
                    <TableHead>Per Flat Cost</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.expense_id}>
                      <TableCell className="font-medium">{expense.category}</TableCell>
                      <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={expense.distribution_mode === 'equal' ? 'default' : 'secondary'}>
                          {expense.distribution_mode === 'equal' ? 'Equal' : 'Per Sq.Ft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expense.distribution_mode === 'equal' 
                          ? `₹${(expense.amount / 4).toFixed(0)}` 
                          : 'Variable'
                        }
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {expense.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No expenses found for the selected criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Summary Dialog */}
        <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Distribution Summary</DialogTitle>
              <DialogDescription>
                Review how expenses will be distributed across flats
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Amount:</span> ₹{totalAmount.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Distribution Mode:</span> {distributionMode === 'equal' ? 'Equal Split' : 'Per Sq.Ft'}
                  </div>
                  <div>
                    <span className="font-medium">Number of Flats:</span> 4
                  </div>
                  <div>
                    <span className="font-medium">Categories:</span> {totalCategories}
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flat No</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Sq.Ft</TableHead>
                      <TableHead>Share Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributionSummary.map((item) => (
                      <TableRow key={item.flat}>
                        <TableCell className="font-medium">{item.flat}</TableCell>
                        <TableCell>{item.owner}</TableCell>
                        <TableCell>{item.sqft}</TableCell>
                        <TableCell>₹{item.share.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSummaryDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmDistribution}>
                Confirm Distribution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Expenses;
