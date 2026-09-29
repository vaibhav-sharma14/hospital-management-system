import { useState } from 'react';
import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleLabel = {
  admin: 'Administrator', doctor: 'Doctor', receptionist: 'Receptionist',
  lab_technician: 'Lab Technician', pharmacist: 'Pharmacist', patient: 'Patient',
};

const Navbar = ({ onMenuClick, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3.5">
        <div className="flex items-center gap-3">
          <button className="lg:hidden text-slate-500" onClick={onMenuClick}>
            <Menu size={22} />
          </button>
          <p className="text-sm text-slate-400 hidden sm:block">
            Welcome back, <span className="text-ink font-medium">{user?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-slate-50 text-slate-500">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent-600 text-white text-[10px] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((m) => !m)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-ink leading-none">{user?.name}</p>
                <p className="text-xs text-slate-400 leading-none mt-0.5">{roleLabel[user?.role] || user?.role}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 card py-1.5 z-30" onMouseLeave={() => setMenuOpen(false)}>
                <Link to="/profile" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
