import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Database,
  Globe2,
  Zap,
  ChevronRight,
  Play,
  Activity,
  LayoutDashboard,
  Server,
  Lock
} from 'lucide-react';
import { useRef } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smooth scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // --- Parallax & Transformation Effects ---
  
  // 1. Background Scale (Subtle zoom)
  const heroScale = useTransform(smoothProgress, [0, 1], [1, 1.1]);
  
  // 2. Hero Content Fade & Slide (Moves up and fades out)
  const heroOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(smoothProgress, [0, 0.5], ["0%", "-10%"]);
  
  // 3. Content Layer Slide (Comes up over the hero)
  const contentY = useTransform(smoothProgress, [0.15, 0.8], ["100vh", "0vh"]);
  
  // 4. Blur Effect for Background
  const bgBlur = useTransform(smoothProgress, [0, 0.8], ["blur(0px)", "blur(8px)"]);

  return (
    <div ref={containerRef} className="relative bg-slate-950 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* === SECTION 1: STICKY IMMERSIVE HERO === */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Animated Background Layer */}
        <motion.div 
          style={{ scale: heroScale, filter: bgBlur }}
          className="absolute inset-0 z-0"
        >
          {/* Base Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950/90 to-slate-950 z-10" />
          
          {/* Sophisticated Gradient Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/60 to-slate-950" />
          
          {/* Animated Orbs - Calmer colors */}
          <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] bg-emerald-600/5 rounded-full blur-[100px]" />
        </motion.div>

        {/* Hero Foreground Content */}
        <div className="relative z-20 h-full flex flex-col justify-between pt-6 pb-12 px-6 max-w-7xl mx-auto">
          {/* Navbar */}
          <nav className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img src="/ruralens-logo.png" alt="RuraLens Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300" />
              <span className="text-xl font-bold text-white tracking-tight">
                RuraLens
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
               <NavButton label="Platform" />
               <NavButton label="Solutions" />
               <NavButton label="Resources" />
            </div>

            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-white/10 border border-white/10 text-white rounded-full font-medium text-sm hover:bg-white hover:text-slate-950 transition-all duration-300"
            >
              Sign In
            </button>
          </nav>

          {/* Hero Center Text */}
          <motion.div 
            style={{ opacity: heroOpacity, y: heroY }}
            className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mt-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-blue-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Next Gen GovTech
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1]">
              The Digital Twin for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Rural Governance
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
              Empowering administration with real-time infrastructure monitoring, transparent fund tracking, and AI-driven insights for smarter villages.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 w-full justify-center pt-6">
              <button 
                onClick={onGetStarted}
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                Launch Platform
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="px-8 py-4 text-slate-300 hover:text-white font-medium transition-all flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors">
                  <Play size={12} className="ml-0.5 fill-current" />
                </div>
                View Demo
              </button>
            </div>
          </motion.div>

          {/* Bottom Ticker */}
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="flex flex-col items-center gap-4 pb-8"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-slate-500/50 to-transparent" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-widest">Scroll to Explore</span>
          </motion.div>
        </div>
      </div>

      {/* === SECTION 2: CONTENT LAYER === */}
      <div className="relative z-30 -mt-[10vh] min-h-screen">
        
        {/* Glass Card Container simulating the slide-up effect */}
        <div className="bg-slate-950 rounded-t-[3rem] border-t border-white/10 shadow-[0_-50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Stats Bar */}
          <div className="w-full border-b border-white/5 py-12 bg-slate-900/30 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatItem value="600K+" label="Villages Covered" />
                <StatItem value="₹2.4T" label="Funds Managed" />
                <StatItem value="10M+" label="Daily Data Points" />
                <StatItem value="99.9%" label="Uptime SLA" />
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <section id="features" className="py-32 px-6 bg-slate-950">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                <div className="max-w-2xl">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                    Comprehensive <span className="text-blue-500">Oversight</span>
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    An integrated suite of enterprise-grade tools designed to modernize rural infrastructure management and ensure accountability.
                  </p>
                </div>
                <button className="text-white font-medium flex items-center gap-2 hover:text-blue-400 transition-colors group">
                  View all capabilities 
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard 
                  icon={<Zap className="text-blue-400" />}
                  title="IoT Infrastructure Grid"
                  desc="Real-time telemetry from water, power, and environmental sensors with predictive maintenance alerts."
                />
                <FeatureCard 
                  icon={<ShieldCheck className="text-emerald-400" />}
                  title="Fiscal Transparency"
                  desc="Blockchain-verified fund allocation and utilization tracking to prevent discrepancies."
                />
                <FeatureCard 
                  icon={<Users className="text-indigo-400" />}
                  title="Citizen Engagement"
                  desc="Secure, anonymous reporting channels connecting residents directly to administration."
                />
                <FeatureCard 
                  icon={<Database className="text-purple-400" />}
                  title="Neural Search (RAG)"
                  desc="Instant access to thousands of government documents using natural language queries."
                />
                <FeatureCard 
                  icon={<Globe2 className="text-cyan-400" />}
                  title="Spatial Digital Twin"
                  desc="High-fidelity 3D visualization of village assets for better planning and response."
                />
                <FeatureCard 
                  icon={<Activity className="text-rose-400" />}
                  title="Predictive Analytics"
                  desc="Machine learning models that forecast resource needs and potential system failures."
                />
              </div>
            </div>
          </section>

          {/* Tech Stack Strip */}
          <section className="py-20 border-y border-white/5 bg-slate-900/20">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-10">Trusted Enterprise Technology</p>
              <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Icons/Logos could go here */}
                <div className="flex items-center gap-2 text-white"><Server size={24} /> MongoDB</div>
                <div className="flex items-center gap-2 text-white"><LayoutDashboard size={24} /> React</div>
                <div className="flex items-center gap-2 text-white"><Lock size={24} /> Blockchain</div>
                <div className="flex items-center gap-2 text-white"><Zap size={24} /> WebSocket</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none" />
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                Ready to Modernize?
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Join the network of smart villages. Deploy your digital twin today and transform governance.
              </p>
              
              <button 
                onClick={onGetStarted}
                className="px-10 py-4 bg-white text-slate-950 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-xl shadow-blue-500/10"
              >
                Get Started Now
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-slate-950 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 opacity-80">
                <img src="/ruralens-logo.png" alt="RuraLens Logo" className="w-6 h-6 object-contain" />
                <span className="font-bold text-white">RuraLens</span>
              </div>
              
              <div className="flex gap-8 text-sm text-slate-500">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
              </div>

              <div className="text-slate-600 text-xs">
                © 2025 RuraLens Inc. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function NavButton({ label }: { label: string }) {
  return (
    <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
      {label}
    </button>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center md:text-left">
      <div className="text-3xl md:text-4xl font-bold text-white mb-1 tracking-tight">
        {value}
      </div>
      <div className="text-sm text-slate-500 font-medium">
        {label}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-800/50 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}