import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
    <div className="h-14 w-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center mb-5">
      <HeartPulse size={26} />
    </div>
    <h1 className="text-4xl font-display font-semibold text-ink">404</h1>
    <p className="text-slate-500 mt-2 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn-primary">Back to dashboard</Link>
  </div>
);

export default NotFound;
