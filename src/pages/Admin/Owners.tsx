
// import { useState } from 'react';
// import { AdminLayout } from '@/components/admin/AdminLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import { useToast } from '@/hooks/use-toast';
// import { 
//   UserPlus, 
//   Search, 
//   Edit, 
//   Trash2, 
//   Home, 
//   Info,
//   Building2,
//   Phone,
//   Mail
// } from 'lucide-react';

// // Mock data for owners
// const mockOwners = [
//   {
//     owner_id: 'OWNER001',
//     full_name: 'Abhinav Reddy',
//     email: 'abhinav@example.com',
//     phone: '+91-9876543210',
//     flats_assigned: ['FLAT102', 'FLAT203'],
//     status: 'Active',
//     apartments: ['Sky The White House', 'Green Valley Apartments']
//   },
//   {
//     owner_id: 'OWNER002',
//     full_name: 'Priya Sharma',
//     email: 'priya.sharma@example.com',
//     phone: '+91-9876543211',
//     flats_assigned: ['FLAT301'],
//     status: 'Active',
//     apartments: ['Sky The White House']
//   },
//   {
//     owner_id: 'OWNER003',
//     full_name: 'Rajesh Kumar',
//     email: 'rajesh.kumar@example.com',
//     phone: '+91-9876543212',
//     flats_assigned: [],
//     status: 'Inactive',
//     apartments: []
//   },
//   {
//     owner_id: 'OWNER004',
//     full_name: 'Sneha Patel',
//     email: 'sneha.patel@example.com',
//     phone: '+91-9876543213',
//     flats_assigned: ['FLAT101', 'FLAT405'],
//     status: 'Active',
//     apartments: ['Green Valley Apartments']
//   },
//   {
//     owner_id: 'OWNER005',
//     full_name: 'Vikram Singh',
//     email: 'vikram.singh@example.com',
//     phone: '+91-9876543214',
//     flats_assigned: ['FLAT502'],
//     status: 'Active',
//     apartments: ['Sky The White House']
//   }
// ];

// // Mock unassigned flats for assignment
// const mockUnassignedFlats = [
//   {
//     flat_id: 'FLAT001',
//     flat_number: 'A101',
//     apartment_name: 'Sky The White House',
//     type: '2BHK',
//     size_sqft: 1200
//   },
//   {
//     flat_id: 'FLAT002',
//     flat_number: 'B205',
//     apartment_name: 'Green Valley Apartments',
//     type: '3BHK',
//     size_sqft: 1500
//   },
//   {
//     flat_id: 'FLAT003',
//     flat_number: 'C304',
//     apartment_name: 'Sky The White House',
//     type: '2BHK',
//     size_sqft: 1100
//   }
// ];

// export default function Owners() {
//   const { toast } = useToast();
//   const [owners, setOwners] = useState(mockOwners);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterBy, setFilterBy] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
//   const [selectedOwner, setSelectedOwner] = useState(null);
//   const [selectedFlats, setSelectedFlats] = useState([]);
//   const [formData, setFormData] = useState({
//     full_name: '',
//     email: '',
//     phone: ''
//   });

//   const itemsPerPage = 10;

//   // Filter and search logic
//   const filteredOwners = owners.filter(owner => {
//     const matchesSearch = owner.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          owner.phone.includes(searchTerm) ||
//                          owner.flats_assigned.some(flat => flat.toLowerCase().includes(searchTerm.toLowerCase()));

//     const matchesFilter = filterBy === 'all' || 
//                          (filterBy === 'active' && owner.status === 'Active') ||
//                          (filterBy === 'inactive' && owner.status === 'Inactive');

//     return matchesSearch && matchesFilter;
//   });

//   const totalPages = Math.ceil(filteredOwners.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedOwners = filteredOwners.slice(startIndex, startIndex + itemsPerPage);

//   const handleAddOwner = () => {
//     const newOwner = {
//       owner_id: `OWNER${Date.now()}`,
//       ...formData,
//       flats_assigned: [],
//       status: 'Inactive',
//       apartments: []
//     };

//     setOwners([...owners, newOwner]);
//     setFormData({ full_name: '', email: '', phone: '' });
//     setIsAddModalOpen(false);
    
//     toast({
//       title: "Owner Added",
//       description: "New owner has been successfully added.",
//     });
//   };

//   const handleEditOwner = () => {
//     setOwners(owners.map(owner => 
//       owner.owner_id === selectedOwner.owner_id 
//         ? { ...owner, ...formData }
//         : owner
//     ));
    
//     setIsEditModalOpen(false);
//     setSelectedOwner(null);
    
//     toast({
//       title: "Owner Updated",
//       description: "Owner information has been successfully updated.",
//     });
//   };

//   const handleDeleteOwner = (owner) => {
//     if (owner.flats_assigned.length > 0) {
//       toast({
//         title: "Cannot Delete Owner",
//         description: "Please unassign all flats before deleting this owner.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setOwners(owners.filter(o => o.owner_id !== owner.owner_id));
    
//     toast({
//       title: "Owner Deleted",
//       description: "Owner has been successfully deleted.",
//     });
//   };

//   const openEditModal = (owner) => {
//     setSelectedOwner(owner);
//     setFormData({
//       full_name: owner.full_name,
//       email: owner.email,
//       phone: owner.phone
//     });
//     setIsEditModalOpen(true);
//   };

//   const openAssignModal = (owner) => {
//     setSelectedOwner(owner);
//     setSelectedFlats([]);
//     setIsAssignModalOpen(true);
//   };

//   const handleAssignFlats = () => {
//     // This would typically make an API call to assign flats
//     toast({
//       title: "Flats Assigned",
//       description: `${selectedFlats.length} flat(s) assigned to ${selectedOwner.full_name}`,
//     });
    
//     setIsAssignModalOpen(false);
//     setSelectedFlats([]);
//   };

//   const handleFlatSelection = (flatId, checked) => {
//     if (checked) {
//       setSelectedFlats([...selectedFlats, flatId]);
//     } else {
//       setSelectedFlats(selectedFlats.filter(id => id !== flatId));
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="space-y-6 animate-fade-in">
//         {/* Breadcrumb */}
//         <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
//           <span>Dashboard</span>
//           <span>/</span>
//           <span className="text-foreground font-medium">Owners Management</span>
//         </nav>

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Owners Management</h1>
//             <p className="text-muted-foreground mt-1">
//               Manage property owners and their flat assignments
//             </p>
//           </div>
          
//           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//             <DialogTrigger asChild>
//               <Button className="gap-2 hover-scale">
//                 <UserPlus className="h-4 w-4" />
//                 Add Owner
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="sm:max-w-md">
//               <DialogHeader>
//                 <DialogTitle>Add New Owner</DialogTitle>
//                 <DialogDescription>
//                   Enter the owner's contact information
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="full_name">Full Name</Label>
//                   <Input
//                     id="full_name"
//                     value={formData.full_name}
//                     onChange={(e) => setFormData({...formData, full_name: e.target.value})}
//                     placeholder="Enter full name"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="email">Email</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({...formData, email: e.target.value})}
//                     placeholder="Enter email address"
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="phone">Phone</Label>
//                   <Input
//                     id="phone"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                     placeholder="Enter phone number"
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleAddOwner}>Add Owner</Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Search and Filter */}
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="relative flex-1">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
//                 <Input
//                   placeholder="Search by name, email, phone, or flat..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//               <Select value={filterBy} onValueChange={setFilterBy}>
//                 <SelectTrigger className="w-full sm:w-[200px]">
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Owners</SelectItem>
//                   <SelectItem value="active">Active</SelectItem>
//                   <SelectItem value="inactive">Inactive</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Owners Table */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Owners ({filteredOwners.length})</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Owner Details</TableHead>
//                   <TableHead>Contact</TableHead>
//                   <TableHead>Assigned Flats</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {paginatedOwners.map((owner) => (
//                   <TableRow key={owner.owner_id}>
//                     <TableCell>
//                       <div>
//                         <div className="font-medium">{owner.full_name}</div>
//                         <div className="text-sm text-muted-foreground">ID: {owner.owner_id}</div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div className="space-y-1">
//                         <div className="flex items-center gap-2 text-sm">
//                           <Mail className="h-3 w-3" />
//                           {owner.email}
//                         </div>
//                         <div className="flex items-center gap-2 text-sm">
//                           <Phone className="h-3 w-3" />
//                           {owner.phone}
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       {owner.flats_assigned.length > 0 ? (
//                         <Popover>
//                           <PopoverTrigger asChild>
//                             <Button variant="ghost" size="sm" className="h-auto p-0">
//                               <div className="flex items-center gap-2">
//                                 <Building2 className="h-3 w-3" />
//                                 <span>{owner.flats_assigned.length} flat(s)</span>
//                                 <Info className="h-3 w-3" />
//                               </div>
//                             </Button>
//                           </PopoverTrigger>
//                           <PopoverContent className="w-64">
//                             <div className="space-y-2">
//                               <h4 className="font-medium">Assigned Flats</h4>
//                               {owner.flats_assigned.map((flatId, index) => (
//                                 <div key={flatId} className="text-sm">
//                                   <div className="font-medium">{flatId}</div>
//                                   <div className="text-muted-foreground">
//                                     {owner.apartments[index] || 'Unknown Apartment'}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </PopoverContent>
//                         </Popover>
//                       ) : (
//                         <span className="text-muted-foreground text-sm">No flats assigned</span>
//                       )}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={owner.status === 'Active' ? 'default' : 'secondary'}>
//                         {owner.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => openEditModal(owner)}
//                           className="gap-1"
//                         >
//                           <Edit className="h-3 w-3" />
//                           Edit
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => openAssignModal(owner)}
//                           className="gap-1"
//                         >
//                           <Home className="h-3 w-3" />
//                           Assign
//                         </Button>
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => handleDeleteOwner(owner)}
//                           disabled={owner.flats_assigned.length > 0}
//                           className="gap-1"
//                         >
//                           <Trash2 className="h-3 w-3" />
//                           Delete
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>

//             {paginatedOwners.length === 0 && (
//               <div className="text-center py-8 text-muted-foreground">
//                 No owners found matching your search criteria.
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <Pagination>
//             <PaginationContent>
//               <PaginationItem>
//                 <PaginationPrevious 
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                 />
//               </PaginationItem>
              
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                 <PaginationItem key={page}>
//                   <PaginationLink
//                     onClick={() => setCurrentPage(page)}
//                     isActive={currentPage === page}
//                     className="cursor-pointer"
//                   >
//                     {page}
//                   </PaginationLink>
//                 </PaginationItem>
//               ))}
              
//               <PaginationItem>
//                 <PaginationNext 
//                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                   className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                 />
//               </PaginationItem>
//             </PaginationContent>
//           </Pagination>
//         )}

//         {/* Edit Owner Modal */}
//         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Edit Owner</DialogTitle>
//               <DialogDescription>
//                 Update the owner's information
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="edit_full_name">Full Name</Label>
//                 <Input
//                   id="edit_full_name"
//                   value={formData.full_name}
//                   onChange={(e) => setFormData({...formData, full_name: e.target.value})}
//                   placeholder="Enter full name"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="edit_email">Email</Label>
//                 <Input
//                   id="edit_email"
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({...formData, email: e.target.value})}
//                   placeholder="Enter email address"
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="edit_phone">Phone</Label>
//                 <Input
//                   id="edit_phone"
//                   value={formData.phone}
//                   onChange={(e) => setFormData({...formData, phone: e.target.value})}
//                   placeholder="Enter phone number"
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleEditOwner}>Update Owner</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Assign Flats Modal */}
//         <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
//           <DialogContent className="sm:max-w-lg">
//             <DialogHeader>
//               <DialogTitle>Assign Flats to {selectedOwner?.full_name}</DialogTitle>
//               <DialogDescription>
//                 Select unassigned flats to assign to this owner
//               </DialogDescription>
//             </DialogHeader>
//             <div className="max-h-96 overflow-y-auto space-y-4">
//               {mockUnassignedFlats.map((flat) => (
//                 <div key={flat.flat_id} className="flex items-center space-x-3 p-3 border rounded-lg">
//                   <Checkbox
//                     id={flat.flat_id}
//                     checked={selectedFlats.includes(flat.flat_id)}
//                     onCheckedChange={(checked) => handleFlatSelection(flat.flat_id, checked)}
//                   />
//                   <label htmlFor={flat.flat_id} className="flex-1 cursor-pointer">
//                     <div className="font-medium">{flat.flat_number}</div>
//                     <div className="text-sm text-muted-foreground">
//                       {flat.apartment_name} • {flat.type} • {flat.size_sqft} sq ft
//                     </div>
//                   </label>
//                 </div>
//               ))}
              
//               {mockUnassignedFlats.length === 0 && (
//                 <div className="text-center py-8 text-muted-foreground">
//                   No unassigned flats available
//                 </div>
//               )}
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
//                 Cancel
//               </Button>
//               <Button 
//                 onClick={handleAssignFlats}
//                 disabled={selectedFlats.length === 0}
//               >
//                 Assign {selectedFlats.length} Flat(s)
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </AdminLayout>
//   );
// }
