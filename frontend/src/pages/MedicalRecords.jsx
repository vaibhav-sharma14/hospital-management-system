import { useEffect, useState } from 'react';
import { Plus, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/UI/DataTable';
import SearchBar from '../components/UI/SearchBar';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  patient: '', doctor: '', symptoms: '', diagnosis: '', treatment: '', notes: '',
  vitals: { temperature: '', bloodPressure: '', heartRate: '', weight: '', height: '' },
};

const MedicalRecords = () => {
  const { user } = useAuth();
  const canManage = ['admin', 'doctor'].includes(user.role);

  const [rows, setRows] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/medical-records', { params: { page, search, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load medical records'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => {
    if (canManage) {
      api.get('/patients', { params: { limit: 100 } }).then(({ data }) => setPatients(data.data));
      api.get('/doctors', { params: { limit: 100 } }).then(({ data }) => setDoctors(data.data));
    }
  }, [canManage]);

  const openCreate = () => { setForm(emptyForm); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medical-records', form);
      toast.success('Medical record added');
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/medical-records/${deleteId}`);
      toast.success('Record removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'Patient', accessor: (r) => r.patient?.name || '—' },
    { header: 'Doctor', accessor: (r) => r.doctor?.name || '—' },
    { header: 'Diagnosis', accessor: (r) => r.diagnosis || '—' },
    { header: 'Visit date', accessor: (r) => new Date(r.visitDate).toLocaleDateString() },
    { header: '', accessor: (r) => (
      <div className="flex gap-2 justify-end">
        <button className="text-slate-400 hover:text-primary-600" onClick={() => setViewing(r)}><Eye size={16} /></button>
        {canManage && <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(r._id)}><Trash2 size={16} /></button>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Medical Records</h1>
          <p className="text-sm text-slate-500 mt-1">Comprehensive visit history and clinical notes.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by diagnosis..." />
          {canManage && <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add record</button>}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No medical records found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add medical record" width="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Patient</label>
            <select required className="input" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Doctor</label>
            <select required className="input" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Symptoms</label>
            <textarea className="input" rows={2} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Diagnosis</label>
            <input className="input" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Treatment</label>
            <textarea className="input" rows={2} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
          </div>

          <div className="sm:col-span-2 grid grid-cols-5 gap-2">
            <input className="input" placeholder="Temp (°F)" value={form.vitals.temperature} onChange={(e) => setForm({ ...form, vitals: { ...form.vitals, temperature: e.target.value } })} />
            <input className="input" placeholder="BP (e.g. 120/80)" value={form.vitals.bloodPressure} onChange={(e) => setForm({ ...form, vitals: { ...form.vitals, bloodPressure: e.target.value } })} />
            <input className="input" placeholder="Heart rate" value={form.vitals.heartRate} onChange={(e) => setForm({ ...form, vitals: { ...form.vitals, heartRate: e.target.value } })} />
            <input className="input" placeholder="Weight (kg)" value={form.vitals.weight} onChange={(e) => setForm({ ...form, vitals: { ...form.vitals, weight: e.target.value } })} />
            <input className="input" placeholder="Height (cm)" value={form.vitals.height} onChange={(e) => setForm({ ...form, vitals: { ...form.vitals, height: e.target.value } })} />
          </div>

          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save record</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Medical record details">
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-slate-400">Patient</p><p className="font-medium text-ink">{viewing.patient?.name}</p></div>
              <div><p className="text-slate-400">Doctor</p><p className="font-medium text-ink">{viewing.doctor?.name}</p></div>
            </div>
            <div><p className="text-slate-400">Symptoms</p><p className="text-ink">{viewing.symptoms || '—'}</p></div>
            <div><p className="text-slate-400">Diagnosis</p><p className="text-ink">{viewing.diagnosis || '—'}</p></div>
            <div><p className="text-slate-400">Treatment</p><p className="text-ink">{viewing.treatment || '—'}</p></div>
            {viewing.vitals && (
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg">
                <div><p className="text-slate-400 text-xs">Temp</p><p>{viewing.vitals.temperature || '—'}</p></div>
                <div><p className="text-slate-400 text-xs">BP</p><p>{viewing.vitals.bloodPressure || '—'}</p></div>
                <div><p className="text-slate-400 text-xs">Heart rate</p><p>{viewing.vitals.heartRate || '—'}</p></div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently remove the medical record." />
    </div>
  );
};

export default MedicalRecords;
