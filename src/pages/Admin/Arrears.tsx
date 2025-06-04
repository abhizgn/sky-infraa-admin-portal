
import React, { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock,
  Send,
  Download,
  Search,
  Filter,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface ArrearsRecord {
  id: string;
  flatId: string;
  flatNo: string;
  ownerName: string;
  apartmentName: string;
  totalDue: number;
  lastPaymentDate: string | null;
  contactEmail: string;
  contactPhone: string;
  reminderStatus: 'sent' | 'not_sent';
  reminderSentOn: string | null;
  monthsOverdue: number;
}

const mockArrearsData: ArrearsRecord[] = [
  {
    id: '1',
    flatId: 'FLAT001',
    flatNo: 'A-101',
    ownerName: 'Rajesh Kumar',
    apartmentName: 'Sky Heights',
    totalDue: 8500,
    lastPaymentDate: '2024-10-15',
    contactEmail: 'rajesh@email.com',
    contactPhone: '+91 9876543210',
    reminderStatus: 'not_sent',
    reminderSentOn: null,
    monthsOverdue: 3
  },
  {
    id: '2',
    flatId: 'FLAT002',
    flatNo: 'B-205',
    ownerName: 'Priya Sharma',
    apartmentName: 'Sky Heights',
    totalDue: 12000,
    lastPaymentDate: '2024-09-20',
    contactEmail: 'priya@email.com',
    contactPhone: '+91 9876543211',
    reminderStatus: 'sent',
    reminderSentOn: '2024-12-01',
    monthsOverdue: 4
  },
  {
    id: '3',
    flatId: 'FLAT003',
    flatNo: 'C-302',
    ownerName: 'Amit Patel',
    apartmentName: 'Sky Gardens',
    totalDue: 5500,
    lastPaymentDate: '2024-11-10',
    contactEmail: 'amit@email.com',
    contactPhone: '+91 9876543212',
    reminderStatus: 'not_sent',
    reminderSentOn: null,
    monthsOverdue: 2
  }
];

export default function Arrears() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedApartment, setSelectedApartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderType, setReminderType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [reminderMessage, setReminderMessage] = useState('');
  const [currentRecord, setCurrentRecord] = useState<ArrearsRecord | null>(null);

  const filteredData = mockArrearsData.filter(record => {
    const matchesSearch = record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.flatNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApartment = selectedApartment === 'all' || record.apartmentName === selectedApartment;
    return matchesSearch && matchesApartment;
  });

  const totalOutstanding = filteredData.reduce((sum, record) => sum + record.totalDue, 0);

  const defaultEmailTemplate = `Subject: Maintenance Dues Reminder – Sky Infraa

Dear [Owner Name],

This is a gentle reminder that your maintenance dues for Flat [Flat No] in [Apartment Name] amount to ₹[Due Amount] as of [Month].

Please clear the dues at your earliest convenience via the Owner Portal.

Regards,
Sky Infraa Management`;

  const defaultSMSTemplate = `Dear [Owner Name], your maintenance dues for Flat [Flat No] is ₹[Due Amount]. Please clear at earliest. - Sky Infraa`;

  const handleSelectRecord = (recordId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRecords(filteredData.map(record => record.id));
    } else {
      setSelectedRecords([]);
    }
  };

  const openReminderModal = (record?: ArrearsRecord) => {
    setCurrentRecord(record || null);
    setReminderMessage(reminderType === 'email' ? defaultEmailTemplate : defaultSMSTemplate);
    setReminderModalOpen(true);
  };

  const sendReminder = () => {
    console.log('Sending reminder:', {
      type: reminderType,
      message: reminderMessage,
      records: currentRecord ? [currentRecord] : selectedRecords
    });
    
    toast.success(
      currentRecord 
        ? `Reminder sent to ${currentRecord.ownerName}`
        : `Bulk reminders sent to ${selectedRecords.length} owners`
    );
    
    setReminderModalOpen(false);
    setSelectedRecords([]);
  };

  const exportToCSV = () => {
    const csvData = filteredData.map(record => ({
      'Flat No': record.flatNo,
      'Owner Name': record.ownerName,
      'Apartment': record.apartmentName,
      'Total Due': record.totalDue,
      'Last Payment': record.lastPaymentDate || 'Never',
      'Months Overdue': record.monthsOverdue,
      'Contact Email': record.contactEmail,
      'Contact Phone': record.contactPhone
    }));
    
    console.log('Exporting CSV:', csvData);
    toast.success('Arrears report downloaded successfully');
  };

  const getSeverityColor = (monthsOverdue: number) => {
    if (monthsOverdue >= 6) return 'destructive';
    if (monthsOverdue >= 3) return 'secondary';
    return 'default';
  };

  return (
    <AdminLayout>
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
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            {selectedRecords.length > 0 && (
              <Button onClick={() => openReminderModal()}>
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
                <div className="text-2xl font-bold">{filteredData.length}</div>
                <div className="text-sm text-muted-foreground">Flats with Dues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {filteredData.filter(r => r.monthsOverdue >= 3).length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Cases (3+ months)</div>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    <SelectItem value="2024-12">December 2024</SelectItem>
                    <SelectItem value="2024-11">November 2024</SelectItem>
                    <SelectItem value="2024-10">October 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Apartment</Label>
                <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select apartment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Apartments</SelectItem>
                    <SelectItem value="Sky Heights">Sky Heights</SelectItem>
                    <SelectItem value="Sky Gardens">Sky Gardens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
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
              {filteredData.length} record(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedRecords.length === filteredData.length && filteredData.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Flat No</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Apartment</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Overdue</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Reminder Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => handleSelectRecord(record.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{record.flatNo}</TableCell>
                      <TableCell>{record.ownerName}</TableCell>
                      <TableCell>{record.apartmentName}</TableCell>
                      <TableCell className="font-semibold text-red-600">
                        ₹{record.totalDue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {record.lastPaymentDate ? (
                          new Date(record.lastPaymentDate).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(record.monthsOverdue)}>
                          {record.monthsOverdue} months
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">Contact Information</h4>
                                <div className="text-sm">
                                  <p><strong>Email:</strong> {record.contactEmail}</p>
                                  <p><strong>Phone:</strong> {record.contactPhone}</p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.reminderStatus === 'sent' ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Sent</Badge>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <div className="space-y-2">
                                  <h4 className="font-medium">Reminder History</h4>
                                  <p className="text-sm">
                                    Last sent: {record.reminderSentOn ? new Date(record.reminderSentOn).toLocaleString() : 'N/A'}
                                  </p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        ) : (
                          <Badge variant="outline">Not Sent</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openReminderModal(record)}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send Reminder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Modal */}
        <Dialog open={reminderModalOpen} onOpenChange={setReminderModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {currentRecord ? `Send Reminder to ${currentRecord.ownerName}` : `Send Bulk Reminders`}
              </DialogTitle>
              <DialogDescription>
                {currentRecord 
                  ? `Customize and send a payment reminder for flat ${currentRecord.flatNo}`
                  : `Send reminders to ${selectedRecords.length} selected owners`
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
                  Use placeholders: [Owner Name], [Flat No], [Apartment Name], [Due Amount], [Month]
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReminderModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={sendReminder}>
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
