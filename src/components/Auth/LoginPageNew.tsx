import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Briefcase, ChevronRight, Lock, Mail, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { useVillageStore } from '../../store/villageStore';
import { API_URL } from '../../config/api';

const roles = [
  { 
    id: 'admin' as const, 
    name: 'Administrator', 
    icon: Shield, 
    description: 'Manage schemes & analytics',
    color: 'from-purple-500 to-indigo-600',
    accent: 'text-purple-400',
    border: 'group-hover:border-purple-500/50',
    bg: 'group-hover:bg-purple-500/10',
    shadow: 'group-hover:shadow-purple-500/20'
  },
  { 
    id: 'field_worker' as const, 
    name: 'Field Worker', 
    icon: Briefcase, 
    description: 'Update field data & reports',
    color: 'from-orange-500 to-amber-600',
    accent: 'text-orange-400',
    border: 'group-hover:border-orange-500/50',
    bg: 'group-hover:bg-orange-500/10',
    shadow: 'group-hover:shadow-orange-500/20'
  },
  { 
    id: 'user' as const, 
    name: 'Citizen', 
    icon: User, 
    description: 'View schemes & feedback',
    color: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-400',
    border: 'group-hover:border-emerald-500/50',
    bg: 'group-hover:bg-emerald-500/10',
    shadow: 'group-hover:shadow-emerald-500/20'
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
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/80 to-slate-950 pointer-events-none" />
      <div className="absolute top-[-20%] left-[10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[10%] w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="w-full max-w-6xl relative z-10 px-6 flex flex-col h-full justify-center">
        {/* Back Button - Absolute positioned */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="absolute top-8 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </motion.button>
        )}

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 flex flex-col items-center shrink-0"
        >
          <div className="relative mb-4 group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>
            <img 
              src="/ruralens-logo.png" 
              alt="RuraLens Logo" 
              className="w-20 h-20 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform duration-500 group-hover:scale-110" 
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-slate-300">
            RuraLens
          </h1>
          <p className="text-base text-slate-400 font-light max-w-xl mx-auto tracking-wide">
            Empowering Rural India with <span className="text-blue-400 font-medium">AI</span> & <span className="text-emerald-400 font-medium">Transparency</span>
          </p>
        </motion.div>

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-4 mb-2"
            >
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-slate-700"></div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Choose your portal</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-slate-700"></div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {roles.map((role, index) => {
                const RoleIcon = role.icon;
                return (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setSelectedRole(role.id)}
                    className={`group relative p-6 rounded-2xl transition-all duration-300 text-left bg-slate-900/40 border border-white/5 hover:border-transparent ${role.border} ${role.bg} hover:-translate-y-1 hover:shadow-2xl ${role.shadow} flex flex-col items-center text-center overflow-hidden`}
                  >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                    
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-slate-800/50 border border-white/5 group-hover:scale-110 transition-transform duration-300 ${role.accent}`}>
                      <RoleIcon size={28} strokeWidth={1.5} />
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 text-white group-hover:text-white transition-colors">{role.name}</h3>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 leading-relaxed mb-4">
                      {role.description}
                    </p>

                    <div className={`mt-auto flex items-center text-xs font-bold uppercase tracking-wider ${role.accent} opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300`}>
                      Enter Portal <ChevronRight size={14} className="ml-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Quick Demo Login - Enhanced */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-900/20 border border-white/5 rounded-2xl p-5 text-center backdrop-blur-sm max-w-3xl mx-auto w-full"
            >
              <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">Quick Demo Access</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => quickLogin('admin@village.com', 'admin123', 'admin')}
                  disabled={loading}
                  className="group relative overflow-hidden bg-transparent border border-purple-500/30 text-purple-300 py-2.5 px-4 rounded-xl hover:bg-purple-500/10 transition-all disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Shield size={14} className="text-purple-400" />
                  <span>Admin Demo</span>
                </button>
                <button
                  onClick={() => quickLogin('field@village.com', 'field123', 'field_worker')}
                  disabled={loading}
                  className="group relative overflow-hidden bg-transparent border border-orange-500/30 text-orange-300 py-2.5 px-4 rounded-xl hover:bg-orange-500/10 transition-all disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Briefcase size={14} className="text-orange-400" />
                  <span>Field Demo</span>
                </button>
                <button
                  onClick={() => quickLogin('citizen@village.com', 'user123', 'user')}
                  disabled={loading}
                  className="group relative overflow-hidden bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 py-2.5 px-4 rounded-xl hover:bg-emerald-500/20 transition-all disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <User size={14} className="text-emerald-400" />
                  <span>Citizen Demo</span>
                </button>
              </div>
              
              {(error || loading) && (
                <div className="mt-3 flex items-center justify-center">
                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                      <AlertCircle size={12} />
                      <span className="text-xs">{error}</span>
                    </div>
                  )}
                  {loading && (
                    <div className="flex items-center space-x-2 text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
                      <Loader size={12} className="animate-spin" />
                      <span className="text-xs">Authenticating...</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Login/Register Form - Compact */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm mx-auto w-full"
          >
            <button
              onClick={() => { setSelectedRole(null); setError(''); }}
              className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors text-xs group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Roles
            </button>

            <div className="bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              {/* Form Background Gradient */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color || 'from-blue-500 to-cyan-500'}`} />
              
              <div className="text-center mb-6">
                <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3 bg-slate-800 border border-white/5 ${roles.find(r => r.id === selectedRole)?.accent}`}>
                  {(() => {
                    const RoleIcon = roles.find(r => r.id === selectedRole)?.icon || User;
                    return <RoleIcon size={24} />;
                  })()}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {isRegister ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-400">
                  Login as <span className={`font-medium ${roles.find(r => r.id === selectedRole)?.accent}`}>{roles.find(r => r.id === selectedRole)?.name}</span>
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2 text-red-400"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  <span className="text-xs">{error}</span>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <div className="relative group">
                      <User size={16} className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                        placeholder="Full Name"
                        required={isRegister}
                      />
                    </div>
                  </motion.div>
                )}

                <div className="relative group">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    placeholder="Email Address"
                    required
                  />
                </div>

                <div className="relative group">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    placeholder="Password"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 rounded-lg font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm bg-gradient-to-r ${roles.find(r => r.id === selectedRole)?.color || 'from-blue-600 to-blue-500'} hover:shadow-blue-500/25 hover:scale-[1.02]`}
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setIsRegister(!isRegister); setError(''); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer - Compact */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 shrink-0"
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            Powered by MongoDB · Runanywhere · WebSocket
          </p>
        </motion.div>
      </div>
    </div>
  );
}
