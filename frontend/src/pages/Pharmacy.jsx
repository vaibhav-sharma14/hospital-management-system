import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, PackageMinus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import DataTable from '../components/UI/DataTable';
import SearchBar from '../components/UI/SearchBar';
import Modal from '../components/UI/Modal';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import Badge from '../components/UI/Badge';

const emptyForm = {
  name: '', category: '', manufacturer: '', batchNumber: '', unit: 'tablet',
  pricePerUnit: 0, stockQuantity: 0, reorderLevel: 20, expiryDate: '', supplier: '',
};

const Pharmacy = () => {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [dispenseRow, setDispenseRow] = useState(null);
  const [dispenseQty, setDispenseQty] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/medicines', { params: { page, search, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load medicines'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (row) => { setForm({ ...row, expiryDate: row.expiryDate?.slice(0, 10) }); setEditingId(row._id); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/medicines/${editingId}`, form); toast.success('Medicine updated'); }
      else { await api.post('/medicines', form); toast.success('Medicine added to inventory'); }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/medicines/${deleteId}`);
      toast.success('Medicine removed');
      setDeleteId(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not delete'); }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/medicines/${dispenseRow._id}/dispense`, { quantity: Number(dispenseQty) });
      toast.success('Stock dispensed');
      setDispenseRow(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not dispense'); }
  };

  const columns = [
    { header: 'Medicine', accessor: (r) => <span className="font-medium text-ink">{r.name}</span> },
    { header: 'Category', accessor: (r) => r.category || '—' },
    { header: 'Price/unit', accessor: (r) => `₹${r.pricePerUnit}` },
    { header: 'Stock', accessor: (r) => r.stockQuantity },
    { header: 'Expiry', accessor: (r) => new Date(r.expiryDate).toLocaleDateString() },
    { header: 'Status', accessor: (r) => <Badge status={r.stockStatus} /> },
    { header: '', accessor: (r) => (
      <div className="flex gap-2 justify-end">
        <button className="text-slate-400 hover:text-primary-600" title="Dispense" onClick={() => { setDispenseRow(r); setDispenseQty(1); }}><PackageMinus size={16} /></button>
        <button className="text-slate-400 hover:text-primary-600" onClick={() => openEdit(r)}><Pencil size={16} /></button>
        <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(r._id)}><Trash2 size={16} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Pharmacy</h1>
          <p className="text-sm text-slate-500 mt-1">Track medicine inventory, stock levels and expiry.</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={(v) => { setPage(1); setSearch(v); }} placeholder="Search medicines..." />
          <button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add medicine</button>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} loading={loading} pagination={pagination} onPageChange={setPage} emptyMessage="No medicines found." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit medicine' : 'Add medicine'}>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Medicine name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label className="label">Manufacturer</label>
            <input className="input" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
          </div>
          <div>
            <label className="label">Unit</label>
            <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {['tablet', 'capsule', 'syrup', 'injection', 'cream', 'other'].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Price per unit (₹)</label>
            <input type="number" min="0" required className="input" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
          </div>
          <div>
            <label className="label">Stock quantity</label>
            <input type="number" min="0" required className="input" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
          </div>
          <div>
            <label className="label">Reorder level</label>
            <input type="number" min="0" className="input" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
          </div>
          <div>
            <label className="label">Expiry date</label>
            <input type="date" required className="input" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Supplier</label>
            <input className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add medicine'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!dispenseRow} onClose={() => setDispenseRow(null)} title="Dispense stock" width="max-w-sm">
        {dispenseRow && (
          <form onSubmit={handleDispense} className="space-y-4">
            <p className="text-sm text-slate-500">Dispensing from <span className="font-medium text-ink">{dispenseRow.name}</span> (current stock: {dispenseRow.stockQuantity})</p>
            <div>
              <label className="label">Quantity</label>
              <input type="number" min="1" max={dispenseRow.stockQuantity} required className="input" value={dispenseQty} onChange={(e) => setDispenseQty(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setDispenseRow(null)}>Cancel</button>
              <button type="submit" className="btn-primary">Dispense</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} message="This will permanently remove the medicine from inventory." />
    </div>
  );
};

export default Pharmacy;
