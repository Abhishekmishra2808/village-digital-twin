import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { 
  ArrowRight, 
  AlertTriangle, 
  Brain, 
  Shield, 
  Users, 
  CheckCircle, 
  Droplets, 
  Zap, 
  MapPin,
  ChevronRight,
  Home,
  Info,
  UserCircle2
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Mobile-friendly Stats Card Component
const StatsCard = ({ number, label, delay }: { number: number | string, label: string, delay: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 shadow-lg"
    >
      <div className="text-3xl font-bold text-white mb-1">
        {typeof number === 'number' && isInView ? (
          <CountUp end={number} duration={2} suffix="K+" />
        ) : (
          number
        )}
      </div>
      <div className="text-teal-100 text-sm font-medium">{label}</div>
    </motion.div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, color }: any) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100"
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="text-white" size={28} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

// Problem Card Component
const ProblemSolutionCard = ({ type, items }: { type: 'problem' | 'solution', items: any[] }) => {
  const isProblem = type === 'problem';
  
  return (
    <div className={`rounded-3xl p-6 shadow-xl ${
      isProblem 
        ? 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200' 
        : 'bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-300'
    }`}>
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
        isProblem ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isProblem ? 'bg-red-500' : 'bg-teal-500'} animate-pulse`} />
        <span className="font-bold text-sm">{isProblem ? 'CRITICAL' : 'SOLVED'}</span>
      </div>
      
      <h3 className={`text-2xl font-bold mb-6 ${isProblem ? 'text-red-900' : 'text-teal-900'}`}>
        {isProblem ? 'Current Problems' : 'Our Solutions'}
      </h3>
      
      <div className="space-y-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`flex items-start gap-4 p-4 rounded-2xl ${
              isProblem ? 'bg-white/60' : 'bg-white/80'
            }`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                isProblem ? 'bg-red-100' : 'bg-teal-100'
              }`}>
                <Icon size={20} className={isProblem ? 'text-red-600' : 'text-teal-600'} />
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// User Type Selector Card
const UserTypeCard = ({ icon: Icon, title, description, active, onClick, color }: any) => {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`w-full text-left p-6 rounded-3xl transition-all shadow-lg ${
        active 
          ? `${color} text-white scale-105` 
          : 'bg-white text-gray-900 border-2 border-gray-200'
      }`}
    >
      <Icon size={32} className={`mb-3 ${active ? 'text-white' : 'text-gray-400'}`} />
      <h3 className={`text-lg font-bold mb-2 ${active ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm ${active ? 'text-white/90' : 'text-gray-600'}`}>
        {description}
      </p>
      {active && (
        <div className="flex items-center gap-2 mt-4 text-sm font-bold">
          <span>View Details</span>
          <ChevronRight size={16} />
        </div>
      )}
    </motion.button>
  );
};

// Bottom Navigation
const BottomNav = ({ activeTab, setActiveTab }: any) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'about', icon: Info, label: 'About' },
    { id: 'users', icon: UserCircle2, label: 'Users' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-4 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                isActive ? 'text-teal-600' : 'text-gray-400'
              }`}
            >
              <Icon size={24} className={isActive ? 'text-teal-600' : 'text-gray-400'} />
              <span className={`text-xs font-medium ${isActive ? 'text-teal-600' : 'text-gray-500'}`}>
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
  const [activeUserType, setActiveUserType] = useState<'admin' | 'field' | 'citizen'>('admin');

  const problemItems = [
    { icon: AlertTriangle, title: 'Delayed Repairs', description: 'Infrastructure issues take months to address' },
    { icon: AlertTriangle, title: 'Fund Misuse', description: 'No transparency in budget allocation' },
    { icon: AlertTriangle, title: 'Poor Communication', description: 'Citizens have no way to report problems' },
  ];

  const solutionItems = [
    { icon: Brain, title: 'AI Monitoring', description: 'Real-time detection and predictive analytics' },
    { icon: Shield, title: 'Blockchain Tracking', description: 'Transparent, tamper-proof fund management' },
    { icon: Users, title: 'Connected System', description: 'Everyone stays informed and engaged' },
  ];

  const userDetails = {
    admin: {
      features: [
        'Interactive 3D Digital Twin visualization',
        'Predictive maintenance analytics',
        'Blockchain-backed fund allocation',
        'Real-time performance monitoring',
        'Automated compliance reporting',
      ],
    },
    citizen: {
      features: [
        'Voice-based complaint submission',
        'Real-time ticket tracking',
        'View ongoing projects',
        'Track public fund usage',
        'Offline-first mobile app',
      ],
    },
    field: {
      features: [
        'AI-prioritized task queue',
        'Geo-tagged photo proof',
        'Offline data sync',
        'Equipment management',
        'Simplified reporting',
      ],
    },
  };

  return (
    <div className="landing-page min-h-screen bg-gray-50 pb-20">
      {/* Top App Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-teal-600 to-teal-700 z-40 safe-area-top shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/favicon.jpg" alt="RuraLens" className="w-10 h-10 rounded-xl shadow-md" />
            <div>
              <h1 className="text-white text-lg font-bold">RuraLens</h1>
              <p className="text-teal-100 text-xs">Smart Village Platform</p>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-white text-teal-700 px-4 py-2 rounded-xl font-bold text-sm shadow-md"
          >
            LOGIN
          </button>
        </div>
      </div>

      {/* Content Area with Bottom Padding */}
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
              <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                    <span className="text-white text-xs font-bold">🚀 SYSTEM OPERATIONAL</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                    Digital Infrastructure for Rural India
                  </h2>
                  
                  <p className="text-teal-50 text-base mb-6 leading-relaxed">
                    Real-time monitoring, AI analytics, and transparent fund management for 600,000+ villages
                  </p>
                  
                  <button
                    onClick={onGetStarted}
                    className="w-full bg-white text-teal-700 py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2"
                  >
                    Get Started
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <StatsCard number={600} label="Villages" delay={0.1} />
                <StatsCard number="₹2.4L Cr" label="Budget" delay={0.2} />
                <StatsCard number="Real-time" label="Monitoring" delay={0.3} />
              </div>

              {/* Key Features */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 px-1">Key Features</h3>
                <div className="space-y-4">
                  <FeatureCard
                    icon={Brain}
                    title="AI-Powered Monitoring"
                    description="Detect issues automatically with satellite data and predictive analytics"
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                  />
                  <FeatureCard
                    icon={Shield}
                    title="Blockchain Transparency"
                    description="Track every rupee with immutable, tamper-proof records"
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                  />
                  <FeatureCard
                    icon={Users}
                    title="Connected Community"
                    description="Offline-first apps for citizens, workers, and administrators"
                    color="bg-gradient-to-br from-green-500 to-green-600"
                  />
                </div>
              </div>

              {/* Interactive Demo Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Live Infrastructure</h3>
                  <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-700 text-xs font-bold">LIVE</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Droplets size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">Water Pump 45B</div>
                        <div className="text-xs text-gray-500">Flow Rate: 97%</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-green-600">OPERATIONAL</div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Zap size={20} className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">Power Grid Sector 4</div>
                        <div className="text-xs text-gray-500">Load: 87%</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-green-600">STABLE</div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <MapPin size={20} className="text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">Road Network 12</div>
                        <div className="text-xs text-gray-500">Condition: 92%</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-green-600">MONITORING</div>
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
              className="space-y-6 pb-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">The Challenge</h2>
                <p className="text-gray-600 text-base mb-6">
                  India's 600,000+ villages manage budgets over ₹2.4 lakh crore, but infrastructure blindness leads to inefficiency
                </p>
              </div>

              <ProblemSolutionCard type="problem" items={problemItems} />
              
              <div className="py-6 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-0.5 bg-gray-300" />
                  <ArrowRight className="text-teal-600" size={28} />
                  <div className="w-8 h-0.5 bg-gray-300" />
                </div>
              </div>

              <ProblemSolutionCard type="solution" items={solutionItems} />

              {/* Impact Numbers */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Expected Impact</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="text-3xl font-bold text-white mb-1">40%</div>
                    <div className="text-teal-100 text-sm">Faster Response Time</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="text-3xl font-bold text-white mb-1">60%</div>
                    <div className="text-teal-100 text-sm">Better Fund Utilization</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-teal-100 text-sm">Transparency</div>
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
              className="space-y-6 pb-6"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Built for Everyone</h2>
                <p className="text-gray-600 text-base mb-6">
                  Select your role to see how RuraLens works for you
                </p>
              </div>

              <div className="space-y-4">
                <UserTypeCard
                  icon={Users}
                  title="For Administrators"
                  description="Monitor, allocate, and track performance"
                  active={activeUserType === 'admin'}
                  onClick={() => setActiveUserType('admin')}
                  color="bg-gradient-to-br from-teal-600 to-teal-700"
                />
                <UserTypeCard
                  icon={UserCircle2}
                  title="For Field Workers"
                  description="Complete tasks efficiently with AI assistance"
                  active={activeUserType === 'field'}
                  onClick={() => setActiveUserType('field')}
                  color="bg-gradient-to-br from-green-600 to-green-700"
                />
                <UserTypeCard
                  icon={AlertTriangle}
                  title="For Citizens"
                  description="Report issues and track progress"
                  active={activeUserType === 'citizen'}
                  onClick={() => setActiveUserType('citizen')}
                  color="bg-gradient-to-br from-blue-600 to-blue-700"
                />
              </div>

              {/* User Details Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeUserType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-200"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                  <div className="space-y-3">
                    {userDetails[activeUserType].features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="text-teal-600 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={onGetStarted}
                    className="w-full mt-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2"
                  >
                    Try Demo
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final CTA (visible on all tabs) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-3 text-center">
            Ready to Get Started?
          </h3>
          <p className="text-gray-300 text-center mb-6">
            Join the future of rural infrastructure management
          </p>
          <button
            onClick={onGetStarted}
            className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2"
          >
            Login to Platform
            <ArrowRight size={20} />
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
