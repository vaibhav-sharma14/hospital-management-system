import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Stethoscope, Building2, CalendarClock, FileText,
  ClipboardList, FlaskConical, Pill, Receipt, UserCog, Bell, UserCircle, HeartPulse,
} from 'lucide-react';

// Each nav item declares which roles can see it
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: 'all' },
  { to: '/patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'receptionist'] },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope, roles: ['admin', 'receptionist', 'patient'] },
  { to: '/departments', label: 'Departments', icon: Building2, roles: ['admin'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarClock, roles: 'all' },
  { to: '/prescriptions', label: 'Prescriptions', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
  { to: '/medical-records', label: 'Medical Records', icon: ClipboardList, roles: ['admin', 'doctor', 'patient'] },
  { to: '/laboratory', label: 'Laboratory', icon: FlaskConical, roles: ['admin', 'doctor', 'lab_technician', 'patient'] },
  { to: '/pharmacy', label: 'Pharmacy', icon: Pill, roles: ['admin', 'pharmacist'] },
  { to: '/billing', label: 'Billing', icon: Receipt, roles: ['admin', 'receptionist', 'patient'] },
  { to: '/staff', label: 'Staff', icon: UserCog, roles: ['admin'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: 'all' },
  { to: '/profile', label: 'My Profile', icon: UserCircle, roles: 'all' },
];

const Sidebar = ({ role, open, onClose }) => {
  const visibleItems = NAV_ITEMS.filter((item) => item.roles === 'all' || item.roles.includes(role));

  return (
    <>
      {open && <div className="fixed inset-0 bg-ink/30 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
            <HeartPulse size={20} />
          </div>
          <div>
            <p className="font-display font-semibold text-ink leading-none">MediCore</p>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">Hospital Management</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100 text-xs text-slate-400">
          MediCore HMS v1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
