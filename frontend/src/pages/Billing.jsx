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

const emptyItem = { description: '', category: 'consultation', quantity: 1, unitPrice: 0 };
const emptyForm = { patient: '', items: [emptyItem], discount: 0, tax: 0, paymentMethod: 'cash', amountPaid: 0 };

const Billing = () => {
  const { user } = useAuth();
  const canManage = ['admin', 'receptionist'].includes(user.role);

  const [rows, setRows] = useState([]);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bills', { params: { page, search, status: statusFilter, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load bills'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, statusFilter]);
  useEffect(() => {
    if (canManage) api.get('/patients', { params: { limit: 100 } }).then(({ data }) => setPatients(data.data));
  }, [canManage]);

  const openCreate = () => { setForm(emptyForm); setModalOpen(true); };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    setForm({ ...form, items });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, emptyItem] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const subtotal = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const total = Math.max(subtotal - Number(form.discount || 0) + Number(form.tax || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bills', form);
      toast.success('Invoice generated');
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/bills/${deleteId}`);
      toast.success('Bill removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const columns = [
    { header: 'Invoice #', accessor: (r) => <span className="font-medium text-ink">{r.invoiceNumber}</span> },
    { header: 'Patient', accessor: (r) => r.patient?.name || '—' },
    { header: 'Total', accessor: (r) => `₹${r.totalAmount.toLocaleString()}` },
    { header: 'Paid', accessor: (r) => `₹${r.amountPaid.toLocaleString()}` },
    { header: 'Status', accessor: (r) => <Badge status={r.status} /> },
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
          <h1 className="text-2xl font-display font-semibold text-ink">Billing & Payments</h1>
          <p className="text-sm text-slate-500 mt-1">Generate invoices and track patient payments.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search invoice number..." />
          <select className="input w-auto" value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}>
            <option value="">All statuses</option>
            {['pending', 'partial', 'paid', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {canManage && <button className="btn-primary" onClick={openCreate}><Plus size={16} /> New invoice</button>}
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No bills found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New invoice" width="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Patient</label>
            <select required className="input" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Line items</label>
              <button type="button" className="text-sm text-primary-600 font-medium" onClick={addItem}>+ Add item</button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-lg">
                  <input className="input col-span-4" placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} />
                  <select className="input col-span-3" value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)}>
                    {['consultation', 'lab_test', 'medicine', 'procedure', 'room', 'other'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                  <input type="number" min="1" className="input col-span-2" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                  <input type="number" min="0" className="input col-span-2" placeholder="Unit price" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} />
                  <button type="button" className="col-span-1 text-slate-400 hover:text-rose-600" onClick={() => removeItem(idx)}><X size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Discount (₹)</label>
              <input type="number" min="0" className="input" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            </div>
            <div>
              <label className="label">Tax (₹)</label>
              <input type="number" min="0" className="input" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
            </div>
            <div>
              <label className="label">Payment method</label>
              <select className="input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                {['cash', 'card', 'upi', 'insurance', 'other'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between bg-primary-50 rounded-lg px-4 py-3">
            <span className="text-sm text-primary-700">Subtotal: ₹{subtotal.toLocaleString()}</span>
            <span className="font-display font-semibold text-primary-800">Total: ₹{total.toLocaleString()}</span>
          </div>

          <div>
            <label className="label">Amount paid now (₹)</label>
            <input type="number" min="0" max={total} className="input" value={form.amountPaid} onChange={(e) => setForm({ ...form, amountPaid: e.target.value })} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Generate invoice</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Invoice details">
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-slate-400">Invoice #</p><p className="font-medium text-ink">{viewing.invoiceNumber}</p></div>
              <div><p className="text-slate-400">Patient</p><p className="font-medium text-ink">{viewing.patient?.name}</p></div>
            </div>
            <div className="table-wrap">
              <table className="dt">
                <thead><tr><th>Description</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead>
                <tbody>
                  {viewing.items?.map((it, i) => (
                    <tr key={i}><td>{it.description}</td><td>{it.quantity}</td><td>₹{it.unitPrice}</td><td>₹{it.total}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-6 text-sm">
              <p>Subtotal: <span className="font-medium">₹{viewing.subtotal}</span></p>
              <p>Total: <span className="font-medium">₹{viewing.totalAmount}</span></p>
              <p>Paid: <span className="font-medium">₹{viewing.amountPaid}</span></p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently remove the invoice." />
    </div>
  );
};

export default Billing;
