import { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Zap,
  Droplet,
  AlertTriangle,
  Users,
  Calendar,
  Download
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { format } from 'date-fns';

export default function AnalyticsView() {
  const { waterTanks, powerNodes, sensors, citizenReports } = useVillageStore();
  const [dateRange, setDateRange] = useState('7days');

  // Calculate analytics
  const avgWaterLevel = waterTanks.reduce((sum, t) => sum + t.currentLevel, 0) / waterTanks.length;
  const avgPowerLoad = powerNodes.reduce((sum, n) => sum + (n.currentLoad / n.capacity * 100), 0) / powerNodes.length;
  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const pendingReports = citizenReports.filter(r => r.status === 'pending').length;

  const stats = [
    {
      title: 'Water Infrastructure',
      value: `${avgWaterLevel.toFixed(1)}%`,
      change: '+5.2%',
      trend: 'up',
      icon: Droplet,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Power Grid Load',
      value: `${avgPowerLoad.toFixed(1)}%`,
      change: '+12.8%',
      trend: 'up',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Active IoT Sensors',
      value: activeSensors,
      change: '-2',
      trend: 'down',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Citizen Reports',
      value: pendingReports,
      change: '+8',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Comprehensive insights and trends for Sundarpur Village</p>
          </div>
          
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-gray-600 text-white"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
            
            return (
              <div key={idx} className={`glass-dark rounded-xl p-6 ${stat.bgColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendIcon size={16} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                
                <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Water Consumption Trend */}
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Water Consumption Trend</h3>
            <div className="h-64 flex items-end justify-around gap-2">
              {[65, 72, 68, 85, 78, 82, 75].map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-gray-400">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Power Load Distribution */}
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Power Load Distribution</h3>
            <div className="h-64 flex items-end justify-around gap-2">
              {[45, 68, 82, 75, 90, 72, 65].map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-lg transition-all hover:opacity-80 ${
                      value > 80 ? 'bg-gradient-to-t from-red-500 to-orange-500' :
                      value > 60 ? 'bg-gradient-to-t from-yellow-500 to-orange-500' :
                      'bg-gradient-to-t from-green-500 to-emerald-500'
                    }`}
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-gray-400">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Water Consumers */}
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Water Tank Status</h3>
            <div className="space-y-3">
              {waterTanks.slice(0, 5).map((tank) => (
                <div key={tank.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      tank.status === 'good' ? 'bg-green-500' :
                      tank.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} />
                    <span className="text-white">{tank.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{tank.currentLevel.toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">{tank.capacity.toLocaleString()}L</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Citizen Reports */}
          <div className="glass-dark rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Reports</h3>
            <div className="space-y-3">
              {citizenReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white text-sm">{report.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{report.category}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    report.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    report.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="glass-dark rounded-xl p-6 mt-6">
          <h3 className="text-xl font-semibold text-white mb-6">System Performance Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Infrastructure Health</span>
                <span className="text-white font-semibold">87%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '87%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Sensor Coverage</span>
                <span className="text-white font-semibold">92%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Response Time</span>
                <span className="text-white font-semibold">2.3 hrs</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
