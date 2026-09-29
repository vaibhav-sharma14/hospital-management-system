import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Spinner from '../components/UI/Spinner';
import Pagination from '../components/UI/Pagination';

const typeTint = {
  appointment: 'bg-sky-50 text-sky-600', billing: 'bg-amber-50 text-amber-600',
  lab: 'bg-rose-50 text-rose-600', pharmacy: 'bg-emerald-50 text-emerald-600',
  system: 'bg-slate-100 text-slate-600', general: 'bg-primary-50 text-primary-600',
};

const Notifications = () => {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { page, limit: 10 } });
      setRows(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load notifications'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page]);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchData();
  };
  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    toast.success('All notifications marked as read');
    fetchData();
  };
  const remove = async (id) => {
    await api.delete(`/notifications/${id}`);
    fetchData();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated on appointments, lab results and billing.</p>
        </div>
        <button className="btn-secondary" onClick={markAllRead}><CheckCheck size={16} /> Mark all as read</button>
      </div>

      <div className="card divide-y divide-slate-100">
        {loading && <Spinner />}
        {!loading && rows.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Bell size={32} className="mx-auto mb-2 opacity-40" />
            No notifications yet.
          </div>
        )}
        {!loading && rows.map((n) => (
          <div key={n._id} className={`flex items-start gap-4 p-4 ${!n.isRead ? 'bg-primary-50/30' : ''}`}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${typeTint[n.type] || typeTint.general}`}>
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink text-sm">{n.title}</p>
              <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {!n.isRead && (
                <button className="text-slate-400 hover:text-primary-600" title="Mark as read" onClick={() => markRead(n._id)}><Check size={16} /></button>
              )}
              <button className="text-slate-400 hover:text-rose-600" title="Delete" onClick={() => remove(n._id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {pagination && !loading && rows.length > 0 && <Pagination {...pagination} onPageChange={setPage} />}
      </div>
    </div>
  );
};

export default Notifications;
