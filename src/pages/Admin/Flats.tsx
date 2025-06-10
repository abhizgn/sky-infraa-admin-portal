import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, UserMinus, Search, UserPlus, Trash2 } from 'lucide-react';
import API from '@/lib/api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Apartment {
  _id: string;
  name: string;
  location?: string;
  createdAt?: string;
  totalFloors?: number;
  units?: number;
  address?: string;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  flatId?: string | null;
}

interface Flat {
  _id: string;
  flatNumber: string;
  floor: number;
  type: '1BHK' | '2BHK' | '3BHK';
  areaSqft: number;
  isOccupied: boolean;
  ownerId?: string | null;
  owner?: {
    _id: string;
  name: string;
  phone: string;
  email: string;
  } | null;
  apartmentId: string;
  apartment?: {
    _id: string;
    name: string;
  } | null;
  maintenanceCharge?: number;
}

export function Flats() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFlat, setCurrentFlat] = useState<Partial<Flat>>({
    flatNumber: '',
    floor: 1,
    type: '2BHK',
    areaSqft: 1000
  });
  const [unassignModal, setUnassignModal] = useState<{ open: boolean; flat?: Flat }>({ open: false });
  const [assignOwnerModal, setAssignOwnerModal] = useState<{ open: boolean; flat?: Flat }>({ open: false });
  const [selectedOwnerForAssignment, setSelectedOwnerForAssignment] = useState<string>('');
  const [unassignedOwners, setUnassignedOwners] = useState<Owner[]>([]);
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const response = await API.get<Apartment[]>('/admin/apartments');
        setApartments(response.data);
        const apartmentIdFromUrl = params.get('apartmentId');
        if (apartmentIdFromUrl) {
          setSelectedApartment(apartmentIdFromUrl);
        } else if (response.data.length > 0) {
          setSelectedApartment(response.data[0]._id);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch apartments',
          variant: 'destructive',
        });
      }
    };
    fetchApartments();
  }, []);

  useEffect(() => {
    if (selectedApartment) {
      fetchFlats(selectedApartment);
      navigate(`?apartmentId=${selectedApartment}`, { replace: true });
    } else {
      setFlats([]);
      navigate(location.pathname, { replace: true });
    }
  }, [selectedApartment]);

  useEffect(() => {
    if (assignOwnerModal.open) {
      const fetchUnassignedOwners = async () => {
        try {
          console.log('Fetching unassigned owners...');
          const response = await API.get<Owner[]>('/admin/owners/unassigned');
          console.log('Unassigned owners response:', response.data);
          setUnassignedOwners(response.data);
        } catch (error) {
          console.error('Failed to fetch unassigned owners:', error);
          toast({
            title: 'Error',
            description: 'Failed to fetch unassigned owners',
            variant: 'destructive',
          });
        }
      };
      fetchUnassignedOwners();
    } else {
      setSelectedOwnerForAssignment('');
      setUnassignedOwners([]);
    }
  }, [assignOwnerModal.open]);

  const fetchFlats = async (aptId: string) => {
    try {
      const response = await API.get<Flat[]>(`/admin/flats?apartmentId=${aptId}`);
      setFlats(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch flats',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!currentFlat.flatNumber || !selectedApartment) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }

      const flatData = {
        flatNumber: currentFlat.flatNumber,
        floor: currentFlat.floor || 1,
        type: currentFlat.type || '2BHK',
        areaSqft: currentFlat.areaSqft || 1000,
        apartmentId: selectedApartment,
      };

      console.log('Submitting flat data:', flatData);

      if (currentFlat._id) {
        const response = await API.put(`/admin/flats/${currentFlat._id}`, flatData);
        console.log('Update response:', response.data);
        toast({
          title: 'Success',
          description: 'Flat updated successfully',
        });
      } else {
        const response = await API.post('/admin/flats', flatData);
        console.log('Create response:', response.data);
        toast({
          title: 'Success',
          description: 'Flat created successfully',
        });
      }

      setIsModalOpen(false);
      setCurrentFlat({
        flatNumber: '',
        floor: 1,
        type: '2BHK',
        areaSqft: 1000
      });

      await fetchFlats(selectedApartment);
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (flatId: string) => {
    try {
      await API.delete(`/admin/flats/${flatId}`);
      toast({
        title: 'Success',
        description: 'Flat deleted successfully',
      });
      fetchFlats(selectedApartment);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete flat',
        variant: 'destructive',
      });
    }
  };

  const handleUnassign = async (flat: Flat) => {
    try {
      await API.put(`/admin/flats/${flat._id}/unassign-owner`);
      toast({
        title: 'Success',
        description: 'Owner unassigned successfully',
      });
      fetchFlats(selectedApartment);
      setUnassignModal({ open: false });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unassign owner',
        variant: 'destructive',
      });
    }
  };

  const handleAssignOwner = async () => {
    if (!assignOwnerModal.flat || !selectedOwnerForAssignment) {
      toast({
        title: 'Error',
        description: 'Please select an owner to assign.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await API.put(`/admin/flats/${assignOwnerModal.flat._id}/assign-owner`, {
        ownerId: selectedOwnerForAssignment,
      });
      toast({
        title: 'Success',
        description: 'Owner assigned successfully!',
      });
      setAssignOwnerModal({ open: false });
      setSelectedOwnerForAssignment('');
      fetchFlats(selectedApartment);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign owner.',
        variant: 'destructive',
      });
      console.error('Assign owner error:', error);
    }
  };

  const filteredFlats = flats.filter(flat =>
    flat.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
    flat.type.toLowerCase().includes(search.toLowerCase()) ||
    (flat.owner?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (flat: Flat) => {
    setCurrentFlat(flat);
    setIsModalOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Flats Management</h1>
          <Button onClick={() => {
            setCurrentFlat({
              flatNumber: '',
              floor: 1,
              type: '2BHK',
              areaSqft: 1000
            });
            setIsModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
                Add Flat
              </Button>
                </div>

        <div className="mb-6 space-y-4">
          <Select
            value={selectedApartment}
            onValueChange={setSelectedApartment}
          >
                    <SelectTrigger>
              <SelectValue placeholder="Select Apartment" />
                    </SelectTrigger>
                    <SelectContent>
              {apartments.map((apt) => (
                <SelectItem key={apt._id} value={apt._id}>
                  {apt.name}
                </SelectItem>
              ))}
                    </SelectContent>
                  </Select>

          {selectedApartment && (
        <Card>
          <CardHeader>
                <CardTitle>{apartments.find(apt => apt._id === selectedApartment)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
                <p>
                  <strong>Address:</strong>{' '}
                  {apartments.find(apt => apt._id === selectedApartment)?.location || 'N/A'}
                </p>
                <p>
                  <strong>Total Units:</strong>{' '}
                  {apartments.find(apt => apt._id === selectedApartment)?.units || 'N/A'}
                </p>
                <p>
                  <strong>Total Floors:</strong>{' '}
                  {apartments.find(apt => apt._id === selectedApartment)?.totalFloors || 'N/A'}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
              type="text"
              placeholder="Search flats by number, type, or owner..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              />
            </div>
        </div>

        <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Flat Number</TableHead>
                <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                <TableHead>Area (sqft)</TableHead>
                <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredFlats.length > 0 ? (
                filteredFlats.map((flat) => (
                  <TableRow key={flat._id}>
                    <TableCell className="font-medium">{flat.flatNumber}</TableCell>
                    <TableCell>{flat.floor}</TableCell>
                    <TableCell>{flat.type}</TableCell>
                    <TableCell>{flat.areaSqft}</TableCell>
                    <TableCell>
                      <Badge variant={flat.isOccupied ? 'default' : 'secondary'}>
                        {flat.isOccupied ? 'Occupied' : 'Vacant'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {flat.owner ? flat.owner.name : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right flex space-x-2 justify-end">
                          <Button
                        variant="ghost"
                            size="sm"
                        onClick={() => handleEdit(flat)}
                          >
                        <Pencil className="h-4 w-4" />
                          </Button>
                      {!flat.isOccupied ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAssignOwnerModal({ open: true, flat })}
                        >
                          <UserPlus className="h-4 w-4" />
                              </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUnassignModal({ open: true, flat })}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                            <Button 
                        variant="ghost"
                              size="sm"
                        onClick={() => handleDelete(flat._id)}
                            >
                        <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No flats found for this apartment.
                  </TableCell>
                </TableRow>
              )}
              </TableBody>
            </Table>
              </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentFlat._id ? 'Edit Flat' : 'Add New Flat'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="flatNumber" className="text-right">
                  Flat Number
                </Label>
                <Input
                  id="flatNumber"
                  value={currentFlat.flatNumber || ''}
                  onChange={(e) =>
                    setCurrentFlat({ ...currentFlat, flatNumber: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="floor" className="text-right">
                  Floor
                </Label>
                <Input
                  id="floor"
                  type="number"
                  value={currentFlat.floor || 1}
                  onChange={(e) =>
                    setCurrentFlat({ ...currentFlat, floor: parseInt(e.target.value) })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={currentFlat.type || '2BHK'}
                  onValueChange={(value) =>
                    setCurrentFlat({ ...currentFlat, type: value as '1BHK' | '2BHK' | '3BHK' })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1BHK">1BHK</SelectItem>
                    <SelectItem value="2BHK">2BHK</SelectItem>
                    <SelectItem value="3BHK">3BHK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="areaSqft" className="text-right">
                  Area (sqft)
                </Label>
                <Input
                  id="areaSqft"
                  type="number"
                  value={currentFlat.areaSqft || 1000}
                  onChange={(e) =>
                    setCurrentFlat({ ...currentFlat, areaSqft: parseInt(e.target.value) })
                  }
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit}>
                {currentFlat._id ? 'Save Changes' : 'Add Flat'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={unassignModal.open} onOpenChange={() => setUnassignModal({ open: false })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unassign Owner</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to unassign the owner from flat "{unassignModal.flat?.flatNumber}"?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUnassignModal({ open: false })}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => unassignModal.flat && handleUnassign(unassignModal.flat)}>
                Unassign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog 
          open={assignOwnerModal.open} 
          onOpenChange={(open) => {
            setAssignOwnerModal({ open });
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign Owner to Flat {assignOwnerModal.flat?.flatNumber}</DialogTitle>
              <DialogDescription>
                Select an owner to assign to this flat.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner-select" className="text-right">
                  Select Owner
                </Label>
                <Select
                  value={selectedOwnerForAssignment}
                  onValueChange={setSelectedOwnerForAssignment}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedOwners.length > 0 ? (
                      unassignedOwners.map((owner) => (
                        <SelectItem key={owner._id} value={owner._id}>
                          {owner.name} ({owner.email})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-owners-found" disabled>
                        No unassigned owners available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOwnerModal({ open: false })}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignOwner}
                disabled={!selectedOwnerForAssignment}
              >
                Assign Owner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
