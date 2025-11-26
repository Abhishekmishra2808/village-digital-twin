import { Bell } from 'lucide-react';

export default function MobileHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-slate-900/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-2">
        <img src="/ruralens-logo.png" alt="Logo" className="w-8 h-8" />
        <span className="font-bold text-white text-lg">RuraLens</span>
      </div>
      <button className="p-2 rounded-full hover:bg-white/10 text-slate-300">
        <Bell size={20} />
      </button>
    </div>
  );
}
