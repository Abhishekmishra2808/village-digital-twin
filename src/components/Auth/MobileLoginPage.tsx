import { useState } from 'react';
import { User, Shield, Briefcase, ArrowLeft, Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { API_URL } from '../../config/api';

interface MobileLoginPageProps {
  onBack?: () => void;
}

export default function MobileLoginPage({ onBack }: MobileLoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'field_worker' | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useVillageStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? { email, password, name, role: selectedRole }
        : { email, password };

      console.log('🔐 Attempting login:', { endpoint: `${API_URL}${endpoint}`, email });

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      console.log('📡 Response status:', response.status);

      const text = await response.text();
      console.log('📄 Response text:', text);
      
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user.role, data.user.name);

      console.log('✅ Login successful');

    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string, demoRole: 'admin' | 'field_worker' | 'user') => {
    setSelectedRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsRegister(false);
    setError('');
    setLoading(true);

    try {
      console.log('🚀 Quick login:', { url: `${API_URL}/api/auth/login`, email: demoEmail });

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });

      console.log('📡 Quick login response:', response.status);

      const text = await response.text();
      console.log('📄 Quick login response text:', text);
      
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user.role, data.user.name);

      console.log('✅ Quick login successful');

    } catch (err: any) {
      console.error('❌ Quick login error:', err);
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col">
        {onBack && (
          <button onClick={onBack} className="self-start mb-6 p-2 -ml-2 text-slate-400">
            <ArrowLeft size={24} />
          </button>
        )}
        
        <div className="flex flex-col items-center mb-10 mt-4">
          <img src="/ruralens-logo.png" alt="Logo" className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold">Welcome to RuraLens</h1>
          <p className="text-slate-400 text-sm">Select your role to continue</p>
        </div>

        <div className="space-y-4 flex-1">
          <RoleCard 
            icon={User} 
            title="Citizen" 
            desc="View schemes & report issues"
            onClick={() => setSelectedRole('user')}
            color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          />
          <RoleCard 
            icon={Briefcase} 
            title="Field Worker" 
            desc="Update status & verify reports"
            onClick={() => setSelectedRole('field_worker')}
            color="bg-orange-500/10 border-orange-500/20 text-orange-400"
          />
          <RoleCard 
            icon={Shield} 
            title="Administrator" 
            desc="Manage village infrastructure"
            onClick={() => setSelectedRole('admin')}
            color="bg-purple-500/10 border-purple-500/20 text-purple-400"
          />
        </div>

        <div className="mt-8">
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest mb-4">Quick Demo Access</p>
          <div className="grid grid-cols-3 gap-2">
            <DemoButton label="Citizen" onClick={() => quickLogin('citizen@village.com', 'user123', 'user')} />
            <DemoButton label="Worker" onClick={() => quickLogin('field@village.com', 'field123', 'field_worker')} />
            <DemoButton label="Admin" onClick={() => quickLogin('admin@village.com', 'admin123', 'admin')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col">
      <button 
        onClick={() => { setSelectedRole(null); setError(''); }}
        className="self-start mb-8 flex items-center gap-2 text-slate-400"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">Back to Roles</span>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-sm">
            Login as <span className="text-white font-medium capitalize">{selectedRole.replace('_', ' ')}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs text-slate-400 ml-1">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="John Doe"
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, title, desc, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all active:scale-[0.98] ${color}`}
    >
      <div className="p-3 rounded-lg bg-slate-900/50">
        <Icon size={24} />
      </div>
      <div className="text-left">
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-xs opacity-80">{desc}</p>
      </div>
    </button>
  );
}

function DemoButton({ label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
    >
      {label}
    </button>
  );
}
