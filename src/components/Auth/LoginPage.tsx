import { useState } from 'react';
import { User, Shield, Briefcase, ChevronRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (role: 'user' | 'admin' | 'field_worker', username: string) => void;
}

const roles = [
  { 
    id: 'user' as const, 
    name: 'Citizen', 
    icon: User, 
    description: 'View village information and services' 
  },
  { 
    id: 'admin' as const, 
    name: 'Administrator', 
    icon: Shield, 
    description: 'Manage system and monitor infrastructure' 
  },
  { 
    id: 'field_worker' as const, 
    name: 'Field Worker', 
    icon: Briefcase, 
    description: 'Update field data and reports' 
  },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'field_worker' | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && username && password) {
      onLogin(selectedRole, username);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-6xl py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fadeIn">
          <h1 className="text-7xl font-semibold text-gray-900 mb-6 tracking-tight">
            Sundarpur
          </h1>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
            A complete digital twin for smarter village management. Real-time insights, predictive analytics, and seamless control.
          </p>
        </div>

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="grid md:grid-cols-3 gap-4 mb-16 max-w-4xl mx-auto">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className="group relative p-8 rounded-3xl transition-all duration-500 text-left bg-gray-50 text-gray-900 hover:bg-gray-900 hover:text-white hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex flex-col h-full">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white group-hover:bg-white/10 transition-all">
                      <RoleIcon size={24} className="text-gray-900 group-hover:text-white" />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2">{role.name}</h3>
                    <p className="text-sm mb-4 flex-grow text-gray-500 group-hover:text-gray-300">
                      {role.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-white">
                      Select
                      <ChevronRight size={16} className="ml-1" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Login Form */
          <div className="max-w-md mx-auto animate-fadeIn">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-gray-500 hover:text-gray-900 mb-8 flex items-center gap-2 transition-colors text-sm"
            >
              ← Back
            </button>

            <div className="bg-gray-50 rounded-3xl p-10">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Sign in as {roles.find(r => r.id === selectedRole)?.name}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Username"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="Password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  Continue
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400 mb-2">Demo credentials:</p>
                <p className="text-xs text-gray-500 font-mono">demo / demo123</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20">
          <p className="text-sm text-gray-400">
            Powered by IoT, AI & Real-time Analytics
          </p>
        </div>
      </div>
    </div>
  );
}
