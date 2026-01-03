import { useState } from 'react';
import { User, Shield, Briefcase, ChevronRight, Lock, Mail, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { API_URL } from '../../config/api';

const roles = [
  { 
    id: 'user' as const, 
    name: 'Citizen', 
    icon: User, 
    description: 'View schemes and submit feedback' 
  },
  { 
    id: 'admin' as const, 
    name: 'Administrator', 
    icon: Shield, 
    description: 'Manage schemes and monitor feedback' 
  },
  { 
    id: 'field_worker' as const, 
    name: 'Field Worker', 
    icon: Briefcase, 
    description: 'Update field data and reports' 
  },
];

interface LoginPageProps {
  onBack?: () => void;
}

export default function LoginPage({ onBack }: LoginPageProps) {
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

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update store - login(role, username)
      login(data.user.role, data.user.name);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Quick login for demo
  const quickLogin = async (demoEmail: string, demoPassword: string, demoRole: 'admin' | 'field_worker' | 'user') => {
    setSelectedRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setIsRegister(false);
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPassword })
      });

      // Check if response has content before parsing JSON
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Update store - login(role, username)
      login(data.user.role, data.user.name);

    } catch (err: any) {
      setError(err.message || 'Demo login failed. Server may not be running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-6 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/60 to-slate-950 pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      
      <div className="w-full max-w-6xl relative z-10">
        {/* Back Button - Always visible at top */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn flex flex-col items-center">
          <img src="/ruralens-logo.png" alt="RuraLens Logo" className="w-24 h-24 object-contain mb-4" />
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            RuraLens
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto">
            AI-Powered Government Schemes Monitoring • Anonymous Citizen Feedback • Real-time Analytics
          </p>
        </div>

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {roles.map((role) => {
                const RoleIcon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className="group relative p-8 rounded-3xl transition-all duration-500 text-left bg-slate-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/80 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
                  >
                    <div className="flex flex-col h-full">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-slate-800 border border-white/5 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all">
                        <RoleIcon size={24} className="text-slate-300 group-hover:text-blue-400" />
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 text-white">{role.name}</h3>
                      <p className="text-sm mb-4 flex-grow text-slate-400 group-hover:text-slate-300">
                        {role.description}
                      </p>
                      
                      <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-blue-400 transition-colors">
                        Select
                        <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Demo Login */}
            <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-8 text-center backdrop-blur-sm">
              <p className="text-sm text-slate-400 mb-4 font-medium">Quick Demo Access:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => quickLogin('admin@village.com', 'admin123', 'admin')}
                  disabled={loading}
                  className="bg-purple-500/10 border border-purple-500/20 text-purple-300 py-4 px-6 rounded-xl hover:bg-purple-500/20 transition-colors disabled:opacity-50 font-medium text-base"
                >
                  Admin Demo
                </button>
                <button
                  onClick={() => quickLogin('field@village.com', 'field123', 'field_worker')}
                  disabled={loading}
                  className="bg-blue-500/10 border border-blue-500/20 text-blue-300 py-4 px-6 rounded-xl hover:bg-blue-500/20 transition-colors disabled:opacity-50 font-medium text-base"
                >
                  Field Demo
                </button>
                <button
                  onClick={() => quickLogin('citizen@village.com', 'user123', 'user')}
                  disabled={loading}
                  className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 py-4 px-6 rounded-xl hover:bg-emerald-500/20 transition-colors disabled:opacity-50 font-medium text-base"
                >
                  Citizen Demo
                </button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center space-x-2 text-red-400">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {loading && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-slate-400">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">Logging in...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Login/Register Form */
          <div className="max-w-md mx-auto animate-fadeIn">
            <button
              onClick={() => { setSelectedRole(null); setError(''); }}
              className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 transition-colors text-sm"
            >
              ← Back
            </button>

            <div className="bg-slate-900/50 border border-white/5 backdrop-blur-md rounded-3xl p-10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">
                {isRegister ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-sm text-slate-400 mb-8 text-center">
                as {roles.find(r => r.id === selectedRole)?.name}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-4 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                        placeholder="Full Name"
                        required={isRegister}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                      placeholder="Password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isRegister ? 'Create Account' : 'Continue'}</span>
                  )}
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

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-xs text-slate-500 mb-2">Demo credentials:</p>
                <p className="text-xs text-slate-400">admin@village.com / admin123</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-500">
            Powered by MongoDB • Gemini AI • Real-time WebSocket
          </p>
        </div>
      </div>
    </div>
  );
}
