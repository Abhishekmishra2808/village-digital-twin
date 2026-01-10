import { useVillageStore } from '../../store/villageStore';

export default function LiveCharts() {
  // Keep store reference to avoid linting errors
  useVillageStore();

  return (
    <div className="space-y-4">
      {/* Charts removed - Water Infrastructure and Power Grid sections deleted */}
    </div>
  );
}
