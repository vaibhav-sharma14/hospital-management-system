import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/UI/DataTable';
import SearchBar from '../components/UI/SearchBar';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Badge from '../components/UI/Badge';

const ROLES = ['receptionist', 'lab_technician', 'pharmacist', 'nurse', 'admin_staff'];
const emptyForm = { name: '', email: '', password: '', role: 'receptionist', phone: '', department: '', salary: '', shift: 'morning' };

const Staff = () => {
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/staff', { params: { page, search, role: roleFilter, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load staff'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, roleFilter]);
  useEffect(() => { api.get('/departments', { params: { limit: 100 } }).then(({ data }) => setDepartments(data.data)); }, []);

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
        await api.put(`/staff/${editingId}`, rest);
        toast.success('Staff member updated');
      } else {
        await api.post('/staff', form);
        toast.success('Staff member added');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/staff/${deleteId}`);
      toast.success('Staff member removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'Employee ID', accessor: (r) => <span className="font-medium text-ink">{r.employeeId}</span> },
    { header: 'Name', accessor: (r) => r.name },
    { header: 'Role', accessor: (r) => <span className="capitalize">{r.role.replace('_', ' ')}</span> },
    { header: 'Department', accessor: (r) => r.department?.name || '—' },
    { header: 'Shift', accessor: (r) => <span className="capitalize">{r.shift}</span> },
    { header: 'Status', accessor: (r) => <Badge status={r.status} /> },
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
          <h1 className="text-2xl font-display font-semibold text-ink">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage non-clinical and support staff accounts.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by name, ID..." />
          <select className="input w-auto" value={roleFilter} onChange={(e) => { setPage(1); setRoleFilter(e.target.value); }}>
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add staff</button>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No staff members found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit staff member' : 'Add staff member'}>
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
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Unassigned</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Shift</label>
            <select className="input" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
              <option value="morning">Morning</option><option value="evening">Evening</option><option value="night">Night</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Salary (₹/month)</label>
            <input type="number" min="0" className="input" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add staff'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will deactivate the staff member's account and remove their profile." />
    </div>
  );
};

export default Staff;
