import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Home } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/components/ui/use-toast';
import API from '@/lib/api/api';
import { useNavigate } from 'react-router-dom';

interface Apartment {
  _id: string;
  name: string;
  location: string;
  totalFloors: number;
  totalFlats: number;
  createdAt: string;
}

const Apartments = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    totalFloors: 1
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchApartments = async () => {
    try {
      const response = await API.get<Apartment[]>('/admin/apartments');
      setApartments(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch apartments',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.location) {
        toast({
          title: 'Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }

      if (editingId) {
        await API.put(`/admin/apartments/${editingId}`, form);
        toast({
          title: 'Success',
          description: 'Apartment updated successfully',
        });
      } else {
        await API.post('/admin/apartments', form);
        toast({
          title: 'Success',
          description: 'Apartment created successfully',
        });
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', location: '', totalFloors: 1 });
      fetchApartments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Operation failed',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (apartment: Apartment) => {
    setForm({
      name: apartment.name,
      location: apartment.location,
      totalFloors: apartment.totalFloors,
    });
    setEditingId(apartment._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this apartment?')) return;

    try {
      await API.delete(`/admin/apartments/${id}`);
      toast({
        title: 'Success',
        description: 'Apartment deleted successfully',
      });
      fetchApartments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete apartment',
        variant: 'destructive',
      });
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

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Apartment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Apartment' : 'Add New Apartment'}
                </DialogTitle>
                <DialogDescription>
                  Enter the details for the new apartment building.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Apartment Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Sky The White House"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g., Mallampet"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalFloors">Total Floors</Label>
                  <Input
                    id="totalFloors"
                    type="number"
                    min="1"
                    value={form.totalFloors}
                    onChange={(e) => setForm({ ...form, totalFloors: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!form.name || !form.location}>
                  {editingId ? 'Update' : 'Create'}
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="max-w-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Apartments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Apartments ({apartments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead># of Flats</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell>
                      <span className="font-semibold">{apt.name}</span>
                    </TableCell>
                    <TableCell>{apt.location}</TableCell>
                    <TableCell>{apt.totalFlats}</TableCell>
                    <TableCell>{new Date(apt.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => navigate(`/admin/flats?apartmentId=${apt._id}`)}
                        >
                          <Home className="h-3 w-3"/> View Flats
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(apt)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(apt._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Apartments;
