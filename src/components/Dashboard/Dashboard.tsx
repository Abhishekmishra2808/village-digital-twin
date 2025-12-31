import AdminDashboard from './AdminDashboard';
import CitizenDashboard from './CitizenDashboard';
import { useVillageStore } from '../../store/villageStore';

export default function Dashboard() {
  const userRole = useVillageStore((state) => state.userRole);

  // Route to appropriate dashboard based on user role
  if (userRole === 'admin' || userRole === 'field_worker') {
    return <AdminDashboard />;
  }

  // Citizens and default view
  return <CitizenDashboard />;
}
