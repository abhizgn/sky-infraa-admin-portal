
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Search, Edit, Trash2, UserPlus, Building2, MapPin, Calendar } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Apartment {
  apartment_id: string;
  name: string;
  location: string;
  total_flats: number;
  created_at: string;
}

interface Flat {
  flat_id: string;
  apartment_id: string;
  flat_number: string;
  type: '1BHK' | '2BHK' | '3BHK' | '4BHK';
  size_sqft: number;
  owner_id?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  status: 'Vacant' | 'Occupied';
}

interface Owner {
  owner_id: string;
  name: string;
  phone: string;
  email: string;
}

const Flats = () => {
  const { apartmentId } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignOwnerModalOpen, setIsAssignOwnerModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<Flat | null>(null);
  const [assigningFlat, setAssigningFlat] = useState<Flat | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    flat_number: '',
    type: '',
    size_sqft: '',
  });

  // Mock data - replace with API calls
  const apartment: Apartment = {
    apartment_id: apartmentId || 'APT001',
    name: 'Sky The White House',
    location: 'Mallampet',
    total_flats: 40,
    created_at: '2024-01-15T10:20:00Z',
  };

  const [flats, setFlats] = useState<Flat[]>([
    {
      flat_id: 'F001',
      apartment_id: 'APT001',
      flat_number: 'G1',
      type: '2BHK',
      size_sqft: 1200,
      owner_id: 'O001',
      owner_name: 'Rajesh Kumar',
      owner_phone: '+91 9876543210',
      owner_email: 'rajesh@email.com',
      status: 'Occupied',
    },
    {
      flat_id: 'F002',
      apartment_id: 'APT001',
      flat_number: 'G2',
      type: '3BHK',
      size_sqft: 1500,
      owner_id: 'O002',
      owner_name: 'Priya Sharma',
      owner_phone: '+91 9876543211',
      owner_email: 'priya@email.com',
      status: 'Occupied',
    },
    {
      flat_id: 'F003',
      apartment_id: 'APT001',
      flat_number: 'G3',
      type: '2BHK',
      size_sqft: 1200,
      status: 'Vacant',
    },
    {
      flat_id: 'F004',
      apartment_id: 'APT001',
      flat_number: 'F1',
      type: '3BHK',
      size_sqft: 1500,
      status: 'Vacant',
    },
  ]);

  const mockOwners: Owner[] = [
    { owner_id: 'O003', name: 'Amit Patel', phone: '+91 9876543212', email: 'amit@email.com' },
    { owner_id: 'O004', name: 'Sneha Reddy', phone: '+91 9876543213', email: 'sneha@email.com' },
    { owner_id: 'O005', name: 'Vikram Singh', phone: '+91 9876543214', email: 'vikram@email.com' },
  ];

  const itemsPerPage = 10;
  const filteredFlats = flats.filter(flat =>
    flat.flat_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (flat.owner_name && flat.owner_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredFlats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFlats = filteredFlats.slice(startIndex, startIndex + itemsPerPage);

  const handleAddFlat = () => {
    const newFlat: Flat = {
      flat_id: `F${String(flats.length + 1).padStart(3, '0')}`,
      apartment_id: apartment.apartment_id,
      flat_number: formData.flat_number,
      type: formData.type as Flat['type'],
      size_sqft: parseInt(formData.size_sqft),
      status: 'Vacant',
    };
    setFlats([...flats, newFlat]);
    setFormData({ flat_number: '', type: '', size_sqft: '' });
    setIsAddModalOpen(false);
  };

  const handleEditFlat = () => {
    if (!editingFlat) return;
    
    setFlats(flats.map(flat => 
      flat.flat_id === editingFlat.flat_id 
        ? { 
            ...flat, 
            flat_number: formData.flat_number,
            type: formData.type as Flat['type'],
            size_sqft: parseInt(formData.size_sqft)
          }
        : flat
    ));
    setFormData({ flat_number: '', type: '', size_sqft: '' });
    setEditingFlat(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteFlat = (flatId: string) => {
    setFlats(flats.filter(flat => flat.flat_id !== flatId));
  };

  const handleAssignOwner = (ownerId: string) => {
    if (!assigningFlat) return;
    
    const selectedOwner = mockOwners.find(owner => owner.owner_id === ownerId);
    if (!selectedOwner) return;

    setFlats(flats.map(flat =>
      flat.flat_id === assigningFlat.flat_id
        ? {
            ...flat,
            owner_id: selectedOwner.owner_id,
            owner_name: selectedOwner.name,
            owner_phone: selectedOwner.phone,
            owner_email: selectedOwner.email,
            status: 'Occupied' as const,
          }
        : flat
    ));
    setAssigningFlat(null);
    setIsAssignOwnerModalOpen(false);
  };

  const handleUnassignOwner = (flatId: string) => {
    setFlats(flats.map(flat =>
      flat.flat_id === flatId
        ? {
            flat_id: flat.flat_id,
            apartment_id: flat.apartment_id,
            flat_number: flat.flat_number,
            type: flat.type,
            size_sqft: flat.size_sqft,
            status: 'Vacant' as const,
          }
        : flat
    ));
  };

  const openEditModal = (flat: Flat) => {
    setEditingFlat(flat);
    setFormData({
      flat_number: flat.flat_number,
      type: flat.type,
      size_sqft: flat.size_sqft.toString(),
    });
    setIsEditModalOpen(true);
  };

  const openAssignOwnerModal = (flat: Flat) => {
    setAssigningFlat(flat);
    setIsAssignOwnerModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
              <BreadcrumbLink href="/admin/apartments">Apartments Management</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{apartment.name} - Flats</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Apartment Info Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {apartment.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{apartment.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{apartment.total_flats} Total Flats</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created {formatDate(apartment.created_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Flats Management</h1>
            <p className="text-muted-foreground">
              Manage flats in {apartment.name}
            </p>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Flat
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Flat</DialogTitle>
                <DialogDescription>
                  Enter the details for the new flat.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="flat_number">Flat Number</Label>
                  <Input
                    id="flat_number"
                    value={formData.flat_number}
                    onChange={(e) => setFormData({ ...formData, flat_number: e.target.value })}
                    placeholder="e.g., G3, F1, S2"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select flat type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1BHK">1BHK</SelectItem>
                      <SelectItem value="2BHK">2BHK</SelectItem>
                      <SelectItem value="3BHK">3BHK</SelectItem>
                      <SelectItem value="4BHK">4BHK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="size_sqft">Size (sq. ft.)</Label>
                  <Input
                    id="size_sqft"
                    type="number"
                    value={formData.size_sqft}
                    onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })}
                    placeholder="e.g., 1200"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddFlat} 
                  disabled={!formData.flat_number || !formData.type || !formData.size_sqft}
                >
                  Add Flat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by flat number or owner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Flats Table */}
        <Card>
          <CardHeader>
            <CardTitle>Flats ({filteredFlats.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat No.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size (sq. ft.)</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFlats.map((flat) => (
                  <TableRow key={flat.flat_id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{flat.flat_number}</TableCell>
                    <TableCell>{flat.type}</TableCell>
                    <TableCell>{flat.size_sqft}</TableCell>
                    <TableCell>
                      {flat.owner_name ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-pointer">
                                <div className="font-medium">{flat.owner_name}</div>
                                <div className="text-sm text-muted-foreground">{flat.owner_phone}</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div>
                                <p className="font-medium">{flat.owner_name}</p>
                                <p>{flat.owner_phone}</p>
                                <p>{flat.owner_email}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={flat.status === 'Occupied' ? 'default' : 'secondary'}>
                        {flat.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {flat.status === 'Vacant' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignOwnerModal(flat)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign Owner
                          </Button>
                        )}
                        {flat.status === 'Occupied' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserPlus className="h-4 w-4 mr-1" />
                                Unassign
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Unassign Owner</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to unassign {flat.owner_name} from flat {flat.flat_number}?
                                  This will make the flat vacant.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleUnassignOwner(flat.flat_id)}
                                >
                                  Unassign
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(flat)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={flat.status === 'Occupied'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete flat
                                "{flat.flat_number}" and all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteFlat(flat.flat_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Flat</DialogTitle>
              <DialogDescription>
                Update the flat details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-flat_number">Flat Number</Label>
                <Input
                  id="edit-flat_number"
                  value={formData.flat_number}
                  onChange={(e) => setFormData({ ...formData, flat_number: e.target.value })}
                  placeholder="e.g., G3, F1, S2"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select flat type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1BHK">1BHK</SelectItem>
                    <SelectItem value="2BHK">2BHK</SelectItem>
                    <SelectItem value="3BHK">3BHK</SelectItem>
                    <SelectItem value="4BHK">4BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-size_sqft">Size (sq. ft.)</Label>
                <Input
                  id="edit-size_sqft"
                  type="number"
                  value={formData.size_sqft}
                  onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })}
                  placeholder="e.g., 1200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditFlat} 
                disabled={!formData.flat_number || !formData.type || !formData.size_sqft}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Owner Modal */}
        <Dialog open={isAssignOwnerModalOpen} onOpenChange={setIsAssignOwnerModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Owner</DialogTitle>
              <DialogDescription>
                Select an owner to assign to flat {assigningFlat?.flat_number}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                {mockOwners.map((owner) => (
                  <div
                    key={owner.owner_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAssignOwner(owner.owner_id)}
                  >
                    <div>
                      <div className="font-medium">{owner.name}</div>
                      <div className="text-sm text-muted-foreground">{owner.phone}</div>
                      <div className="text-sm text-muted-foreground">{owner.email}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignOwnerModalOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Flats;
