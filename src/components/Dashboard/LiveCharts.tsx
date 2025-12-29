import { useVillageStore } from '../../store/villageStore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

export default function LiveCharts() {
  const { waterTanks, powerNodes } = useVillageStore();

  // Water Tanks Chart Data
  const waterChartData = {
    labels: waterTanks.map(t => t.name.replace(' Tank', '').replace('Water Tank', '')),
    datasets: [{
      label: 'Water Level (%)',
      data: waterTanks.map(t => t.currentLevel),
      backgroundColor: waterTanks.map(t => 
        t.status === 'good' ? 'rgba(16, 185, 129, 0.6)' :
        t.status === 'warning' ? 'rgba(245, 158, 11, 0.6)' :
        'rgba(239, 68, 68, 0.6)'
      ),
      borderColor: waterTanks.map(t => 
        t.status === 'good' ? '#10b981' :
        t.status === 'warning' ? '#f59e0b' :
        '#ef4444'
      ),
      borderWidth: 2,
    }],
  };

  // Power Load Chart Data
  const powerChartData = {
    labels: powerNodes.slice(0, 8).map(p => p.name.replace(' Transformer', '').replace('Transformer', '')),
    datasets: [{
      label: 'Current Load (kW)',
      data: powerNodes.slice(0, 8).map(p => p.currentLoad),
      backgroundColor: 'rgba(99, 102, 241, 0.6)',
      borderColor: '#6366f1',
      borderWidth: 2,
      tension: 0.4,
    }, {
      label: 'Capacity (kW)',
      data: powerNodes.slice(0, 8).map(p => p.capacity),
      backgroundColor: 'rgba(156, 163, 175, 0.3)',
      borderColor: '#9ca3af',
      borderWidth: 2,
      tension: 0.4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#374151',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(156, 163, 175, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      y: {
        ticks: { color: '#6b7280', font: { size: 11 } },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Water Infrastructure Status</h3>
        <div style={{ height: '280px' }}>
          <Bar data={waterChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Power Grid Load Distribution</h3>
        <div style={{ height: '280px' }}>
          <Line data={powerChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
