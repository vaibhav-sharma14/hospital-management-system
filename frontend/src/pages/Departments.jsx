import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/UI/DataTable';
import SearchBar from '../components/UI/SearchBar';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Badge from '../components/UI/Badge';

const emptyForm = { name: '', description: '', location: '', isActive: true };

const Departments = () => {
  const [rows, setRows] = useState([]);
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
      const { data } = await api.get('/departments', { params: { page, search, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load departments');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm(row); setEditingId(row._id); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/departments/${editingId}`, form); toast.success('Department updated'); }
      else { await api.post('/departments', form); toast.success('Department added'); }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${deleteId}`);
      toast.success('Department removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'Name', accessor: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { header: 'Location', accessor: (r) => r.location || '—' },
    { header: 'Head of Department', accessor: (r) => r.headOfDepartment?.name || '—' },
    { header: 'Status', accessor: (r) => <Badge status={r.isActive ? 'active' : 'inactive'} /> },
    { header: '', accessor: (r) => (
      <div className="flex gap-2 justify-end">
        <button className="text-slate-400 hover:text-primary-600" onClick={() => openEdit(r)}><Pencil size={16} /></button>
        <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(r._id)}><Trash2 size={16} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">Organize the hospital into clinical departments.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search departments..." />
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add department</button>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No departments found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit department' : 'Add department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Department name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Block A, 2nd Floor" />
          </div>
          <div className="flex items-center gap-2">
            <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="isActive" className="text-sm text-slate-600">Active department</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add department'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently remove the department." />
    </div>
  );
};

export default Departments;
