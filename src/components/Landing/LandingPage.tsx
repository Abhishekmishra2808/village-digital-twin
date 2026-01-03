import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Brain, 
  Shield, 
  Users, 
  CheckCircle,
  Home,
  Info,
  UserCircle2,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Bottom Navigation
const BottomNav = ({ activeTab, setActiveTab }: any) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'about', icon: Info, label: 'About' },
    { id: 'users', icon: UserCircle2, label: 'Users' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around px-4 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                isActive ? 'bg-teal-50' : ''
              }`}
            >
              <Icon size={22} className={isActive ? 'text-teal-600' : 'text-gray-400'} strokeWidth={2.5} />
              <span className={`text-xs font-bold ${isActive ? 'text-teal-600' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState('home');

  const features = [
    { icon: Brain, title: 'AI-Powered Monitoring', color: 'from-purple-500 to-purple-600' },
    { icon: Shield, title: 'Blockchain Transparency', color: 'from-blue-500 to-blue-600' },
    { icon: Users, title: 'Connected Community', color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Top App Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 z-40 safe-area-top shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/ruralens-logo.png" 
              alt="RuraLens" 
              className="w-10 h-10 rounded-xl shadow-md"
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md hidden">
              <span className="text-white font-bold text-base">RL</span>
            </div>
            <div>
              <h1 className="text-white text-base font-bold">RuraLens</h1>
              <p className="text-teal-100 text-[10px] font-medium">Smart Villages</p>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-white text-teal-700 px-5 py-2 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            LOGIN
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-20 px-4">
        <AnimatePresence mode="wait">
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Hero Card */}
              <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-600 rounded-3xl p-8 shadow-2xl overflow-hidden relative mt-2">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                    <Zap size={14} className="text-white" />
                    <span className="text-white text-xs font-bold">LIVE SYSTEM</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                    Digital Twin for Rural India
                  </h2>
                  
                  <p className="text-teal-50 text-sm mb-6 leading-relaxed">
                    Real-time monitoring, AI analytics, and transparent governance for India's 600,000+ villages
                  </p>
                  
                  <button
                    onClick={onGetStarted}
                    className="w-full bg-white text-teal-700 py-3.5 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2 hover:shadow-2xl transition-all active:scale-95"
                  >
                    Get Started
                    <ArrowRight size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Key Features - Minimal Cards */}
              <div className="space-y-3">
                {features.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-2xl p-5 shadow-md border border-gray-200 flex items-center gap-4"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="text-white" size={24} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">{feature.title}</h3>
                    </motion.div>
                  );
                })}
              </div>

              {/* Stats - Minimal */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Coverage</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-teal-600">600K+</div>
                    <div className="text-xs text-gray-600 font-medium">Villages</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">₹2.4L Cr</div>
                    <div className="text-xs text-gray-600 font-medium">Budget</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">Real-time</div>
                    <div className="text-xs text-gray-600 font-medium">Updates</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5 mt-2"
            >
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">The Challenge</h2>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  India's 600,000+ villages manage budgets over ₹2.4 lakh crore, but infrastructure blindness leads to inefficiency and fund misuse.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">⚠️</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">Delayed Repairs</div>
                      <div className="text-xs text-gray-600">Issues take months to address</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">💰</span>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-900">Fund Misuse</div>
                      <div className="text-xs text-gray-600">No transparency in allocation</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-6 shadow-xl text-white">
                <h2 className="text-2xl font-bold mb-3">Our Solution</h2>
                <p className="text-teal-50 text-sm mb-4 leading-relaxed">
                  AI monitoring, blockchain tracking, and connected community platform
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={18} className="text-white flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-white font-medium">40% faster response time</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={18} className="text-white flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-white font-medium">60% better fund utilization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={18} className="text-white flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-white font-medium">100% transparency</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5 mt-2"
            >
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Built for Everyone</h2>
                <p className="text-gray-600 text-sm mb-5">
                  Different roles, unified platform
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border-2 border-teal-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Users className="text-white" size={20} strokeWidth={2.5} />
                      </div>
                      <div className="font-bold text-gray-900">Administrators</div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Monitor, allocate, and track performance with 3D digital twin and AI analytics
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <UserCircle2 className="text-white" size={20} strokeWidth={2.5} />
                      </div>
                      <div className="font-bold text-gray-900">Field Workers</div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      AI-prioritized tasks, geo-tagged proofs, and offline data sync
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Home className="text-white" size={20} strokeWidth={2.5} />
                      </div>
                      <div className="font-bold text-gray-900">Citizens</div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Voice complaints, track progress, and view transparent fund usage
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-95"
              >
                Try Demo
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-xl font-bold text-white mb-2 text-center">
            Ready to Start?
          </h3>
          <p className="text-gray-300 text-center mb-4 text-sm">
            Join the future of rural governance
          </p>
          <button
            onClick={onGetStarted}
            className="w-full bg-white text-gray-900 py-3.5 rounded-xl font-bold text-base shadow-xl flex items-center justify-center gap-2 hover:shadow-2xl transition-all active:scale-95"
          >
            Login to Platform
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Safe Area Styles */}
      <style>{`
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}
