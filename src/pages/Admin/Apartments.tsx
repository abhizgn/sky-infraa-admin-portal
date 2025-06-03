import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Plus, Search, Edit, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  flat_no: string;
  owner_name: string;
  status: 'Occupied' | 'Vacant';
}

const Apartments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  // Mock data - replace with API calls
  const [apartments, setApartments] = useState<Apartment[]>([
    {
      apartment_id: 'APT001',
      name: 'Sky The White House',
      location: 'Mallampet',
      total_flats: 40,
      created_at: '2024-01-15T10:20:00Z',
    },
    {
      apartment_id: 'APT002',
      name: 'Sunrise Towers',
      location: 'Kompally',
      total_flats: 32,
      created_at: '2024-02-10T14:30:00Z',
    },
    {
      apartment_id: 'APT003',
      name: 'Green Valley',
      location: 'Miyapur',
      total_flats: 24,
      created_at: '2024-03-05T09:15:00Z',
    },
  ]);

  // Mock flats data
  const mockFlats: Record<string, Flat[]> = {
    APT001: [
      { flat_id: 'F001', flat_no: 'A-101', owner_name: 'Rajesh Kumar', status: 'Occupied' },
      { flat_id: 'F002', flat_no: 'A-102', owner_name: 'Priya Sharma', status: 'Occupied' },
      { flat_id: 'F003', flat_no: 'A-103', owner_name: '', status: 'Vacant' },
    ],
    APT002: [
      { flat_id: 'F004', flat_no: 'B-201', owner_name: 'Amit Patel', status: 'Occupied' },
      { flat_id: 'F005', flat_no: 'B-202', owner_name: 'Sneha Reddy', status: 'Occupied' },
    ],
    APT003: [
      { flat_id: 'F006', flat_no: 'C-301', owner_name: 'Vikram Singh', status: 'Occupied' },
    ],
  };

  const itemsPerPage = 10;
  const filteredApartments = apartments.filter(apartment =>
    apartment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apartment.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApartments = filteredApartments.slice(startIndex, startIndex + itemsPerPage);

  const toggleExpandRow = (apartmentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(apartmentId)) {
      newExpanded.delete(apartmentId);
    } else {
      newExpanded.add(apartmentId);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddApartment = () => {
    const newApartment: Apartment = {
      apartment_id: `APT${String(apartments.length + 1).padStart(3, '0')}`,
      name: formData.name,
      location: formData.location,
      total_flats: 0,
      created_at: new Date().toISOString(),
    };
    setApartments([...apartments, newApartment]);
    setFormData({ name: '', location: '' });
    setIsAddModalOpen(false);
  };

  const handleEditApartment = () => {
    if (!editingApartment) return;
    
    setApartments(apartments.map(apt => 
      apt.apartment_id === editingApartment.apartment_id 
        ? { ...apt, name: formData.name, location: formData.location }
        : apt
    ));
    setFormData({ name: '', location: '' });
    setEditingApartment(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteApartment = (apartmentId: string) => {
    setApartments(apartments.filter(apt => apt.apartment_id !== apartmentId));
  };

  const openEditModal = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setFormData({ name: apartment.name, location: apartment.location });
    setIsEditModalOpen(true);
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
              <BreadcrumbPage>Apartments Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Apartments Management</h1>
            <p className="text-muted-foreground">
              Manage apartment buildings and their associated flats
            </p>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Apartment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Apartment</DialogTitle>
                <DialogDescription>
                  Enter the details for the new apartment building.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Apartment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Sky The White House"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Mallampet"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddApartment} disabled={!formData.name || !formData.location}>
                  Add Apartment
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
                placeholder="Search by apartment name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Apartments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Apartments ({filteredApartments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center"># of Flats</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApartments.map((apartment) => (
                  <React.Fragment key={apartment.apartment_id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandRow(apartment.apartment_id)}
                          className="h-8 w-8 p-0"
                        >
                          {expandedRows.has(apartment.apartment_id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{apartment.name}</TableCell>
                      <TableCell>{apartment.location}</TableCell>
                      <TableCell className="text-center">{apartment.total_flats}</TableCell>
                      <TableCell>{formatDate(apartment.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/apartments/${apartment.apartment_id}/flats`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Flats
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(apartment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the apartment
                                  "{apartment.name}" and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteApartment(apartment.apartment_id)}
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
                    {expandedRows.has(apartment.apartment_id) && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="p-4">
                            <h4 className="font-medium mb-3">Flats in {apartment.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {mockFlats[apartment.apartment_id]?.map((flat) => (
                                <div key={flat.flat_id} className="p-3 bg-background rounded-md border">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{flat.flat_no}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                      flat.status === 'Occupied' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {flat.status}
                                    </span>
                                  </div>
                                  {flat.owner_name && (
                                    <p className="text-sm text-muted-foreground mt-1">{flat.owner_name}</p>
                                  )}
                                </div>
                              )) || (
                                <p className="text-muted-foreground col-span-full">No flats added yet</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
              <DialogTitle>Edit Apartment</DialogTitle>
              <DialogDescription>
                Update the apartment details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Apartment Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sky The White House"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Mallampet"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditApartment} disabled={!formData.name || !formData.location}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Apartments;
