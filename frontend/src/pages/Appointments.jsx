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

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

const emptyForm = { patient: '', doctor: '', department: '', date: '', timeSlot: '', reason: '', status: 'scheduled' };

const Appointments = () => {
  const { user } = useAuth();
  const canManage = ['admin', 'receptionist', 'doctor'].includes(user.role);

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
      const { data } = await api.get('/appointments', { params: { page, search, status: statusFilter, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load appointments'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter]);
  useEffect(() => {
    api.get('/doctors', { params: { limit: 100 } }).then(({ data }) => setDoctors(data.data));
    if (user.role !== 'patient') api.get('/patients', { params: { limit: 100 } }).then(({ data }) => setPatients(data.data));
  }, [user.role]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (row) => {
    setForm({
      patient: row.patient?._id, doctor: row.doctor?._id, department: row.department?._id,
      date: row.date?.slice(0, 10), timeSlot: row.timeSlot, reason: row.reason, status: row.status,
    });
    setEditingId(row._id);
    setModalOpen(true);
  };

  const handleDoctorChange = (doctorId) => {
    const doc = doctors.find((d) => d._id === doctorId);
    setForm({ ...form, doctor: doctorId, department: doc?.department?._id || doc?.department });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (user.role === 'patient') payload.patient = user.patientProfile;
      if (editingId) { await api.put(`/appointments/${editingId}`, payload); toast.success('Appointment updated'); }
      else { await api.post('/appointments', payload); toast.success('Appointment booked'); }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/appointments/${deleteId}`);
      toast.success('Appointment removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'ID', accessor: (r) => <span className="font-medium text-ink">{r.appointmentId}</span> },
    { header: 'Patient', accessor: (r) => r.patient?.name || '—' },
    { header: 'Doctor', accessor: (r) => r.doctor?.name || '—' },
    { header: 'Date', accessor: (r) => new Date(r.date).toLocaleDateString() },
    { header: 'Time', accessor: (r) => r.timeSlot },
    { header: 'Status', accessor: (r) => <Badge status={r.status} /> },
    ...(canManage ? [{
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
          <h1 className="text-2xl font-display font-semibold text-ink">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Book and track patient appointments across all doctors.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by appointment ID..." />
          <select className="input w-auto" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            <option value="">All statuses</option>
            {['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Book appointment</button>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No appointments found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit appointment' : 'Book appointment'}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          {user.role !== 'patient' && (
            <div className="sm:col-span-2">
              <label className="label">Patient</label>
              <select required className="input" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                <option value="">Select patient</option>
                {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="label">Doctor</label>
            <select required className="input" value={form.doctor} onChange={(e) => handleDoctorChange(e.target.value)}>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" required className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="label">Time slot</label>
            <select required className="input" value={form.timeSlot} onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}>
              <option value="">Select time</option>
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Reason for visit</label>
            <textarea className="input" rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          {editingId && (
            <div className="sm:col-span-2">
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Book appointment'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently cancel and remove the appointment." />
    </div>
  );
};

export default Appointments;
