import { useEffect, useState } from 'react';
import API from '@/lib/api/api';
import { Button } from '@/components/ui/button';

export default function OwnerAssignment() {
  const [apartments, setApartments] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [selectedApartment, setSelectedApartment] = useState('');
  const [selectedFlat, setSelectedFlat] = useState('');
  const [ownerForm, setOwnerForm] = useState({ name: '', email: '', phone: '' });
  const [assignedOwners, setAssignedOwners] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    API.get('/admin/apartments').then(res => setApartments(res.data));
  }, []);

  useEffect(() => {
    if (selectedApartment) {
      API.get(`/admin/flats?apartmentId=${selectedApartment}`).then(res => setFlats(res.data));
      API.get(`/admin/owners?apartmentId=${selectedApartment}`).then(res => setAssignedOwners(res.data));
    }
  }, [selectedApartment]);

  const handleSubmit = async () => {
    if (!selectedFlat || !ownerForm.name || !ownerForm.email || !ownerForm.phone) return;
    const endpoint = editingId
      ? `/admin/owners/${editingId}`
      : `/admin/owners`;

    await API[editingId ? 'put' : 'post'](endpoint, {
      ...ownerForm,
      flatId: selectedFlat,
    });

    setOwnerForm({ name: '', email: '', phone: '' });
    setEditingId(null);
    setSelectedFlat('');
    API.get(`/admin/owners?apartmentId=${selectedApartment}`).then(res => setAssignedOwners(res.data));
  };

  const handleEdit = (owner: any) => {
    setEditingId(owner._id);
    setSelectedFlat(owner.flatId?._id || '');
    setOwnerForm({ name: owner.name, email: owner.email, phone: owner.phone });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this owner?")) return;
    await API.delete(`/admin/owners/${id}`);
    setAssignedOwners(prev => prev.filter(o => o._id !== id));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-xl font-bold">Assign Owners</h2>
        <select value={selectedApartment} onChange={e => setSelectedApartment(e.target.value)} className="border px-3 py-1 rounded">
          <option value="">Select Apartment</option>
          {apartments.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      </div>

      {selectedApartment && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <select value={selectedFlat} onChange={e => setSelectedFlat(e.target.value)} className="w-full border p-2 rounded">
              <option value="">Select Flat</option>
              {flats.map(f => <option key={f._id} value={f._id}>{f.flatNumber}</option>)}
            </select>
            <input placeholder="Owner Name" value={ownerForm.name} onChange={e => setOwnerForm({ ...ownerForm, name: e.target.value })} className="w-full border p-2 rounded mt-2" />
            <input placeholder="Email" value={ownerForm.email} onChange={e => setOwnerForm({ ...ownerForm, email: e.target.value })} className="w-full border p-2 rounded mt-2" />
            <input placeholder="Phone" value={ownerForm.phone} onChange={e => setOwnerForm({ ...ownerForm, phone: e.target.value })} className="w-full border p-2 rounded mt-2" />
            <Button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded mt-3">
              {editingId ? 'Update' : 'Assign'} Owner
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Assigned Owners</h3>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr><th className="p-2">Flat</th><th>Name</th><th>Phone</th><th>Email</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {assignedOwners.map(o => (
                  <tr key={o._id} className="border-t">
                    <td className="p-2">{o.flatId?.flatNumber}</td>
                    <td>{o.name}</td>
                    <td>{o.phone}</td>
                    <td>{o.email}</td>
                    <td>
                      <Button onClick={() => handleEdit(o)} className="text-blue-600 px-2" variant="ghost">✏️</Button>
                      <Button onClick={() => handleDelete(o._id)} className="text-red-600 px-2" variant="ghost">🗑</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
