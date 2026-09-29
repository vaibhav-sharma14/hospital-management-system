import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/UI/DataTable';
import SearchBar from '../components/UI/SearchBar';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Badge from '../components/UI/Badge';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  name: '', email: '', phone: '', gender: 'male', dateOfBirth: '', bloodGroup: 'unknown', address: '',
  emergencyContactName: '', emergencyContactPhone: '', status: 'active',
};

const Patients = () => {
  const { user } = useAuth();
  const canManage = ['admin', 'receptionist', 'doctor'].includes(user.role);

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients', { params: { page, search, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, [page, search]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (row) => {
    setForm({ ...emptyForm, ...row, dateOfBirth: row.dateOfBirth?.slice(0, 10) });
    setEditingId(row._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
        toast.success('Patient updated');
      } else {
        await api.post('/patients', form);
        toast.success('Patient added');
      }
      setModalOpen(false);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/patients/${deleteId}`);
      toast.success('Patient removed');
      setDeleteId(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete patient');
    }
  };

  const columns = [
    { header: 'Patient ID', accessor: (r) => <span className="font-medium text-ink">{r.patientId}</span> },
    { header: 'Name', accessor: (r) => r.name },
    { header: 'Phone', accessor: (r) => r.phone },
    { header: 'Gender', accessor: (r) => <span className="capitalize">{r.gender}</span> },
    { header: 'Blood Group', accessor: (r) => r.bloodGroup },
    { header: 'Status', accessor: (r) => <Badge status={r.status} /> },
    ...(canManage ? [{
      header: '',
      accessor: (r) => (
        <div className="flex gap-2 justify-end">
          <button className="text-slate-400 hover:text-primary-600" onClick={() => openEdit(r)}><Pencil size={16} /></button>
          {user.role === 'admin' && (
            <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(r._id)}><Trash2 size={16} /></button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Patients</h1>
          <p className="text-sm text-slate-500 mt-1">Manage patient records, demographics and history.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by name, phone, ID..." />
          {canManage && (
            <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add patient</button>
          )}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No patients found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit patient' : 'Add patient'}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input required className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Date of birth</label>
            <input type="date" required className="input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div>
            <label className="label">Blood group</label>
            <select className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
              {['unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option><option value="admitted">Admitted</option><option value="discharged">Discharged</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="label">Emergency contact name</label>
            <input className="input" value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
          </div>
          <div>
            <label className="label">Emergency contact phone</label>
            <input className="input" value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add patient'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        message="This will permanently remove the patient record. This action cannot be undone."
      />
    </div>
  );
};

export default Patients;
