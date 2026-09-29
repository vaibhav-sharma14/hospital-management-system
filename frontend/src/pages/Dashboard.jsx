import { useEffect, useState } from 'react';
import {
  Users, Stethoscope, Building2, CalendarClock, FlaskConical, Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/UI/StatCard';
import Spinner from '../components/UI/Spinner';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#258d80', '#e8956f', '#73c9bc', '#d97d52', '#a9e0d4'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data.stats);
        setCharts(data.charts);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner full />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink">
          {user?.role === 'patient' ? 'My health overview' : 'Hospital overview'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          A quick snapshot of activity across the hospital today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} tint="primary" />
        <StatCard icon={Stethoscope} label="Active Doctors" value={stats.totalDoctors} tint="accent" />
        <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} tint="primary" />
        <StatCard icon={CalendarClock} label="Today's Appointments" value={stats.todaysAppointments} tint="amber" />
        <StatCard icon={FlaskConical} label="Pending Lab Tests" value={stats.pendingLabTests} tint="rose" />
        <StatCard icon={Wallet} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} tint="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-ink mb-1">Appointments trend</h3>
          <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={charts.appointmentsByMonth}>
              <defs>
                <linearGradient id="apptGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#258d80" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#258d80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#258d80" strokeWidth={2} fill="url(#apptGradient)" name="Appointments" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink mb-1">Appointment status</h3>
          <p className="text-xs text-slate-400 mb-4">All-time breakdown</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={charts.appointmentsByStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {charts.appointmentsByStatus.map((entry, idx) => (
                  <Cell key={entry.status} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink mb-1">Revenue by month</h3>
          <p className="text-xs text-slate-400 mb-4">Collected payments, last 6 months</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#e8956f" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink mb-1">Doctors by department</h3>
          <p className="text-xs text-slate-400 mb-4">Current staffing load</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={charts.departmentLoad} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f6" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#258d80" radius={[0, 6, 6, 0]} name="Doctors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
