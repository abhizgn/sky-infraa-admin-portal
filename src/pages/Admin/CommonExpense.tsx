import { useState, useEffect } from 'react';
import API from '@/lib/api/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Calculator, FileText, DollarSign, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { Apartment, CommonExpenseItem, Flat } from '@/types';
// import { Flat } from '@/types/index';

export default function CommonExpenses() {
  const { toast } = useToast();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    description: '',
    amount: 0,
    date: new Date(),
    distributionType: 'fixed',
  });
  const [commonExpenses, setCommonExpenses] = useState<CommonExpenseItem[]>([]);
  const [flatsInSelectedApartment, setFlatsInSelectedApartment] = useState<Flat[]>([]);

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    fetchCommonExpenses(selectedApartment);
    if (selectedApartment && selectedApartment !== 'all') {
      fetchFlatsForCalculation(selectedApartment);
    } else {
      setFlatsInSelectedApartment([]);
    }
  }, [selectedApartment]);

  const fetchApartments = async () => {
    try {
      const res = await API.get('/admin/apartments');
      setApartments(res.data);
      if (res.data.length > 0 && selectedApartment === 'all') {
        setSelectedApartment('all');
      }
    } catch (error: any) {
      console.error('Failed to fetch apartments:', error);
      toast({
        title: "Error",
        description: `Failed to load apartments: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
    }
  };

  const fetchCommonExpenses = async (apartmentId: string) => {
    try {
      const params = apartmentId === 'all' ? {} : { apartmentId };
      const res = await API.get<CommonExpenseItem[]>('/admin/expenses', { params });
      setCommonExpenses(res.data);
    } catch (error: any) {
      console.error('Failed to fetch common expenses:', error);
      toast({
        title: "Error",
        description: `Failed to load common expenses: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
      setCommonExpenses([]);
    }
  };

  const fetchFlatsForCalculation = async (apartmentId: string) => {
    try {
      const res = await API.get<Flat[]>(`/admin/flats?apartmentId=${apartmentId}`);
      setFlatsInSelectedApartment(res.data);
    } catch (error: any) {
      console.error('Failed to fetch flats for calculation:', error);
      toast({
        title: "Error",
        description: `Failed to load flats for calculation: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDistribute = async () => {
    try {
      if (!selectedApartment || selectedApartment === 'all') {
        toast({
          title: 'Error',
          description: 'Please select a specific apartment for distribution',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        apartmentId: selectedApartment,
        ...expenseForm,
      };

      await API.post('/admin/expenses/distribute', payload);

      toast({
        title: 'Success',
        description: 'Expense distributed successfully',
      });
      setIsModalOpen(false);
      setExpenseForm({
        name: '',
        description: '',
        amount: 0,
        date: new Date(),
        distributionType: 'fixed',
      });
      fetchCommonExpenses(selectedApartment);
    } catch (error: any) {
      console.error('Failed to distribute expense:', error);
      toast({
        title: 'Error',
        description: `Failed to distribute expense: ${error.response?.data?.message || error.message}`,
        variant: 'destructive',
      });
    }
  };

  const totalAmount = commonExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const totalCategories = new Set(commonExpenses.map(expense => expense.name)).size;
  const affectedFlatsCount = 0;
  const distributionMode = 'N/A';

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Common Expenses</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

        <div className="mb-6">
          <Select
            value={selectedApartment}
            onValueChange={setSelectedApartment}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Apartment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Apartments</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={apt._id} value={apt._id}>
                  {apt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Common Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expense-name">Name</Label>
                <Input
                  id="expense-name"
                  value={expenseForm.name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expense-description">Description</Label>
                <Input
                  id="expense-description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="expense-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !expenseForm.date && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expenseForm.date ? format(new Date(expenseForm.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expenseForm.date}
                      onSelect={(date) => date && setExpenseForm({ ...expenseForm, date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="distribution-type">Distribution Type</Label>
                <Select
                  value={expenseForm.distributionType}
                  onValueChange={(value) => setExpenseForm({ ...expenseForm, distributionType: value })}
                >
                  <SelectTrigger id="distribution-type">
                    <SelectValue placeholder="Select distribution type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed (Single Entry)</SelectItem>
                    <SelectItem value="per_flat">Per Flat (Equal Share)</SelectItem>
                    <SelectItem value="per_sqft">Per Sq.Ft.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedApartment !== 'all' && flatsInSelectedApartment.length > 0 && expenseForm.amount > 0 && (
                <>
                  {expenseForm.distributionType === 'per_flat' && (
                    <p className="text-sm text-gray-600">
                      Amount per flat: {((expenseForm.amount / flatsInSelectedApartment.length)).toFixed(2)} (for {flatsInSelectedApartment.length} flats)
                    </p>
                  )}
                  {expenseForm.distributionType === 'per_sqft' && (
                    <p className="text-sm text-gray-600">
                      Total area of flats: {flatsInSelectedApartment.reduce((sum, flat) => sum + flat.areaSqft, 0)} sq.ft. <br />
                      Per sq.ft. charge: {((expenseForm.amount / flatsInSelectedApartment.reduce((sum, flat) => sum + flat.areaSqft, 0))).toFixed(3)}
                    </p>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDistribute} disabled={!selectedApartment || selectedApartment === 'all' || expenseForm.amount <= 0 || !expenseForm.name}>
                Distribute Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Common Expenses</h1>
            <p className="text-muted-foreground">Upload and distribute shared community expenses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">For selected criteria</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCategories}</div>
                <p className="text-xs text-muted-foreground">Expense categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Distribution Mode</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{distributionMode}</div>
                <p className="text-xs text-xs text-muted-foreground">N/A</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Affected Flats</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{affectedFlatsCount || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">Occupied flats</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Expenses {selectedApartment === 'all' ? 'Across All Apartments' : `for Apartment: ${apartments.find(a => a._id === selectedApartment)?.name || ''}`}</CardTitle>
              <CardDescription>{commonExpenses.length} expenses found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Apartment</TableHead>
                      <TableHead>Distribution Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commonExpenses.length > 0 ? (
                      commonExpenses.map(expense => (
                        <TableRow key={expense._id}>
                          <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                          <TableCell>{expense.name}</TableCell>
                          <TableCell>{expense.description || '-'}</TableCell>
                          <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                          <TableCell>{apartments.find(a => a._id === expense.apartmentId)?.name || 'N/A'}</TableCell>
                          <TableCell>{expense.distributionType?.replace(/_/g, ' ') || 'N/A'}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" disabled>View Details</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No expenses found for the selected criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
