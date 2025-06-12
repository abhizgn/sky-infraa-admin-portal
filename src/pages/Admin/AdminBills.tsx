import { useEffect, useState } from 'react';
import API from '@/lib/api/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Search, Plus, Receipt, Eye, Building2, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Apartment, Flat, Owner } from '@/types';

interface Bill {
  _id: string;
  flatId: Flat | string;
  ownerId: Owner | string;
  amount: number;
  status: 'Paid' | 'Unpaid';
  dueDate: string;
  generatedDate: string;
  paymentDate?: string;
  paymentMode?: string;
  transactionId?: string;
  month: string;
  year: number;
}

interface MaintenanceItem {
  _id: string;
  flatId: Flat | string;
  name: string;
  description?: string;
  amount: number;
  date: string;
  createdAt: string;
}

export default function AdminBills() {
  const { toast } = useToast();
  const [monthYear, setMonthYear] = useState<Date | undefined>(new Date());
  const [bills, setBills] = useState<Bill[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loadingBills, setLoadingBills] = useState(false);

  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedFlat, setSelectedFlat] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    name: '',
    description: '',
    amount: 0,
    date: new Date(),
  });

  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    if (monthYear) {
      fetchBills();
      fetchMaintenanceItems();
    } else {
      setBills([]);
      setMaintenanceItems([]);
    }
  }, [monthYear, selectedApartment, selectedFlat]);

  useEffect(() => {
    if (selectedApartment && selectedApartment !== 'all') {
      fetchFlats(selectedApartment);
    } else {
      setFlats([]);
    }
  }, [selectedApartment]);

  const fetchApartments = async () => {
    try {
      const response = await API.get<Apartment[]>('/admin/apartments');
      setApartments(response.data);
      if (response.data.length > 0 && !selectedApartment) {
        setSelectedApartment('all');
      } else if (response.data.length === 0) {
        setSelectedApartment('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch apartments',
        variant: 'destructive',
      });
      setApartments([]);
      setSelectedApartment('');
    }
  };

  const fetchBills = async () => {
    if (!monthYear) return;
    setLoadingBills(true);
    const month = format(monthYear, 'MM');
    const year = format(monthYear, 'yyyy');
    try {
      const res = await API.get<Bill[]>('/admin/bills', {
        params: {
          month,
          year,
          apartmentId: selectedApartment === 'all' ? undefined : selectedApartment,
        }
      });
      setBills(res.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unknown error occurred',
          variant: 'destructive',
        });
      }
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

  const fetchFlats = async (apartmentId: string) => {
    try {
      if (!apartmentId || apartmentId === 'all') {
        setFlats([]);
        return;
      }
      const response = await API.get<Flat[]>(`/admin/flats?apartmentId=${apartmentId}`);
      setFlats(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch flats',
        variant: 'destructive',
      });
      setFlats([]);
    }
  };

  const generateBills = async () => {
    if (!monthYear) {
      toast({ title: "Missing Information", description: "Select a month and year.", variant: "destructive" });
      return;
    }
    const month = format(monthYear, 'MM');
    const year = format(monthYear, 'yyyy');
    try {
      await API.post('/admin/bills/generate', {
        month,
        year,
        apartmentId: selectedApartment === 'all' ? undefined : selectedApartment,
      });
      fetchBills();
      toast({ title: "Success", description: `Bills generated for ${format(monthYear, 'MMM yyyy')}.` });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'An unknown error occurred',
          variant: 'destructive',
        });
      }
    }
  };

  const fetchMaintenanceItems = async () => {
    if (!monthYear) return;
    setLoadingMaintenance(true);
    const month = (monthYear.getMonth() + 1);
    const year = monthYear.getFullYear();

    try {
      const params: any = { month, year };
      if (selectedApartment && selectedApartment !== 'all') {
        params.apartmentId = selectedApartment;
      }
      if (selectedFlat && selectedFlat !== 'all') {
        params.flatId = selectedFlat;
      }

      const res = await API.get<MaintenanceItem[]>('/admin/maintenance', { params });
      console.log('Fetched maintenance items:', res.data);
      setMaintenanceItems(res.data);
    } catch (error: any) {
      console.error('Failed to fetch maintenance items:', error);
      toast({
        title: 'Error',
        description: `Failed to load maintenance items: ${error.response?.data?.message || error.message}`,
        variant: 'destructive',
      });
      setMaintenanceItems([]);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleMaintenanceItemSubmit = async () => {
    try {
      if (!selectedFlat) {
        toast({
          title: 'Error',
          description: 'Please select a flat',
          variant: 'destructive',
        });
        return;
      }

      await API.post('/admin/maintenance', {
        ...maintenanceForm,
        flatId: selectedFlat,
      });

      toast({
        title: 'Success',
        description: 'Maintenance added successfully.',
      });
      setIsModalOpen(false);
      setMaintenanceForm({
        name: '',
        description: '',
        amount: 0,
        date: new Date(),
      });
      fetchMaintenanceItems();
    } catch (error: any) {
      console.error('Failed to add maintenance:', error);
      toast({
        title: 'Error',
        description: `Failed to add maintenance: ${error.response?.data?.message || error.message}`,
        variant: 'destructive',
      });
    }
  };

  const totalAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const paidBills = bills.filter(b => b.status === 'Paid');
  const unpaidBills = bills.filter(b => b.status === 'Unpaid');
  const paidAmount = paidBills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const unpaidAmount = unpaidBills.reduce((sum, b) => sum + (b.amount || 0), 0);
  const paidCount = paidBills.length;
  const unpaidCount = unpaidBills.length;

  const handleMarkAsPaid = (bill: Bill) => {
    console.log('Mark as Paid clicked for bill:', bill);
  };

  const handleViewReceipt = (bill: Bill) => {
    console.log('View Receipt clicked for bill:', bill);
  };

  const filteredBills = bills.filter(b => {
    const searchTermLower = search.toLowerCase();

    const flatNumberMatch = (typeof b.flatId === 'object' && b.flatId?.flatNumber || '').toLowerCase().includes(searchTermLower);
    const ownerNameMatch = (typeof b.ownerId === 'object' && b.ownerId?.name || '').toLowerCase().includes(searchTermLower);
    const apartmentNameMatch = (typeof b.flatId === 'object' && b.flatId?.apartment?.name || '').toLowerCase().includes(searchTermLower);

    const flatIdStringMatch = (typeof b.flatId === 'string' && b.flatId.toLowerCase().includes(searchTermLower));
    const ownerIdStringMatch = (typeof b.ownerId === 'string' && b.ownerId.toLowerCase().includes(searchTermLower));

    return flatNumberMatch || ownerNameMatch || apartmentNameMatch || flatIdStringMatch || ownerIdStringMatch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Bills</h1>
            <p className="text-muted-foreground">Generate and track monthly maintenance bills</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredBills.length}</div>
                <p className="text-xs text-muted-foreground">For {monthYear ? format(monthYear, 'MMM yyyy') : 'selected month'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all flats</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                <p className="text-xs text-muted-foreground">₹{paidAmount.toLocaleString()} collected</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
                <p className="text-xs text-muted-foreground">₹{unpaidAmount.toLocaleString()} pending</p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Bill Management</CardTitle>
              <CardDescription>Generate bills and track payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="month-year-select">Month & Year</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="month-year-select"
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal ${!monthYear && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {monthYear ? format(monthYear, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={monthYear}
                        onSelect={setMonthYear}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1">
                  <Label htmlFor="apartment-select">Apartment</Label>
                  <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                    <SelectTrigger id="apartment-select">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Apartments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Apartments</SelectItem>
                      {apartments.map((apt: Apartment) => (
                        <SelectItem key={apt._id} value={apt._id}>
                          {apt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by flat or owner..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button onClick={generateBills} className="w-full md:w-auto gap-2">
                  <Plus className="h-4 w-4" /> Generate Bills
                </Button>
                <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto gap-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Bills for {monthYear ? format(monthYear, 'MMM yyyy') : 'selected month'}</CardTitle>
              <CardDescription>{filteredBills.length} bills found</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBills ? (
                <div className="text-center py-8">Loading bills...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Flat No</TableHead>
                        <TableHead>Owner Name</TableHead>
                        <TableHead>Apartment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment Details</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBills.map((bill) => (
                        <TableRow key={bill._id}>
                          <TableCell className="font-medium">{(typeof bill.flatId === 'object' && bill.flatId?.flatNumber) || '-'}</TableCell>
                          <TableCell>{(typeof bill.ownerId === 'object' && bill.ownerId?.name) || '-'}</TableCell>
                          <TableCell>{(typeof bill.flatId === 'object' && bill.flatId?.apartment?.name) || '-'}</TableCell>
                          <TableCell>₹{bill.amount?.toLocaleString() || '0'}</TableCell>
                          <TableCell>{bill.dueDate ? format(new Date(bill.dueDate), 'P') : '-'}</TableCell>
                          <TableCell>
                            <Badge variant={bill.status === 'Paid' ? 'default' : 'destructive'}>
                              {bill.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {bill.status === 'Paid' && bill.paymentDate ? (
                              <div className="text-sm">
                                <div>{bill.paymentMode || '-'}</div>
                                <div className="text-muted-foreground">
                                  {bill.paymentDate ? format(new Date(bill.paymentDate), 'P') : '-'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {bill.status === 'Unpaid' ? (
                                <Button size="sm" onClick={() => handleMarkAsPaid(bill)}>
                                  Mark Paid
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleViewReceipt(bill)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Receipt
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredBills.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No bills found for the selected criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Items History</CardTitle>
              <CardDescription>Individual maintenance records not yet included in bills.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Flat</TableHead>
                    <TableHead>Apartment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingMaintenance ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">Loading maintenance items...</TableCell>
                    </TableRow>
                  ) : maintenanceItems.length > 0 ? (
                    maintenanceItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{format(new Date(item.date), 'PPP')}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.description || '-'}</TableCell>
                        <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                        <TableCell>{(item.flatId as any)?.flatNumber || 'N/A'}</TableCell>
                        <TableCell>{(item.flatId as any)?.apartmentId?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {/* Add actions like edit/delete if needed */}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No maintenance items found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Maintenance for a Flat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="maintenance-apartment-select">Apartment</Label>
                <Select
                  value={selectedApartment}
                  onValueChange={(value) => {
                    setSelectedApartment(value);
                    setSelectedFlat('');
                  }}
                >
                  <SelectTrigger id="maintenance-apartment-select">
                    <SelectValue placeholder="Select Apartment" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartments.map((apt: Apartment) => (
                      <SelectItem key={apt._id} value={apt._id}>
                        {apt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maintenance-flat-select">Flat</Label>
                <Select
                  value={selectedFlat}
                  onValueChange={setSelectedFlat}
                  disabled={!selectedApartment || selectedApartment === 'all' || flats.length === 0}
                >
                  <SelectTrigger id="maintenance-flat-select">
                    <SelectValue placeholder="Select Flat" />
                  </SelectTrigger>
                  <SelectContent>
                    {flats.map(flat => (
                      flat._id ? (
                        <SelectItem key={flat._id} value={flat._id}>
                          {flat.flatNumber} - {flat.owner?.name || 'No Owner'}
                        </SelectItem>
                      ) : null
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maintenance-name">Name</Label>
                <Input
                  id="maintenance-name"
                  value={maintenanceForm.name}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="maintenance-description">Description</Label>
                <Input
                  id="maintenance-description"
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="maintenance-amount">Amount</Label>
                <Input
                  id="maintenance-amount"
                  type="number"
                  value={maintenanceForm.amount}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="maintenance-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${
                        !maintenanceForm.date && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {maintenanceForm.date ? format(new Date(maintenanceForm.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={maintenanceForm.date}
                      onSelect={(date) => date && setMaintenanceForm({ ...maintenanceForm, date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMaintenanceItemSubmit} disabled={!selectedFlat || !maintenanceForm.name || maintenanceForm.amount <= 0}>
                Add Maintenance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
