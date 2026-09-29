import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const roleLabel = {
  admin: 'Administrator', doctor: 'Doctor', receptionist: 'Receptionist',
  lab_technician: 'Lab Technician', pharmacist: 'Pharmacist', patient: 'Patient',
};

const Profile = () => {
  const { user, updateUserLocal } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', address: user?.address || '',
    gender: user?.gender || 'male', dateOfBirth: user?.dateOfBirth?.slice(0, 10) || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUserLocal(data.user);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); } finally { setSavingProfile(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', pwForm);
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Could not change password'); } finally { setSavingPw(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="card p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-display font-semibold text-lg text-ink">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="badge-blue mt-1.5 inline-block">{roleLabel[user?.role]}</span>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-ink mb-4">Personal information</h3>
        <form onSubmit={handleProfileSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Date of birth</label>
            <input type="date" className="input" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile && <Loader2 size={16} className="animate-spin" />} Save changes
            </button>
          </div>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-ink mb-4">Change password</h3>
        <form onSubmit={handlePasswordSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Current password</label>
            <input type="password" required className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
          </div>
          <div>
            <label className="label">New password</label>
            <input type="password" required minLength={6} className="input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={savingPw} className="btn-primary">
              {savingPw && <Loader2 size={16} className="animate-spin" />} Update password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
