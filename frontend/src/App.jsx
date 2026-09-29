import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import MedicalRecords from './pages/MedicalRecords';
import Laboratory from './pages/Laboratory';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';
import Staff from './pages/Staff';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']} />}>
            <Route path="/patients" element={<Patients />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']} />}>
            <Route path="/doctors" element={<Doctors />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/departments" element={<Departments />} />
            <Route path="/staff" element={<Staff />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'patient']} />}>
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'lab_technician', 'patient']} />}>
            <Route path="/laboratory" element={<Laboratory />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'pharmacist']} />}>
            <Route path="/pharmacy" element={<Pharmacy />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'receptionist', 'patient']} />}>
            <Route path="/billing" element={<Billing />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
