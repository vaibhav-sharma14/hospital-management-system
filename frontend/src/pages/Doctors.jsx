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
  name: '', email: '', password: '', phone: '', department: '', specialization: '',
  qualification: '', experienceYears: 0, consultationFee: 0, status: 'active',
};

const Doctors = () => {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';

  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/doctors', { params: { page, search, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load doctors'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => {
    if (isAdmin) api.get('/departments', { params: { limit: 100 } }).then(({ data }) => setDepartments(data.data));
  }, [isAdmin]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (row) => {
    setForm({ ...emptyForm, ...row, department: row.department?._id || row.department, password: '' });
    setEditingId(row._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { password, email, ...rest } = form;
        await api.put(`/doctors/${editingId}`, rest);
        toast.success('Doctor updated');
      } else {
        await api.post('/doctors', form);
        toast.success('Doctor added');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/doctors/${deleteId}`);
      toast.success('Doctor removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'Name', accessor: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { header: 'Specialization', accessor: (r) => r.specialization },
    { header: 'Department', accessor: (r) => r.department?.name || '—' },
    { header: 'Experience', accessor: (r) => `${r.experienceYears} yrs` },
    { header: 'Fee', accessor: (r) => `₹${r.consultationFee}` },
    { header: 'Status', accessor: (r) => <Badge status={r.status} /> },
    ...(isAdmin ? [{
      header: '',
      accessor: (r) => (
        <div className="flex gap-2 justify-end">
          <button className="text-slate-400 hover:text-primary-600" onClick={() => openEdit(r)}><Pencil size={16} /></button>
          <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(r._id)}><Trash2 size={16} /></button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Doctors</h1>
          <p className="text-sm text-slate-500 mt-1">Browse specialists and manage doctor profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by name, specialization..." />
          {isAdmin && <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add doctor</button>}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No doctors found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit doctor' : 'Add doctor'} width="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required disabled={!!editingId} className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          {!editingId && (
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Department</label>
            <select required className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Specialization</label>
            <input required className="input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
          </div>
          <div>
            <label className="label">Qualification</label>
            <input className="input" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="MBBS, MD" />
          </div>
          <div>
            <label className="label">Experience (years)</label>
            <input type="number" min="0" className="input" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
          </div>
          <div>
            <label className="label">Consultation fee (₹)</label>
            <input type="number" min="0" className="input" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option><option value="on_leave">On leave</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add doctor'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will deactivate the doctor's account and remove their profile." />
    </div>
  );
};

export default Doctors;
