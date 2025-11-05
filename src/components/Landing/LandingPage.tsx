import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { ArrowRight, AlertTriangle, Wallet, Scale, Brain, Shield, Users, CheckCircle, Droplets, Zap, TrendingUp, BarChart3, MapPin } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// Live Data Ticker Component
const LiveDataTicker = () => {
  const dataPoints = [
    "[+] 14:32:01 | POTHOLE_DETECTED | SECTOR_4B | PRIORITY: HIGH",
    "[+] 14:32:05 | FUND_REQUEST_VERIFIED | BLOCK_7 | AMOUNT: ₹2.4L",
    "[+] 14:32:10 | CREW_DISPATCHED | ETA: 45MIN | ROUTE_OPTIMIZED",
    "[+] 14:32:14 | IOT_PUMP_21B | STATUS: OPERATIONAL | FLOW: 98.5%",
    "[+] 14:32:18 | WATER_QUALITY | TANK_04 | pH: 7.2 | SAFE",
    "[+] 14:32:22 | POWER_GRID | LOAD: 87% | STABLE",
    "[+] 14:32:26 | CITIZEN_REPORT | STREET_LIGHT_OUT | ASSIGNED",
    "[+] 14:32:30 | BLOCKCHAIN_TX | FUND_RELEASE | VERIFIED",
  ];

  const tickerContent = dataPoints.join("     ").repeat(3);

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-teal-500/30 py-2 overflow-hidden">
      <div className="ticker-wrapper">
        <div className="ticker-content tech-text text-teal-400 text-sm">
          {tickerContent}
        </div>
      </div>
      <style>{`
        .ticker-wrapper {
          overflow: hidden;
          white-space: nowrap;
        }
        .ticker-content {
          display: inline-block;
          animation: scroll-left 60s linear infinite;
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
};

// Interactive Digital Twin Hero Component with HUD
const DigitalTwinHero = () => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const elements = [
    { id: 'pump', x: 25, y: 35, label: 'PUMP_ID_45B', status: 'OPERATIONAL', data: 'FLOW_RATE: 97%', lastMaint: '2025-10-15', icon: Droplets, color: '#3b82f6' },
    { id: 'power', x: 45, y: 20, label: 'GRID_SECTOR_4', status: 'STABLE', data: 'LOAD: 87%', lastMaint: '2025-10-28', icon: Zap, color: '#eab308' },
    { id: 'road', x: 15, y: 65, label: 'ROAD_NETWORK_12', status: 'MONITORING', data: 'CONDITION: 92%', lastMaint: '2025-09-12', icon: MapPin, color: '#10b981' },
    { id: 'sensor', x: 70, y: 50, label: 'IOT_NODE_08A', status: 'ACTIVE', data: 'TEMP: 32°C', lastMaint: '2025-10-30', icon: TrendingUp, color: '#14b8a6' },
    { id: 'school', x: 60, y: 40, label: 'SCHOOL_INFRA', status: 'OPERATIONAL', data: 'ATTENDANCE: 94%', lastMaint: '2025-10-20', icon: Users, color: '#8b5cf6' },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  return (
    <div 
      className="relative w-full h-[550px] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/40 rounded-2xl border-2 border-teal-500/20 overflow-hidden shadow-2xl"
      onMouseMove={handleMouseMove}
    >
      {/* HUD Blueprint Grid Background */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: `
          linear-gradient(to right, #0d9488 1px, transparent 1px),
          linear-gradient(to bottom, #0d9488 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px'
      }}></div>

      {/* Topographical Contour Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
        <path d="M 100 300 Q 300 250 500 300 T 900 300" stroke="#14b8a6" strokeWidth="1" fill="none"/>
        <path d="M 100 400 Q 300 350 500 400 T 900 400" stroke="#14b8a6" strokeWidth="1" fill="none"/>
        <path d="M 100 500 Q 300 450 500 500 T 900 500" stroke="#14b8a6" strokeWidth="1" fill="none"/>
        <path d="M 100 600 Q 300 550 500 600 T 900 600" stroke="#14b8a6" strokeWidth="1" fill="none"/>
      </svg>

      {/* Glowing Road Network */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000">
        <path 
          d="M 100 650 L 300 650 L 450 500 L 600 650 L 900 650" 
          stroke="#14b8a6" 
          strokeWidth="3" 
          fill="none"
          opacity="0.4"
          className="road-glow"
        />
        <path 
          d="M 450 200 L 450 500 M 600 300 L 600 650" 
          stroke="#14b8a6" 
          strokeWidth="2" 
          fill="none"
          opacity="0.3"
        />
      </svg>

      {/* Animated Scan Line */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scan-line"></div>
      </div>

      {/* Cursor Glow Effect */}
      <div 
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Interactive Asset Nodes */}
      {elements.map((element) => {
        const Icon = element.icon;
        const isHovered = hoveredElement === element.id;
        return (
          <div
            key={element.id}
            className="absolute cursor-pointer z-20 group"
            style={{ left: `${element.x}%`, top: `${element.y}%` }}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
          >
            {/* Pulsing Ring */}
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full animate-ping absolute opacity-40"
                style={{ backgroundColor: element.color }}
              ></div>
              <div 
                className={`w-8 h-8 rounded-full relative shadow-2xl flex items-center justify-center transition-all duration-300 ${
                  isHovered ? 'scale-125' : 'scale-100'
                }`}
                style={{ 
                  backgroundColor: element.color,
                  boxShadow: isHovered ? `0 0 30px ${element.color}` : `0 0 15px ${element.color}`
                }}
              >
                <Icon size={16} className="text-white" />
              </div>
            </div>

            {/* Data Tooltip - HUD Style */}
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute left-10 top-0 bg-slate-950/95 border border-teal-500/50 rounded-lg p-4 min-w-[260px] z-30 shadow-2xl backdrop-blur-sm"
                style={{ boxShadow: `0 0 20px ${element.color}40` }}
              >
                <div className="tech-text text-xs text-teal-400 mb-2 font-semibold">// NODE: {element.label}</div>
                <div className="tech-text text-sm text-white mb-1 font-medium">STATUS: {element.status}</div>
                <div className="tech-text text-sm text-gray-300 mb-1">{element.data}</div>
                <div className="tech-text text-xs text-gray-400">LAST_MAINT: {element.lastMaint}</div>
                <div className="h-px bg-teal-500/30 my-2"></div>
                <div className="tech-text text-xs text-teal-300">LIVE_FEED: ACTIVE</div>
              </motion.div>
            )}
          </div>
        );
      })}

      {/* HUD Corner Elements */}
      <div className="absolute top-4 left-4 tech-text text-xs text-teal-400/60">
        <div>SECTOR: RURAL_GRID_04</div>
        <div>ZOOM: 1:5000</div>
      </div>
      <div className="absolute top-4 right-4 tech-text text-xs text-teal-400/60 text-right">
        <div>ASSETS: {elements.length} ONLINE</div>
        <div>LAT: 28.7041° N</div>
      </div>

      <style>{`
        .scan-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #14b8a6, transparent);
          box-shadow: 0 0 15px #14b8a6;
          animation: scan 5s linear infinite;
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .road-glow {
          filter: drop-shadow(0 0 8px #14b8a6);
        }
      `}</style>
    </div>
  );
};

// Before/After Problem Slider Component with Data Overlays
const BeforeAfterSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  return (
    <div 
      className="relative w-full h-[450px] rounded-2xl overflow-hidden cursor-col-resize select-none border-2 border-gray-300 shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Before State (Grayscale Problem) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600" style={{ filter: 'grayscale(100%)' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="max-w-md space-y-6">
            <div className="tech-text text-red-600 text-2xl mb-8 font-bold tracking-tight">// STATUS: CRITICAL</div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-black/20 p-4 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={28} />
                <div>
                  <div className="text-lg font-bold text-gray-900 mb-1">&gt; Delayed Repairs</div>
                  <div className="tech-text text-xs text-gray-700">REPORTED: 10-25-2025</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-black/20 p-4 rounded-lg backdrop-blur-sm">
                <Scale className="text-red-600 flex-shrink-0 mt-1" size={28} />
                <div>
                  <div className="text-lg font-bold text-gray-900 mb-1">&gt; Inequitable Allocation</div>
                  <div className="tech-text text-xs text-gray-700">FUNDING: NOT ALLOCATED</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-black/20 p-4 rounded-lg backdrop-blur-sm">
                <Wallet className="text-red-600 flex-shrink-0 mt-1" size={28} />
                <div>
                  <div className="text-lg font-bold text-gray-900 mb-1">&gt; Opaque Funding</div>
                  <div className="tech-text text-xs text-gray-700">TRANSPARENCY: 0%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* After State (Vibrant Color Solution) */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="max-w-md space-y-6">
            <div className="tech-text text-white text-2xl mb-8 font-bold tracking-tight drop-shadow-lg">// STATUS: SOLVED</div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm border border-white/30">
                <Brain className="text-yellow-300 flex-shrink-0 mt-1" size={28} />
                <div>
                  <div className="text-lg font-bold text-white mb-1">&gt; AI-Scheduled Repair</div>
                  <div className="tech-text text-xs text-teal-100">COMPLETED: 11-01-2025</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm border border-white/30">
                <BarChart3 className="text-yellow-300 flex-shrink-0 mt-1" size={28} />
                <div>
                  <div className="text-lg font-bold text-white mb-1">&gt; Data-Based Allocation</div>
                  <div className="tech-text text-xs text-teal-100">EFFICIENCY: 94%</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white/20 p-4 rounded-lg backdrop-blur-sm border border-white/30">
                <Shield className="text-yellow-300 flex-shrink-0 mt-1" size={28} />
                <div>
                  <div className="text-lg font-bold text-white mb-1">&gt; Provable Transparency</div>
                  <div className="tech-text text-xs text-teal-100">LEDGER_ID: 0x4a7...f3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-white via-teal-400 to-white shadow-2xl z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-teal-500">
          <div className="flex gap-1">
            <div className="text-teal-600 font-bold text-xl">&lt;</div>
            <div className="text-teal-600 font-bold text-xl">&gt;</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 tech-text text-white text-sm bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
        ← DRAG TO COMPARE →
      </div>
    </div>
  );
};

// Interactive Persona Switcher Component
const PersonaSwitcher = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const [activePersona, setActivePersona] = useState<'admin' | 'field' | 'citizen'>('admin');

  const personas = {
    admin: {
      title: 'For Administrators',
      description: 'Allocate budgets, track project KPIs, and get a 30,000-foot view of all infrastructure across your region. Make data-driven decisions with predictive analytics and transparent fund management.',
      features: [
        'Interactive 3D Digital Twin visualization',
        'Predictive maintenance analytics dashboard',
        'Blockchain-backed fund allocation system',
        'Real-time regional performance monitoring',
        'Automated compliance and reporting tools'
      ],
      screenshot: '🖥️',
      color: 'teal'
    },
    citizen: {
      title: 'For Citizens',
      description: 'Report a broken well, track your ticket status, and see public funds at work in your village. Voice-based reporting makes it accessible for everyone, even without internet.',
      features: [
        'Simple voice-based complaint submission',
        'Real-time ticket tracking and updates',
        'View all ongoing projects in your area',
        'See how public funds are being spent',
        'Offline-first mobile app design'
      ],
      screenshot: '📱',
      color: 'blue'
    },
    field: {
      title: 'For Field Workers',
      description: 'Receive prioritized job tickets, upload proof-of-work photos with GPS tagging, and manage equipment inventory—all through an offline-first app designed for rural connectivity.',
      features: [
        'AI-prioritized task queue with routing',
        'Geo-tagged photo proof of work',
        'Offline data sync when connected',
        'Equipment and inventory management',
        'Simplified reporting interface'
      ],
      screenshot: '📲',
      color: 'green'
    }
  };

  const current = personas[activePersona];

  return (
    <div className="space-y-8">
      {/* Persona Toggles */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setActivePersona('admin')}
          className={`px-8 py-4 rounded-xl tech-text text-lg font-semibold transition-all ${
            activePersona === 'admin'
              ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/40 scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          [ For Administrators ]
        </button>
        <button
          onClick={() => setActivePersona('field')}
          className={`px-8 py-4 rounded-xl tech-text text-lg font-semibold transition-all ${
            activePersona === 'field'
              ? 'bg-green-600 text-white shadow-xl shadow-green-600/40 scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          [ For Field Workers ]
        </button>
        <button
          onClick={() => setActivePersona('citizen')}
          className={`px-8 py-4 rounded-xl tech-text text-lg font-semibold transition-all ${
            activePersona === 'citizen'
              ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40 scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          [ For Citizens ]
        </button>
      </div>

      {/* Dynamic Content */}
      <motion.div
        key={activePersona}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`bg-gradient-to-br ${
          activePersona === 'admin' ? 'from-teal-50 to-teal-100 border-teal-300' :
          activePersona === 'citizen' ? 'from-blue-50 to-blue-100 border-blue-300' :
          'from-green-50 to-green-100 border-green-300'
        } rounded-3xl p-10 border-2 shadow-2xl`}
      >
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Screenshot Placeholder */}
          <div className={`bg-white rounded-2xl p-12 flex items-center justify-center text-9xl shadow-xl border-4 ${
            activePersona === 'admin' ? 'border-teal-300' :
            activePersona === 'citizen' ? 'border-blue-300' :
            'border-green-300'
          }`}>
            {current.screenshot}
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h3 className="text-4xl font-bold text-gray-900">{current.title}</h3>
            <p className="text-lg text-gray-700 leading-relaxed">{current.description}</p>
            
            <div className="space-y-3">
              {current.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className={`mt-1 flex-shrink-0 ${
                    activePersona === 'admin' ? 'text-teal-600' :
                    activePersona === 'citizen' ? 'text-blue-600' :
                    'text-green-600'
                  }`} size={20} />
                  <span className="text-gray-800 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onGetStarted}
              className={`mt-6 px-8 py-4 rounded-xl tech-text text-lg font-bold text-white transition-all flex items-center gap-3 ${
                activePersona === 'admin' ? 'bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-600/30' :
                activePersona === 'citizen' ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30' :
                'bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/30'
              }`}
            >
              Try {current.title.split(' ')[1]} Demo
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Section wrapper with fade-in animation
const AnimatedSection = ({ children, className = "" }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const statsRef = useRef(null);
  const isStatsInView = useInView(statsRef, { once: true });

  return (
    <div className="landing-page min-h-screen bg-white">
      {/* Persistent Glossy Nav Bar - Enhanced & Responsive */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/10 shadow-2xl"
        style={{
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/favicon.jpg" alt="RuraLens" className="w-8 h-8 md:w-10 md:h-10 rounded-lg" />
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-white tech-text tracking-tight">RuraLens</span>
          </div>
          <div className="flex items-center gap-3 md:gap-8">
            <a href="#problem" className="hidden sm:inline text-gray-300 hover:text-teal-400 transition-colors font-medium text-sm md:text-base">Problem</a>
            <a href="#solution" className="hidden sm:inline text-gray-300 hover:text-teal-400 transition-colors font-medium text-sm md:text-base">Solution</a>
            <a href="#users" className="hidden lg:inline text-gray-300 hover:text-teal-400 transition-colors font-medium text-sm md:text-base">For Whom</a>
            <button
              onClick={onGetStarted}
              className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-all font-semibold shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 tech-text text-xs sm:text-sm md:text-base"
            >
              <span className="hidden sm:inline">[ LOGIN ]</span>
              <span className="sm:hidden">LOGIN</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Live Data Ticker - Hidden on mobile */}
      <div className="hidden md:block fixed top-[73px] left-0 right-0 z-40">
        <LiveDataTicker />
      </div>

      {/* Hero Section with Interactive Digital Twin */}
      <section className="pt-24 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-3 sm:px-6 bg-gradient-to-b from-gray-50 to-white min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-4 sm:space-y-6 md:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <span className="px-4 py-2 bg-teal-100 text-teal-800 rounded-lg tech-text text-sm font-bold border-2 border-teal-300">
                  // SYSTEM_STATUS: OPERATIONAL
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight"
              >
                From Infrastructure{' '}
                <span className="text-teal-600">Blindness</span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                to Digital{' '}
                <span className="text-teal-600">Foresight</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed"
              >
                The digital twin platform for rural India. Real-time monitoring, predictive analytics, and transparent, performance-based fund management for 600,000+ villages.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <button
                  onClick={onGetStarted}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-teal-600/30 hover:shadow-2xl hover:shadow-teal-600/40 transform hover:-translate-y-1"
                >
                  <span>[ Request Demo ]</span>
                  <ArrowRight size={18} className="sm:hidden" />
                  <ArrowRight size={22} className="hidden sm:block" />
                </button>
                <a
                  href="#solution"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all font-bold text-base sm:text-lg border-2 border-gray-300 hover:border-teal-600 transform hover:-translate-y-1 text-center"
                >
                  [ See How It Works ]
                </a>
              </motion.div>

              {/* Animated Stats */}
              <motion.div
                ref={statsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 pt-6 md:pt-8 border-t-2 border-gray-200"
              >
                <div>
                  <div className="text-4xl font-bold text-teal-600 tech-text">
                    {isStatsInView && <CountUp end={600} duration={2.5} suffix="K+" />}
                  </div>
                  <div className="text-sm text-gray-600 font-medium mt-1">Villages</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-teal-600 tech-text">
                    {isStatsInView && <CountUp end={2.4} decimals={1} duration={2.5} prefix="₹" suffix="L Cr" />}
                  </div>
                  <div className="text-sm text-gray-600 font-medium mt-1">Annual Budget</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-teal-600 tech-text">Real-time</div>
                  <div className="text-sm text-gray-600 font-medium mt-1">Monitoring</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Interactive Digital Twin */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <DigitalTwinHero />
              <p className="text-center text-sm text-gray-500 mt-4 tech-text">
                // Hover over nodes to inspect live data
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem Section with Before/After Slider */}
      <section id="problem" className="py-24 px-6 bg-gray-50 scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              A <span className="text-teal-600">₹2.4 Lakh Crore</span> Guessing Game
            </h2>
            <p className="text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              India's <strong className="font-bold">600,000+ villages</strong> manage budgets over{' '}
              <strong className="font-bold">₹2.4 lakh crore</strong>, but 'infrastructure blindness' leads to delayed repairs and inefficient use of funds.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <BeforeAfterSlider />
          </AnimatedSection>
        </div>
      </section>

      {/* The Solution Section */}
      <section id="solution" className="py-24 px-6 bg-white scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              A Single Platform for{' '}
              <span className="text-teal-600">Total Transparency</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Cutting-edge technology meets grassroots governance.
            </p>
          </AnimatedSection>

          {/* Feature Pillars */}
          <div className="grid lg:grid-cols-3 gap-10">
            <AnimatedSection className="group">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all border-2 border-teal-200 h-full">
                <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Brain className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Monitoring</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Combine satellite data, mobile uploads, and citizen reports. Our AI automatically detects infrastructure damage and predicts failures before they happen.
                </p>
                <div className="tech-text text-sm text-teal-700 bg-teal-200/50 p-3 rounded-lg">
                  <div>&gt; Real-time anomaly detection</div>
                  <div>&gt; Predictive maintenance alerts</div>
                  <div>&gt; Multi-source data fusion</div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="group">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all border-2 border-teal-200 h-full">
                <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Shield className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Blockchain Transparency</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Performance-based budgeting using smart contracts and immutable ledgers. Funds are disbursed only upon verified task completion.
                </p>
                <div className="tech-text text-sm text-teal-700 bg-teal-200/50 p-3 rounded-lg">
                  <div>&gt; Tamper-proof transaction logs</div>
                  <div>&gt; Automated fund disbursement</div>
                  <div>&gt; Performance-based allocation</div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="group">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all border-2 border-teal-200 h-full">
                <div className="w-20 h-20 bg-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Connected Ecosystem</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Offline-first apps and voice-based citizen portals keep everyone from field workers to villagers connected.
                </p>
                <div className="tech-text text-sm text-teal-700 bg-teal-200/50 p-3 rounded-lg">
                  <div>&gt; Offline-first mobile apps</div>
                  <div>&gt; Voice-based interfaces</div>
                  <div>&gt; Optimized task routing</div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* The Users Section with Persona Switcher */}
      <section id="users" className="py-24 px-6 bg-gray-50 scroll-mt-28">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              A Platform for <span className="text-teal-600">Everyone</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Designed for the entire ecosystem—from citizens to field workers to administrators.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <PersonaSwitcher onGetStarted={onGetStarted} />
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(to right, #0d9488 1px, transparent 1px),
            linear-gradient(to bottom, #0d9488 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 tech-text">
              Ready to build smarter, more equitable villages?
            </h2>
            <p className="text-xl text-teal-300 mb-12 font-medium">
              Join the future of rural infrastructure management with data-driven transparency.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <button
                onClick={onGetStarted}
                className="px-12 py-5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold text-lg shadow-2xl flex items-center gap-3 hover:scale-105 transform tech-text"
              >
                [ Request a Demo ]
                <ArrowRight size={24} />
              </button>
              <button
                onClick={onGetStarted}
                className="px-12 py-5 bg-white text-slate-900 rounded-xl hover:bg-gray-100 transition-all font-bold text-lg border-2 border-teal-500 hover:scale-105 transform tech-text"
              >
                [ Login to Platform ]
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-slate-950 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/favicon.jpg" alt="RuraLens" className="w-10 h-10" />
                <span className="text-2xl font-bold text-white tech-text">RuraLens</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed tech-text">
                // Powered by IoT, AI & Real-time Analytics
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4 text-lg tech-text">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#problem" className="hover:text-teal-400 transition-colors">Problem</a></li>
                <li><a href="#solution" className="hover:text-teal-400 transition-colors">Solution</a></li>
                <li><a href="#users" className="hover:text-teal-400 transition-colors">For Whom</a></li>
                <li><button onClick={onGetStarted} className="hover:text-teal-400 transition-colors">Login</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-lg tech-text">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-lg tech-text">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="https://github.com/Abhishekmishra2808/village-digital-twin" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500 tech-text">
            <p>© 2025 RuraLens. All rights reserved. Built for smarter, more equitable rural India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
