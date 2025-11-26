import React from 'react';
import { ArrowRight, Bell, ShieldCheck, Map } from 'lucide-react';

interface MobileLandingPageProps {
  onGetStarted: () => void;
}

export default function MobileLandingPage({ onGetStarted }: MobileLandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900" />

      {/* Glow accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-10 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />

      {/* Radar circle bottom-right */}
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full border border-slate-700/60">
        <div className="absolute inset-6 rounded-full border border-slate-700/50" />
        <div className="absolute inset-12 rounded-full border border-slate-700/40" />
        <div className="absolute inset-1/2 h-px w-full -translate-y-1/2 bg-slate-700/60" />
        <div className="absolute inset-1/2 h-full w-px -translate-x-1/2 bg-slate-700/60" />
      </div>

      {/* Top section */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600">
            <Map size={20} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
              RURALENS
            </span>
            <span className="text-sm font-semibold text-slate-100">
              Smart Village Hub
            </span>
          </div>
        </div>

        <div className="text-right text-[9px] leading-tight text-slate-400 uppercase tracking-[0.24em]">
          <p>MOBILE APP V1.0</p>
          <p className="text-[9px] text-blue-400 mt-0.5">DATA-DRIVEN INSIGHTS</p>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col px-6 pb-8">
        {/* Hero text */}
        <div className="mt-8">
          <h1 className="text-[34px] font-black leading-[1.05] tracking-tight">
            Smart Village
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              In Your Pocket
            </span>
          </h1>

          <p className="mt-4 max-w-xs text-[13px] text-slate-300 leading-relaxed">
            Monitor infrastructure, report issues, and track government schemes
            directly from your phone.
          </p>
        </div>

        {/* Feature list */}
        <div className="mt-8 space-y-4 text-sm font-semibold text-slate-100">
          <FeatureLine
            icon={<Bell size={16} className="text-orange-400" />}
            text="Instant alerts for water & power outages."
          />
          <FeatureLine
            icon={<Map size={16} className="text-blue-400" />}
            text="Interactive village map with real-time status."
          />
          <FeatureLine
            icon={<ShieldCheck size={16} className="text-emerald-400" />}
            text="Secure, anonymous issue reporting."
          />
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          <StatBox value="600+" label="Villages" />
          <StatBox value="10k+" label="Users" />
          <StatBox value="99%" label="Uptime" />
        </div>

        {/* How it works */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">How it works</h3>
          <div className="space-y-4 relative pl-4 border-l border-slate-800">
            <StepItem 
              title="Connect" 
              desc="Sign in with your secure ID." 
            />
            <StepItem 
              title="Monitor" 
              desc="View real-time infrastructure status." 
            />
            <StepItem 
              title="Report" 
              desc="Submit issues directly to admin." 
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <div className="mt-6 mb-4">
          <button
            onClick={onGetStarted}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-semibold shadow-lg shadow-blue-500/40 transition-all active:scale-[0.98] hover:bg-blue-500"
          >
            Get Started
            <ArrowRight size={18} />
          </button>

          <p className="mt-3 text-center text-[10px] text-slate-500">
            By continuing, you agree to our Terms of Service.
          </p>
        </div>
      </main>
    </div>
  );
}

function FeatureLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80">
        {icon}
      </div>
      <p className="text-[13px] leading-snug text-slate-200">{text}</p>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-white/5 p-3 text-center">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function StepItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-600 border-2 border-slate-950" />
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  );
}
