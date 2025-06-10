import { useState, useEffect } from 'react';
import API from '@/lib/api/api'; // Assuming your API service is here
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertTriangle,
  Mail,
  MessageSquare,
  Phone,
  // Clock,
  Send,
  Download,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { toast } from 'sonner'; // Assuming you are using sonner for toasts
import { format, differenceInDays, parseISO } from 'date-fns'; // Import date-fns helpers

// Import types from your frontend types file
import { Apartment, Owner } from '@/types';

// Define the interface for an Arrear record received from the backend GET /api/admin/arrears endpoint
// This should match IArrearPopulated from your backend types, adjusted for frontend use
interface ArrearRecord {
  _id: string; // Arrear ID
  ownerId: Owner; // Populated owner object
  flatId: { // Populated flat object (partial)
    _id: string;
    flatNumber: string;
    apartmentId: Apartment; // Nested populated apartment object (partial)
  };
  month: string; // "YYYY-MM" format
  amount: number; // Amount due for this specific arrear record (for the month)
  status: 'pending' | 'partial' | 'paid' | 'reminded';
  lastReminderSentAt?: string | null; // Date string or null
  createdAt: string;
  updatedAt: string;
}

export default function Arrears() {
  const [arrears, setArrears] = useState<ArrearRecord[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]); // State for owner filter
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // YYYY-MM format
  const [selectedApartment, setSelectedApartment] = useState<string>(''); // Apartment ID or 'all'
  const [selectedOwner, setSelectedOwner] = useState<string>(''); // Owner ID or 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]); // Array of Arrear IDs
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderType, setReminderType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [reminderMessage, setReminderMessage] = useState('');
  const [currentRecord, setCurrentRecord] = useState<ArrearRecord | null>(null); // For single reminder modal

  // Fetch initial data (apartments and owners for filters)
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchApartments(),
          fetchOwners()
        ]);
        // Set default month filter to current month
        const currentMonth = format(new Date(), 'yyyy-MM');
        console.log('Setting initial month:', currentMonth); // Add logging
        setSelectedMonth(currentMonth);
      } catch (error) {
        console.error('Error initializing data:', error);
        toast.error('Failed to initialize data');
      }
    };

    initializeData();
  }, []);

  // Fetch arrears data whenever filters or search terms change
  useEffect(() => {
    fetchArrears();
  }, [selectedMonth, selectedApartment, selectedOwner]); // Refetch when filters change


  const fetchArrears = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedApartment && selectedApartment !== 'all') params.apartmentId = selectedApartment;
      if (selectedOwner && selectedOwner !== 'all') params.ownerId = selectedOwner;

      console.log('Fetching arrears with params:', params); // Add logging

      const res = await API.get<ArrearRecord[]>('/admin/arrears', { params });
      console.log('Received arrears data:', res.data); // Add logging

      if (!Array.isArray(res.data)) {
        console.error('Invalid response format:', res.data);
        throw new Error('Invalid response format from server');
      }

      const filteredBySearch = res.data.filter(record => {
        if (!record) return false; // Skip null/undefined records
        
        const term = searchTerm.toLowerCase();
        const ownerNameMatch = (record.ownerId?.name || '').toLowerCase().includes(term);
        const flatNumberMatch = (record.flatId?.flatNumber || '').toLowerCase().includes(term);
        return ownerNameMatch || flatNumberMatch;
      });

      setArrears(filteredBySearch);
    } catch (error: any) {
      console.error('Failed to fetch arrears:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      toast.error(`Failed to load arrears: ${errorMessage}`);
      setArrears([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApartments = async () => {
    try {
      const res = await API.get<Apartment[]>('/admin/apartments');
      setApartments(res.data);
       // Add 'All' option to the filter dropdown
       setSelectedApartment('all');
    } catch (error: any) {
      console.error('Failed to fetch apartments:', error);
      toast.error(`Failed to load apartments for filter: ${error.response?.data?.message || error.message}`);
    }
  };

   const fetchOwners = async () => {
     try {
       const res = await API.get<Owner[]>('/admin/owners'); // Assuming this endpoint exists
       setOwners(res.data);
        // Add 'All' option to the filter dropdown
        setSelectedOwner('all');
     } catch (error: any) {
       console.error('Failed to fetch owners:', error);
       toast.error(`Failed to load owners for filter: ${error.response?.data?.message || error.message}`);
     }
   };


  const handleSelectRecord = (recordId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(arrears.map(record => record._id));
    } else {
      setSelectedRecords([]);
    }
  };

  const openReminderModal = (record?: ArrearRecord) => {
    setCurrentRecord(record || null);
     // Generate default message based on type and selected record(s)
     if (record) {
        setReminderMessage(generateDefaultReminderMessage(reminderType, [record]));
     } else {
        // For bulk reminder, generate message for selected records
        const selectedArrearRecords = arrears.filter(a => selectedRecords.includes(a._id));
        setReminderMessage(generateDefaultReminderMessage(reminderType, selectedArrearRecords));
     }
    setReminderModalOpen(true);
  };

   // Update reminder message when reminderType changes
   useEffect(() => {
      if (reminderModalOpen) {
         const recordsToSend = currentRecord ? [currentRecord] : arrears.filter(a => selectedRecords.includes(a._id));
         setReminderMessage(generateDefaultReminderMessage(reminderType, recordsToSend));
      }
   }, [reminderType, reminderModalOpen]);


   const generateDefaultReminderMessage = (type: 'email' | 'sms' | 'whatsapp', records: ArrearRecord[]): string => {
      if (records.length === 0) return '';

      // For single reminder, use specific record details
      if (records.length === 1 && currentRecord) {
          const record = currentRecord;
          const placeholders = {
              '[Owner Name]': record.ownerId?.name || 'Owner',
              '[Flat No]': record.flatId?.flatNumber || 'N/A',
              '[Apartment Name]': record.flatId?.apartmentId?.name || 'N/A',
              '[Due Amount]': record.amount.toLocaleString(),
              '[Month]': format(parseISO(`${record.month}-01`), 'MMM yyyy'), // Format YYYY-MM month
          };

          let template = '';
          if (type === 'email') {
              template = `Subject: Maintenance Dues Reminder – Sky Infraa

Dear [Owner Name],

This is a gentle reminder that your maintenance dues for Flat [Flat No] in [Apartment Name] amount to ₹[Due Amount] for the month of [Month].

Please clear the dues at your earliest convenience.

Regards,
Sky Infraa Management`;
          } else if (type === 'sms' || type === 'whatsapp') {
              template = `Dear [Owner Name], your maintenance dues for Flat [Flat No] is ₹[Due Amount] for [Month]. Please clear at earliest. - Sky Infraa`;
          }

          // Replace placeholders
          let message = template;
          for (const key in placeholders) {
              message = message.replace(new RegExp(key.replace(/[\[\]]/g, '\\$&'), 'g'), placeholders[key as keyof typeof placeholders]);
          }
          return message;

      } else {
          // For bulk reminder, provide a generic message or list flats/amounts
          // A simple generic message might be better for bulk
          return type === 'email'
            ? `Subject: Bulk Maintenance Dues Reminder – Sky Infraa

Dear Owner,

This is a reminder about pending maintenance dues for your flat(s). Please check your statement or the owner portal for details.

Regards,
Sky Infraa Management`
            : `Dear Owner, this is a reminder about pending maintenance dues for your flat(s). Please check owner portal for details. - Sky Infraa`;
      }
   };


  const sendReminder = async () => {
    setLoading(true);
    try {
       const recordsToSend = currentRecord ? [currentRecord] : arrears.filter(a => selectedRecords.includes(a._id));

       if (recordsToSend.length === 0) {
          toast.info("No records selected to send reminders.");
          setLoading(false);
          setReminderModalOpen(false);
          return;
       }

       // For now, the backend only supports sending reminder per arrear ID.
       // For bulk, we'll need to loop and call the API for each selected arrear.
       // A more efficient backend route for bulk reminders would be better.

       for (const record of recordsToSend) {
          await API.post(`/admin/arrears/${record._id}/reminder`, {
             message: reminderMessage, // Send the customized message
             type: reminderType, // Send the type if backend needs it
             // Add any other necessary data
          });
          // Update the status of the sent reminder record in the frontend state
          setArrears(prevArrears =>
             prevArrears.map(arrear =>
                arrear._id === record._id ? { ...arrear, status: 'reminded', lastReminderSentAt: new Date().toISOString() } : arrear
             )
          );
       }

    
    toast.success(
      currentRecord 
          ? `Reminder sent to ${(currentRecord.ownerId && typeof currentRecord.ownerId === 'object' && currentRecord.ownerId.name) || 'owner'}`
          : `Bulk reminders sent to ${recordsToSend.length} owner(s)`
    );
    
    setReminderModalOpen(false);
    setSelectedRecords([]);
      // fetchArrears(); // Optional: refetch all to be sure, but state update is faster

    } catch (error: any) {
      console.error('Failed to send reminder:', error);
       toast.error(`Failed to send reminder: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: 'csv' | 'pdf') => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedMonth) params.month = selectedMonth;
      if (selectedApartment && selectedApartment !== 'all') params.apartmentId = selectedApartment;
      if (selectedOwner && selectedOwner !== 'all') params.ownerId = selectedOwner;
       // Add search term to params if backend supports it
       // params.search = searchTerm;

       // Add export type parameter for backend
       params.type = type;


      // Assuming the backend GET /api/admin/arrears/export handles filtering and returns a file
       const res = await API.get('/admin/arrears/export', {
         params,
         responseType: 'blob', // Important for downloading files
       });

       // Create a blob and initiate download
       const blobType = type === 'pdf' ? 'application/pdf' : 'text/csv'; // Correct CSV mime type
       const blob = new Blob([res.data], { type: blobType });
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `arrears_report.${type}`; // Use type directly (csv or pdf)
       document.body.appendChild(a);
       a.click();
       window.URL.revokeObjectURL(url);
       a.remove();


    toast.success('Arrears report downloaded successfully');

    } catch (error: any) {
      console.error('Failed to export report:', error);
       toast.error(`Failed to export report: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };


  // Calculate total outstanding amount from the current filtered arrears
  const totalOutstanding = arrears.reduce((sum, record) => sum + record.amount, 0);
  const flatsWithDuesCount = arrears.length;
   const criticalCasesCount = arrears.filter(record => differenceInDays(new Date(), parseISO(`${record.month}-01`)) >= 90).length; // > 3 months overdue logic (adjust as needed)


  const getOverdueMonths = (monthYear: string): number => {
     try {
       const arrearDate = parseISO(`${monthYear}-01`); // Parse the month string
       const today = new Date();
       const diffInDays = differenceInDays(today, arrearDate);
       return Math.max(0, Math.floor(diffInDays / 30)); // Approximate months
     } catch (e) {
       console.error("Error calculating overdue months:", e);
       return 0; // Return 0 or handle error appropriately
     }
  };

  const getSeverityColor = (monthsOverdue: number) => {
    if (monthsOverdue >= 6) return 'destructive'; // 6+ months
    if (monthsOverdue >= 3) return 'secondary'; // 3-5 months
    return 'default'; // Less than 3 months
  };

   // Function to get formatted reminder status display
   const getReminderStatusDisplay = (record: ArrearRecord) => {
      if (record.status === 'reminded') {
         return (
            <div className="flex items-center gap-2">
               <Badge variant="secondary">Reminded</Badge>
               <Popover>
                 <PopoverTrigger asChild>
                   <Button variant="ghost" size="sm">
                     <Info className="h-4 w-4" />
                   </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-auto">
                   <div className="space-y-2">
                     <h4 className="font-medium">Reminder History</h4>
                     <p className="text-sm">
                       Last sent: {record.lastReminderSentAt ? format(new Date(record.lastReminderSentAt), 'PPP p') : 'N/A'}
                     </p>
                   </div>
                 </PopoverContent>
               </Popover>
            </div>
         );
      } else if (record.status === 'paid') {
         return <Badge variant="default">Paid</Badge>; // Assuming 'paid' status
      } else if (record.status === 'partial') {
          return <Badge variant="outline">Partial Payment</Badge>;
      }
      return <Badge variant="outline">Pending</Badge>; // Default to pending
   };


   // Generate month options for the filter (e.g., last 12 months)
   const generateMonthOptions = () => {
      const months = [];
      const currentDate = new Date();
      // Generate options for the last 12 months
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const value = format(date, 'yyyy-MM');
        const label = format(date, 'MMMM yyyy');
        months.push({ value, label });
      }
      return months;
   };


  return (
    <AdminLayout>
       {loading && (
           <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
               <p className="text-lg font-medium">Loading...</p> {/* Replace with a spinner component */}
           </div>
       )}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Arrears Report</h1>
            <p className="text-muted-foreground">
              Track outstanding dues and send payment reminders
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => exportReport('csv')} variant="outline" disabled={loading || arrears.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
             <Button onClick={() => exportReport('pdf')} variant="outline" disabled={loading || arrears.length === 0}>
               <Download className="mr-2 h-4 w-4" />
               Export PDF
            </Button>
            {selectedRecords.length > 0 && (
              <Button onClick={() => openReminderModal()} disabled={loading}>
                <Send className="mr-2 h-4 w-4" />
                Send Bulk Reminders ({selectedRecords.length})
              </Button>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Outstanding Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">₹{totalOutstanding.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{flatsWithDuesCount}</div>
                <div className="text-sm text-muted-foreground">Arrear Records Found</div> {/* Updated label */}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {criticalCasesCount}
                </div>
                <div className="text-sm text-muted-foreground">Critical Cases (3+ months overdue)</div> {/* Updated label and logic */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Apartment</Label>
                <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Apartment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Apartments</SelectItem>
                    {apartments.map(apt => (
                      <SelectItem key={apt._id} value={apt._id}>
                        {apt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label> {/* Added Owner Filter */}
                <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Owners</SelectItem>
                    {owners.map(owner => (
                      <SelectItem key={owner._id} value={owner._id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               {/* Move Search here if not handled by backend API */}
               <div className="space-y-2 md:col-span-3"> {/* Span full width if filters are 3 columns */}
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by owner or flat no..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
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
            </CardDescription> {/* Use actual arrears count */}
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
               {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading arrears...</div>
               ) : arrears.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No arrears found for the selected criteria.</div>
               ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                          checked={selectedRecords.length === arrears.length && arrears.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Flat No</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Apartment</TableHead>
                      <TableHead>Month</TableHead> {/* Added Month column */}
                      <TableHead>Amount Due</TableHead> {/* Changed to Amount Due */}
                      {/* <TableHead>Last Payment</TableHead> */} {/* Removed as not directly in Arrear model */}
                    <TableHead>Overdue</TableHead>
                    <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead> {/* Changed from Reminder Status to Status */}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {arrears.map((record) => {
                       const monthsOverdue = getOverdueMonths(record.month);
                       const isCritical = monthsOverdue >= 3; // Highlight rows with 3+ months overdue

                      return (
                         // Apply styling based on overdue status
                        <TableRow key={record._id} className={isCritical ? 'bg-red-50/50' : ''}>
                      <TableCell>
                        <Checkbox
                              checked={selectedRecords.includes(record._id)}
                              onCheckedChange={(checked) => handleSelectRecord(record._id, !!checked)}
                        />
                      </TableCell>
                          <TableCell className="font-medium">{(record.flatId && typeof record.flatId === 'object' && record.flatId.flatNumber) || '-'}</TableCell>
                          <TableCell>{(record.ownerId && typeof record.ownerId === 'object' && record.ownerId.name) || '-'}</TableCell>
                          <TableCell>{(record.flatId && typeof record.flatId === 'object' && record.flatId.apartmentId && typeof record.flatId.apartmentId === 'object' && record.flatId.apartmentId.name) || '-'}</TableCell>
                          <TableCell>{record.month ? format(parseISO(`${record.month}-01`), 'MMM yyyy') : '-'}</TableCell> {/* Display formatted month */}
                      <TableCell className="font-semibold text-red-600">
                            ₹{record.amount?.toLocaleString() || '0'} {/* Use amount from arrear record */}
                      </TableCell>
                      <TableCell>
                            <Badge variant={getSeverityColor(monthsOverdue)}>
                              {monthsOverdue} months
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                               {/* Display contact icons and popover */}
                               {(record.ownerId && typeof record.ownerId === 'object' && (record.ownerId?.email || record.ownerId?.phone)) ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm">
                                       <Mail className="h-4 w-4" /> {/* Or use Phone/MessageSquare */}
                              </Button>
                            </PopoverTrigger>
                                   <PopoverContent className="w-auto"> {/* Adjust width as needed */}
                              <div className="space-y-2">
                                <h4 className="font-medium">Contact Information</h4>
                                       {record.ownerId?.email && <p className="text-sm"><strong>Email:</strong> {record.ownerId.email}</p>}
                                       {record.ownerId?.phone && <p className="text-sm"><strong>Phone:</strong> {record.ownerId.phone}</p>}
                              </div>
                            </PopoverContent>
                          </Popover>
                               ) : (
                                 <span className="text-muted-foreground text-sm">-</span>
                               )}
                        </div>
                      </TableCell>
                      <TableCell>
                             {getReminderStatusDisplay(record)} {/* Use the helper function */}
                      </TableCell>
                      <TableCell>
                            {/* Send single reminder button */}
                            {record.status !== 'paid' && ( // Don't show reminder for paid arrears
                        <Button
                          size="sm"
                                onClick={() => openReminderModal(record)} // Pass the single record
                                disabled={loading} // Disable if sending others
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Reminder
                        </Button>
                            )}
                      </TableCell>
                    </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Reminder Modal */}
        <Dialog open={reminderModalOpen} onOpenChange={(open) => {
           setReminderModalOpen(open);
           if (!open) { // Reset state when modal closes
              setCurrentRecord(null);
              // Keep selectedRecords if closing without sending bulk
           }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {currentRecord ? `Send Reminder to ${(currentRecord.ownerId && typeof currentRecord.ownerId === 'object' && currentRecord.ownerId.name) || 'Owner'}` : `Send Bulk Reminders`}
              </DialogTitle>
              <DialogDescription>
                {currentRecord 
                  ? `Customize and send a payment reminder for flat ${(currentRecord.flatId && typeof currentRecord.flatId === 'object' && currentRecord.flatId.flatNumber) || 'N/A'}`
                  : `Send reminders to ${selectedRecords.length} selected arrear records.`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Reminder Type</Label>
                <Tabs value={reminderType} onValueChange={(value) => setReminderType(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <Label>Message</Label>
                <Textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  rows={reminderType === 'email' ? 10 : 5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                   Placeholders: [Owner Name], [Flat No], [Apartment Name], [Due Amount], [Month]. (Might vary slightly for bulk)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReminderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendReminder} disabled={loading || (!currentRecord && selectedRecords.length === 0) || reminderMessage.trim() === ''}>
                <Send className="mr-2 h-4 w-4" />
                Send {currentRecord ? 'Reminder' : `${selectedRecords.length} Reminders`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
