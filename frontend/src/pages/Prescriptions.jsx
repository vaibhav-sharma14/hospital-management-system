import { useEffect, useState } from 'react';
import { Plus, Eye, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/UI/DataTable';
import SearchBar from '../components/UI/SearchBar';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Badge from '../components/UI/Badge';
import { useAuth } from '../context/AuthContext';

const emptyMedLine = { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' };
const emptyForm = { patient: '', doctor: '', diagnosis: '', medicines: [emptyMedLine], notes: '', followUpDate: '', status: 'active' };

const Prescriptions = () => {
  const { user } = useAuth();
  const canCreate = ['admin', 'doctor'].includes(user.role);

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
      const { data } = await api.get('/prescriptions', { params: { page, search, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load prescriptions'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);
  useEffect(() => {
    if (canCreate) {
      api.get('/patients', { params: { limit: 100 } }).then(({ data }) => setPatients(data.data));
      api.get('/doctors', { params: { limit: 100 } }).then(({ data }) => setDoctors(data.data));
    }
  }, [canCreate]);

  const openCreate = () => { setForm(emptyForm); setModalOpen(true); };

  const updateMedLine = (idx, field, value) => {
    const meds = [...form.medicines];
    meds[idx] = { ...meds[idx], [field]: value };
    setForm({ ...form, medicines: meds });
  };
  const addMedLine = () => setForm({ ...form, medicines: [...form.medicines, emptyMedLine] });
  const removeMedLine = (idx) => setForm({ ...form, medicines: form.medicines.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', form);
      toast.success('Prescription created');
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/prescriptions/${deleteId}`);
      toast.success('Prescription removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'Patient', accessor: (r) => r.patient?.name || '—' },
    { header: 'Doctor', accessor: (r) => r.doctor?.name || '—' },
    { header: 'Diagnosis', accessor: (r) => r.diagnosis || '—' },
    { header: 'Medicines', accessor: (r) => `${r.medicines?.length || 0} item(s)` },
    { header: 'Date', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
    { header: 'Status', accessor: (r) => <Badge status={r.status} /> },
    { header: '', accessor: (r) => (
      <div className="flex gap-2 justify-end">
        <button className="text-slate-400 hover:text-primary-600" onClick={() => setViewing(r)}><Eye size={16} /></button>
        {canCreate && <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(r._id)}><Trash2 size={16} /></button>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Prescriptions</h1>
          <p className="text-sm text-slate-500 mt-1">Issue and review patient prescriptions.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search by diagnosis..." />
          {canCreate && <button className="btn-primary" onClick={openCreate}><Plus size={16} /> New prescription</button>}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No prescriptions found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New prescription" width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
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
          </div>
          <div>
            <label className="label">Diagnosis</label>
            <input className="input" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Medicines</label>
              <button type="button" className="text-sm text-primary-600 font-medium" onClick={addMedLine}>+ Add line</button>
            </div>
            <div className="space-y-3">
              {form.medicines.map((med, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg">
                  <input className="input col-span-3" placeholder="Medicine" value={med.medicineName} onChange={(e) => updateMedLine(idx, 'medicineName', e.target.value)} />
                  <input className="input col-span-2" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedLine(idx, 'dosage', e.target.value)} />
                  <input className="input col-span-2" placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedLine(idx, 'frequency', e.target.value)} />
                  <input className="input col-span-2" placeholder="Duration" value={med.duration} onChange={(e) => updateMedLine(idx, 'duration', e.target.value)} />
                  <input className="input col-span-2" placeholder="Instructions" value={med.instructions} onChange={(e) => updateMedLine(idx, 'instructions', e.target.value)} />
                  <button type="button" className="col-span-1 text-slate-400 hover:text-rose-600" onClick={() => removeMedLine(idx)}><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Follow-up date</label>
              <input type="date" className="input" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save prescription</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Prescription details">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-slate-400">Patient</p><p className="font-medium text-ink">{viewing.patient?.name}</p></div>
              <div><p className="text-slate-400">Doctor</p><p className="font-medium text-ink">{viewing.doctor?.name}</p></div>
              <div><p className="text-slate-400">Diagnosis</p><p className="font-medium text-ink">{viewing.diagnosis || '—'}</p></div>
              <div><p className="text-slate-400">Status</p><Badge status={viewing.status} /></div>
            </div>
            <div>
              <p className="text-slate-400 mb-2">Medicines</p>
              <div className="table-wrap">
                <table className="dt">
                  <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
                  <tbody>
                    {viewing.medicines?.map((m, i) => (
                      <tr key={i}><td>{m.medicineName}</td><td>{m.dosage}</td><td>{m.frequency}</td><td>{m.duration}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {viewing.notes && <div><p className="text-slate-400">Notes</p><p className="text-ink">{viewing.notes}</p></div>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently remove the prescription." />
    </div>
  );
};

export default Prescriptions;
