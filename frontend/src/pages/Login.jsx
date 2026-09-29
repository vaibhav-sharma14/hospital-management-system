import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-700 text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-600/40" />
        <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-primary-800/50" />
        <div className="flex items-center gap-2.5 z-10">
          <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
            <HeartPulse size={22} />
          </div>
          <span className="font-display font-semibold text-xl">MediCore HMS</span>
        </div>
        <div className="z-10 max-w-md">
          <h1 className="text-3xl font-display font-semibold leading-snug">
            One platform for patients, doctors, and every department in between.
          </h1>
          <p className="mt-4 text-primary-100">
            Manage appointments, records, labs, pharmacy and billing — all in one secure, role-aware system.
          </p>
        </div>
        <p className="z-10 text-sm text-primary-200">© {new Date().getFullYear()} MediCore Hospital Group</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <HeartPulse size={20} />
            </div>
            <span className="font-display font-semibold text-lg text-ink">MediCore HMS</span>
          </div>

          <h2 className="text-2xl font-display font-semibold text-ink">Sign in</h2>
          <p className="text-sm text-slate-500 mt-1.5 mb-8">Enter your credentials to access your dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required className="input pl-9" placeholder="you@hospital.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password" required className="input pl-9" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 text-center">
            New patient?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Create an account
            </Link>
          </p>

          <div className="mt-8 p-3.5 rounded-lg bg-slate-50 text-xs text-slate-500 leading-relaxed">
            Demo admin: admin@hospital.com / Admin@123<br />
            Demo doctor: doctor@hospital.com / Doctor@123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
