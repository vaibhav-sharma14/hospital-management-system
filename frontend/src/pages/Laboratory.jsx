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

const STATUSES = ['pending', 'sample_collected', 'in_progress', 'completed', 'cancelled'];
const emptyForm = { patient: '', doctor: '', testName: '', testType: '', cost: 0, status: 'pending', result: '', notes: '' };

const Laboratory = () => {
  const { user } = useAuth();
  const canManage = ['admin', 'lab_technician'].includes(user.role);
  const canCreate = ['admin', 'doctor', 'lab_technician'].includes(user.role);

  const [rows, setRows] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/lab-tests', { params: { page, search, status: statusFilter, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load lab tests'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter]);
  useEffect(() => {
    if (canCreate) {
      api.get('/patients', { params: { limit: 100 } }).then(({ data }) => setPatients(data.data));
      api.get('/doctors', { params: { limit: 100 } }).then(({ data }) => setDoctors(data.data));
    }
  }, [canCreate]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (row) => {
    setForm({ ...emptyForm, ...row, patient: row.patient?._id, doctor: row.doctor?._id });
    setEditingId(row._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/lab-tests/${editingId}`, form); toast.success('Lab test updated'); }
      else { await api.post('/lab-tests', form); toast.success('Lab test ordered'); }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/lab-tests/${deleteId}`);
      toast.success('Lab test removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'Test ID', accessor: (r) => <span className="font-medium text-ink">{r.testId}</span> },
    { header: 'Patient', accessor: (r) => r.patient?.name || '—' },
    { header: 'Test', accessor: (r) => r.testName },
    { header: 'Cost', accessor: (r) => `₹${r.cost}` },
    { header: 'Status', accessor: (r) => <Badge status={r.status} /> },
    { header: '', accessor: (r) => (
      <div className="flex gap-2 justify-end">
        {canManage && <button className="text-slate-400 hover:text-primary-600" onClick={() => openEdit(r)}><Pencil size={16} /></button>}
        {canManage && <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(r._id)}><Trash2 size={16} /></button>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Laboratory</h1>
          <p className="text-sm text-slate-500 mt-1">Order, track and report diagnostic lab tests.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by test name, ID..." />
          <select className="input w-auto" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          {canCreate && <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Order test</button>}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No lab tests found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Update lab test' : 'Order lab test'}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Patient</label>
            <select required disabled={!!editingId} className="input" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Ordering doctor</label>
            <select className="input" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Test name</label>
            <input required className="input" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} placeholder="Complete Blood Count" />
          </div>
          <div>
            <label className="label">Test type</label>
            <input className="input" value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })} placeholder="Blood / Urine / Imaging" />
          </div>
          <div>
            <label className="label">Cost (₹)</label>
            <input type="number" min="0" className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Result</label>
            <textarea className="input" rows={3} value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} placeholder="Enter result findings once testing is complete" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Order test'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently remove the lab test record." />
    </div>
  );
};

export default Laboratory;
