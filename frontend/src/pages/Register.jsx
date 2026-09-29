import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', gender: 'male', dateOfBirth: '', address: '',
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="card w-full max-w-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
            <HeartPulse size={20} />
          </div>
          <span className="font-display font-semibold text-lg text-ink">MediCore HMS</span>
        </div>

        <h2 className="text-2xl font-display font-semibold text-ink">Create your patient account</h2>
        <p className="text-sm text-slate-500 mt-1.5 mb-6">Book appointments and manage your health records online.</p>

        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={update('name')} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="label">Email address</label>
            <input type="email" required className="input" value={form.email} onChange={update('email')} placeholder="jane@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required minLength={6} className="input" value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="label">Phone number</label>
            <input required className="input" value={form.phone} onChange={update('phone')} placeholder="9876543210" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={update('gender')}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Date of birth</label>
            <input type="date" className="input" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={update('address')} placeholder="City, State" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary sm:col-span-2 mt-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create account
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
