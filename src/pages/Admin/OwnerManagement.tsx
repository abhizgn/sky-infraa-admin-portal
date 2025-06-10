import { useEffect, useState } from 'react';
import API from '@/lib/api/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Phone, Building2, Pencil, Trash2, UserPlus, Search, UserMinus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Apartment {
  _id: string;
  name: string;
  location?: string;
  createdAt?: string;
  totalFloors?: number;
  units?: number;
}

interface Flat {
  _id: string;
  flatNumber: string;
  apartmentId: string;
  apartment?: {
    _id: string;
    name: string;
  } | null;
  ownerId?: string | null;
  isOccupied: boolean;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  flatId?: string | null;
  flat?: Flat | null;
  status: 'active' | 'inactive';
  ownershipDate?: Date;
  createdAt?: string;
  updatedAt?: string;
}

export default function OwnerManagement() {
  const { toast } = useToast();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [unassignedFlats, setUnassignedFlats] = useState<Flat[]>([]);
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    flatId: 'none'
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartmentForFlats, setSelectedApartmentForFlats] = useState<string>('');
  const [assignFlatModal, setAssignFlatModal] = useState<{ open: boolean; owner?: Owner }>({ open: false });
  const [selectedFlatForAssignment, setSelectedFlatForAssignment] = useState<string>('');
  const [unassignModal, setUnassignModal] = useState<{ open: boolean; owner?: Owner }>({ open: false });

  useEffect(() => {
    fetchOwners();
    fetchApartments();
  }, []);

  useEffect(() => {
    console.log("assignFlatModal.open state:", assignFlatModal.open);
    console.log("selectedApartmentForFlats state:", selectedApartmentForFlats);

    if (assignFlatModal.open && selectedApartmentForFlats) {
      fetchUnassignedFlatsForApartment(selectedApartmentForFlats);
    } else if (assignFlatModal.open && !selectedApartmentForFlats) {
      setUnassignedFlats([]);
      console.log("No apartment selected, clearing unassigned flats.");
    } else {
      setSelectedFlatForAssignment('');
      setUnassignedFlats([]);
      console.log("Assign Flat Modal closed, clearing states.");
    }
  }, [assignFlatModal.open, selectedApartmentForFlats]);

  const fetchOwners = async () => {
    try {
      console.log('Fetching owners...');
      const res = await API.get<Owner[]>('/admin/owners');
      console.log('Received owners data:', res.data);
      setOwners(res.data);
    } catch (error: any) {
      console.error('Failed to fetch owners:', error);
      toast({
        title: "Error",
        description: `Failed to load owners: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
    }
  };

  const fetchApartments = async () => {
    try {
      const res = await API.get('/admin/apartments');
      setApartments(res.data);
      if (res.data.length > 0) {
          setSelectedApartmentForFlats(res.data[0]._id);
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

  const fetchUnassignedFlatsForApartment = async (apartmentId: string) => {
    try {
      console.log('Fetching unassigned flats for apartment:', apartmentId);
      const res = await API.get<Flat[]>(`/admin/flats?apartmentId=${apartmentId}&isOccupied=false`);
      console.log('Unassigned flats response:', res.data);
      const filtered = res.data.filter(flat => !flat.ownerId);
      setUnassignedFlats(filtered);
      console.log('Filtered unassigned flats:', filtered);
    } catch (error: any) {
      console.error('Failed to fetch unassigned flats for apartment:', error);
      toast({
        title: "Error",
        description: `Failed to load unassigned flats for apartment: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      toast({
        title: "Missing Information",
        description: "Name and Phone are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const submitData = {
        ...form,
        flatId: form.flatId === 'none' ? null : form.flatId
      };

      console.log('Submitting owner data:', submitData);

      let response;
      if (editingId) {
        response = await API.put(`/admin/owners/${editingId}`, submitData);
        toast({
          title: "Success",
          description: "Owner updated successfully.",
        });
      } else {
        response = await API.post('/admin/owners', { ...submitData, status: 'active' });
        toast({
          title: "Success",
          description: "Owner added successfully.",
        });
      }

      console.log('Server response:', response.data);

      resetForm();
      setShowAddEditModal(false);
      await fetchOwners();
    } catch (error: any) {
      console.error('Failed to save owner:', error);
      toast({
        title: "Error",
        description: `Failed to save owner: ${error.response?.data?.message || error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (owner: Owner) => {
    setForm({
      name: owner.name,
      phone: owner.phone,
      email: owner.email || '',
      flatId: owner.flat?._id || 'none',
    });
    setEditingId(owner._id);
    setShowAddEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this owner? This will also unassign their flat.')) {
      return;
    }
    setIsDeleting(true);
    try {
      await API.delete(`/admin/owners/${id}`);
      toast({
         title: "Success",
         description: "Owner deleted successfully.",
      });
      fetchOwners();
    } catch (error: any) {
      console.error('Failed to delete owner:', error);
       toast({
          title: "Error",
          description: `Failed to delete owner: ${error.response?.data?.message || error.message}`,
          variant: "destructive"
       });
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setForm({ 
      name: '', 
      phone: '', 
      email: '', 
      flatId: 'none'
    });
    setEditingId(null);
  };

  const filteredOwners = owners.filter(o => {
    const searchTermLower = search.toLowerCase();
    const matchesSearch = (o.name?.toLowerCase().includes(searchTermLower) ?? false) ||
                          (o.phone?.includes(search) ?? false) ||
                          (o.email?.toLowerCase().includes(searchTermLower) ?? false) ||
                          (o.flat?.flatNumber?.toLowerCase().includes(searchTermLower) ?? false) ||
                          (o.flat?.apartment?.name?.toLowerCase().includes(searchTermLower) ?? false);

    const matchesFilter = filter === 'all' || o.status === filter;

    return matchesSearch && matchesFilter;
  });

  const handleUnassign = async (owner: Owner) => {
    try {
      if (!owner.flatId) {
        toast({
          title: 'Info',
          description: 'This owner is not assigned to any flat.',
        });
        setUnassignModal({ open: false });
        return;
      }
      await API.put(`/admin/flats/${owner.flatId}/unassign-owner`);
      await API.put(`/admin/owners/${owner._id}`, { flatId: null });

      toast({
        title: 'Success',
        description: 'Owner unassigned from flat successfully.',
      });
      fetchOwners();
      setUnassignModal({ open: false });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unassign owner from flat.',
        variant: 'destructive',
      });
      console.error('Unassign owner error:', error);
    }
  };

  const handleAssignFlat = async () => {
    if (!assignFlatModal.owner || !selectedFlatForAssignment) {
      toast({
        title: 'Error',
        description: 'Please select a flat to assign.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await API.put(`/admin/flats/${selectedFlatForAssignment}/assign-owner`, {
        ownerId: assignFlatModal.owner._id,
      });
      await API.put(`/admin/owners/${assignFlatModal.owner._id}`, {
        flatId: selectedFlatForAssignment,
      });

      toast({
        title: 'Success',
        description: 'Flat assigned to owner successfully!',
      });
      setAssignFlatModal({ open: false });
      setSelectedFlatForAssignment('');
      fetchOwners();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign flat to owner.',
        variant: 'destructive',
      });
      console.error('Assign flat error:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Owners Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Owners Management</h1>
            <p className="text-muted-foreground">Manage property owners and their flat assignments</p>
          </div>
          <Dialog open={showAddEditModal} onOpenChange={(open) => {
             setShowAddEditModal(open);
             if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}><UserPlus className="h-4 w-4" /> Add Owner</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Owner' : 'Add New Owner'}</DialogTitle>
                 <DialogDescription>Enter the owner's contact information.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label htmlFor="name">Name</Label>
                   <Input id="name" placeholder="Enter full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="phone">Phone</Label>
                   <Input id="phone" placeholder="Enter phone number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                   <Input id="email" type="email" placeholder="Enter email address (Optional)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEditModal(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!form.name || !form.phone}>
                   {editingId ? 'Update Owner' : 'Add Owner'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, phone, or flat..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder="All Owners" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Owners ({filteredOwners.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Owner Details</TableHead>
                  <TableHead className="w-[200px]">Contact</TableHead>
                  <TableHead className="w-[200px]">Assigned Flats</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map(owner => (
                  <TableRow key={owner._id}>
                    <TableCell className="font-bold">{owner.name}
                       <div className="text-xs font-normal text-gray-500">ID: {owner._id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4" /> {owner.email || '-'}</div>
                      <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4" /> {owner.phone}</div>
                    </TableCell>
                    <TableCell>
                      {owner.flat ? (
                        <div className="flex items-center gap-2">
                           <Building2 className="h-4 w-4" />
                           <span>{owner.flat.apartment?.name} - {owner.flat.flatNumber}</span>
                        </div>
                      ) : (
                         <span className="text-muted-foreground">Not Assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={owner.status === 'active' ? 'default' : 'secondary'}>{owner.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(owner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {owner.flatId ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUnassignModal({ open: true, owner })}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setAssignFlatModal({ open: true, owner })}
                          >
                             <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(owner._id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOwners.length === 0 && (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                         No owners found matching your criteria.
                      </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

         {/* <Card>
           <CardHeader><CardTitle>Unassigned Flats ({unassignedFlats.length})</CardTitle></CardHeader>
           <CardContent>
             {unassignedFlats.length > 0 ? (
               <ul className="list-disc pl-6 space-y-1">
                 {unassignedFlats.map(flat => (
                   <li key={flat._id} className="text-sm">
                      {flat.apartment?.name || 'N/A'} - {flat.flatNumber}
                   </li>
                 ))}
               </ul>
             ) : (
                <div className="text-muted-foreground text-sm">All flats are assigned or no unassigned flats exist.</div>
             )}
           </CardContent>
        </Card> */}

      </div>

      <Dialog open={unassignModal.open} onOpenChange={() => setUnassignModal({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unassign Flat</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to unassign flat "{unassignModal.owner?.flat?.flatNumber}" from "{unassignModal.owner?.name}"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnassignModal({ open: false })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => unassignModal.owner && handleUnassign(unassignModal.owner)}>
              Unassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={assignFlatModal.open} 
        onOpenChange={(open) => {
          setAssignFlatModal({ open });
          if (!open) {
            setSelectedApartmentForFlats(apartments.length > 0 ? apartments[0]._id : '');
            setSelectedFlatForAssignment('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Flat to {assignFlatModal.owner?.name}</DialogTitle>
            <DialogDescription>
              Select an apartment and flat to assign to this owner.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="apartment-select" className="text-right">
                Apartment
              </Label>
              <Select
                value={selectedApartmentForFlats}
                onValueChange={setSelectedApartmentForFlats}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an apartment" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apt) => (
                    <SelectItem key={apt._id} value={apt._id}>
                      {apt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="flat-select" className="text-right">
                Flat
              </Label>
              <Select
                value={selectedFlatForAssignment}
                onValueChange={setSelectedFlatForAssignment}
                disabled={!selectedApartmentForFlats || unassignedFlats.length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a flat" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedFlats.length > 0 ? (
                    unassignedFlats.map((flat) => (
                      <SelectItem key={flat._id} value={flat._id}>
                        {flat.flatNumber}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-flats-found" disabled>
                      No unassigned flats available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFlatModal({ open: false })}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignFlat}
              disabled={!selectedFlatForAssignment}
            >
              Assign Flat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
