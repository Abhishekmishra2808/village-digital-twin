import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  Download
} from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { useAnonymousReports } from '../../hooks/useAnonymousReports';

export default function AnalyticsView() {
  const { sensors } = useVillageStore();
  const { reports: anonymousReports, stats: reportStats } = useAnonymousReports();
  const [dateRange, setDateRange] = useState('7days');

  // Calculate analytics
  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const pendingReports = reportStats?.pending || 0;

  const stats = [
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
    <div className="h-full w-full overflow-auto bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-slate-400">Comprehensive insights and trends for smart village management</p>
          </div>
          
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white"
            >
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm">
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
              <div key={idx} className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <TrendIcon size={16} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                
                <h3 className="text-slate-400 text-sm mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Water Consumption Trend */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Water Consumption Trend</h3>
            <div className="h-64 bg-slate-800/50 rounded-lg p-4 flex items-end justify-around gap-2">
              {[65, 72, 68, 85, 78, 82, 75].map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="w-full flex flex-col justify-end items-center h-full">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg transition-all hover:opacity-80 min-h-[20px]"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Power Load Distribution */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Power Load Distribution</h3>
            <div className="h-64 bg-slate-800/50 rounded-lg p-4 flex items-end justify-around gap-2">
              {[45, 68, 82, 75, 90, 72, 65].map((value, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="w-full flex flex-col justify-end items-center h-full">
                    <div 
                      className={`w-full rounded-t-lg transition-all hover:opacity-80 min-h-[20px] ${
                        value > 80 ? 'bg-gradient-to-t from-red-500 to-orange-500' :
                        value > 60 ? 'bg-gradient-to-t from-yellow-500 to-orange-500' :
                        'bg-gradient-to-t from-green-500 to-emerald-500'
                      }`}
                      style={{ height: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 mt-1">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Anonymous Reports */}
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-sm">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Reports</h3>
            <div className="space-y-3">
              {anonymousReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{report.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{report.category}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    report.status === 'resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    report.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-slate-700 text-slate-300 border border-slate-600'
                  }`}>
                    {report.status.replace('_', ' ')}
                  </div>
                </div>
              ))}
              {anonymousReports.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-4">No reports yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-6 mt-6 border border-white/10 shadow-sm">
          <h3 className="text-xl font-semibold text-white mb-6">System Performance Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Infrastructure Health</span>
                <span className="text-white font-semibold">87%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '87%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Sensor Coverage</span>
                <span className="text-white font-semibold">92%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '92%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Response Time</span>
                <span className="text-white font-semibold">2.3 hrs</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
