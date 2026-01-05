import { 
  ArrowRight, 
  Menu,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  LucideIcon
} from 'lucide-react';

// --- Constants ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop", 
  // Audit AI - Financial/document analysis image
  auditAI: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop",
  // Scheme Bot - AI/chatbot/conversation image  
  schemeBot: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=800&auto=format&fit=crop",
  // Anonymous - Privacy/security/shield image
  anonymous: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop",
  drone: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800&auto=format&fit=crop"
};

// --- Types ---
interface FeatureCardProps {
  title: string;
  subtitle: string;
  img: string;
  icon: LucideIcon;
  colorClass: string;
}

interface LandingScreenProps {
  onStart: () => void;
}

// --- Sub-components ---

const FeatureCard = ({ title, subtitle, img, icon: Icon, colorClass }: FeatureCardProps) => (
  <div className="relative min-w-[240px] h-[160px] rounded-2xl overflow-hidden snap-center border border-white/20 shadow-2xl shrink-0 group">
    {/* Background Image with Overlay */}
    <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
    <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/50 transition-colors" />
    
    {/* Content */}
    <div className="absolute inset-0 p-5 flex flex-col justify-between">
      <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center backdrop-blur-md bg-opacity-80`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <h3 className="text-white font-bold text-lg leading-tight mb-1">{title}</h3>
        <p className="text-white/70 text-xs font-medium">{subtitle}</p>
      </div>
    </div>
  </div>
);

// --- Main Views ---

const LandingScreen = ({ onStart }: LandingScreenProps) => {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-900 font-sans">
      
      {/* 1. IMMERSIVE BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img 
          src={IMAGES.hero} 
          alt="Rural Landscape" 
          className="w-full h-full object-cover animate-slow-zoom opacity-90"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      {/* 2. TOP BAR (Floating) */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/ruralens-logo.png" 
            alt="RuraLens Logo" 
            className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
          />
          <span className="text-white font-bold text-lg tracking-tight drop-shadow-md">RuraLens</span>
        </div>
        <button className="text-white/90 hover:text-white p-2 bg-white/10 backdrop-blur-md rounded-full">
          <Menu size={20} />
        </button>
      </header>

      {/* 3. MAIN VISUAL DECORATION (Floating Data Tags) */}
      <div className="absolute top-[20%] left-6 z-10 animate-fade-in-delayed">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-lg">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-amber-100 text-xs font-mono tracking-wider">ALERT: Vendor Discrepancy Found</span>
        </div>
      </div>

      {/* 4. BOTTOM INTERACTION PANEL (The "No Scroll" Content Area) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col justify-end pb-8">
        
        {/* Headlines */}
        <div className="px-6 mb-6">
          <h1 className="text-4xl font-bold text-white leading-[1.05] mb-2 drop-shadow-xl">
            Smart Villages,<br />
            <span className="text-emerald-400">Digitally Twin'd.</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-[280px] leading-relaxed">
            Monitor schemes, verify vendors, and protect citizen identity.
          </p>
        </div>

        {/* Horizontal Scroll "Bento" Deck */}
        <div className="w-full mb-8">
          <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x scrollbar-hide no-scrollbar">
            {/* Feature 1: Discrepancy Detection */}
            <FeatureCard 
              title="Audit AI" 
              subtitle="Scheme vs Vendor Check" 
              img={IMAGES.auditAI} 
              icon={AlertCircle}
              colorClass="bg-red-500"
            />
            {/* Feature 2: Live RAG */}
            <FeatureCard 
              title="Scheme Bot" 
              subtitle="Live RAG Q&A" 
              img={IMAGES.schemeBot} 
              icon={MessageSquare}
              colorClass="bg-blue-500"
            />
            {/* Feature 3: Anonymization */}
            <FeatureCard 
              title="Anonymous" 
              subtitle="Secure Feedback" 
              img={IMAGES.anonymous} 
              icon={ShieldCheck}
              colorClass="bg-emerald-500"
            />
            {/* Spacer for right padding */}
            <div className="min-w-[10px] shrink-0" />
          </div>
        </div>

        {/* Primary CTA */}
        <div className="px-6">
          <button 
            onClick={onStart}
            className="w-full bg-white text-slate-900 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 flex items-center justify-between px-2 pl-6 group active:scale-95 transition-all"
          >
            <span>Launch Dashboard</span>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-emerald-600 transition-colors">
              <ArrowRight size={20} />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Entry Point ---

interface MobileLandingPageProps {
  onGetStarted: () => void;
}

export default function MobileLandingPage({ onGetStarted }: MobileLandingPageProps) {
  return (
    <>
      <style>{`
        /* Utility to hide scrollbar but keep functionality */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s infinite alternate linear;
        }
        .animate-fade-in-delayed {
           animation: fadeIn 1s ease-out 0.5s forwards;
           opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
      `}</style>
      
      <LandingScreen onStart={onGetStarted} />
    </>
  );
}