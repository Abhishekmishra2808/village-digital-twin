import KPICards from './KPICards';
import ActivityFeed from './ActivityFeed';
import LiveCharts from './LiveCharts';

export default function Dashboard() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-background to-gray-800">
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveCharts />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
