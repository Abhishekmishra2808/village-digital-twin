import { ArrowRight, AlertTriangle, Wallet, Scale, Brain, Shield, Users, Zap, MapPin, CheckCircle, Smartphone } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">RuraLens</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#users" className="text-gray-600 hover:text-gray-900 transition-colors">For Whom</a>
            <a href="#footer" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-semibold border border-teal-200">
                  Tech for Humanity
                </span>
              </div>
              <h1 className="text-6xl font-bold text-gray-900 leading-tight">
                From Infrastructure <span className="text-teal-600">Blindness</span> to Digital <span className="text-teal-600">Foresight</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                The digital twin platform for rural India. We empower officials with <strong className="text-gray-900">real-time monitoring</strong>, <strong className="text-gray-900">predictive analytics</strong>, and transparent, <strong className="text-gray-900">performance-based fund management</strong>.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-semibold text-lg flex items-center gap-2 shadow-lg shadow-teal-600/30"
                >
                  View Live Demo
                  <ArrowRight size={20} />
                </button>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all font-semibold text-lg border-2 border-gray-200"
                >
                  See How It Works
                </a>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-teal-600">600K+</div>
                  <div className="text-sm text-gray-600">Villages</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600">₹2.4L Cr</div>
                  <div className="text-sm text-gray-600">Annual Budget</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-teal-600">Real-time</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
              </div>
            </div>

            {/* Right: Visual - Split Screen Concept */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {/* Real World */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 h-64 flex flex-col justify-between">
                    <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Real World</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Zap className="text-blue-600" size={24} />
                        </div>
                        <div className="text-gray-700 font-medium">Water Pump</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Zap className="text-yellow-600" size={24} />
                        </div>
                        <div className="text-gray-700 font-medium">Power Line</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="text-green-600" size={24} />
                        </div>
                        <div className="text-gray-700 font-medium">Road</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Digital Twin */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-8 h-64 flex flex-col justify-between relative overflow-hidden">
                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                    
                    <div className="text-sm font-semibold text-teal-100 uppercase tracking-wide relative z-10">Digital Twin</div>
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                          <Brain className="text-white" size={24} />
                        </div>
                        <div className="text-white font-medium">AI Analytics</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                          <Zap className="text-white" size={24} />
                        </div>
                        <div className="text-white font-medium">Live Data</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                          <CheckCircle className="text-white" size={24} />
                        </div>
                        <div className="text-white font-medium">Predictions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connection Line */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-teal-600 flex items-center justify-center shadow-xl">
                  <ArrowRight className="text-teal-600" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              The Challenge: Beyond Political Connections
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              India's <strong className="text-gray-900">600,000+ villages</strong> manage budgets over <strong className="text-gray-900">₹2.4 lakh crore</strong>, but 'infrastructure blindness' leads to delayed repairs and inefficient use of funds. Allocation often favors political connections over actual performance, creating inequity.
            </p>
          </div>

          {/* Pain Points */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-red-50 border border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Delayed Repairs</h3>
              <p className="text-gray-600">
                Critical infrastructure failures go unnoticed until it's too late, causing service disruptions and community hardship.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-yellow-50 border border-yellow-100">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="text-yellow-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Inefficient Funding</h3>
              <p className="text-gray-600">
                Resources are wasted on reactive maintenance instead of proactive, data-driven infrastructure management.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-purple-50 border border-purple-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scale className="text-purple-600" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Inequitable Allocation</h3>
              <p className="text-gray-600">
                Fund distribution favors political connections over actual performance metrics and community needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              A Single Platform for Total Transparency
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cutting-edge technology meets grassroots governance to create sustainable, equitable infrastructure management.
            </p>
          </div>

          {/* Feature Pillars */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* AI-Powered Monitoring */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Monitoring</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Combine <strong className="text-gray-900">satellite data</strong>, <strong className="text-gray-900">mobile uploads</strong>, and <strong className="text-gray-900">citizen reports</strong>. Our AI automatically detects infrastructure damage and predicts failures before they happen.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Real-time anomaly detection</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Predictive maintenance alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Multi-source data fusion</span>
                </li>
              </ul>
            </div>

            {/* Blockchain-Backed Transparency */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Blockchain-Backed Transparency</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Eliminate favoritism. We enable <strong className="text-gray-900">performance-based budgeting</strong> using smart contracts and immutable ledgers to ensure funds are disbursed only upon verified task completion.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Tamper-proof transaction logs</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Automated fund disbursement</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Performance-based allocation</span>
                </li>
              </ul>
            </div>

            {/* Connected Workforce & Community */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connected Workforce & Community</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Receive event-driven alerts and optimize maintenance routes. Our <strong className="text-gray-900">offline-first apps</strong> and <strong className="text-gray-900">voice-based citizen portals</strong> keep everyone from field workers to villagers connected.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Offline-first mobile apps</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Voice-based interfaces</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-teal-600 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">Optimized task routing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Users Section */}
      <section id="users" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              A Platform for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Designed for the entire ecosystem—from citizens to field workers to administrators.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Citizens */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Citizens</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                View village information, track project progress, and submit complaints or reports through a simple web or voice portal.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Real-time project tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Easy complaint submission</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Voice-based access</span>
                </li>
              </ul>
            </div>

            {/* Administrators */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-8 border border-teal-200 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Administrators</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Access a complete <strong>3D digital twin</strong>, monitor health dashboards, analyze regional impact, and manage budgets with full transparency.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Interactive 3D visualization</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Predictive analytics dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Transparent fund management</span>
                </li>
              </ul>
            </div>

            {/* Field Workers */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border border-green-200 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Field Workers</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Receive prioritized maintenance tasks, upload geo-tagged photo logs, and sync work reports even with limited connectivity using the offline-first app.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Prioritized task lists</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Geo-tagged reporting</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="text-white" size={14} />
                  </div>
                  <span className="text-gray-700">Offline-first mobile app</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to build smarter, more equitable villages?
          </h2>
          <p className="text-xl text-teal-100 mb-10">
            Join the future of rural infrastructure management with data-driven transparency.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-teal-700 rounded-lg hover:bg-gray-50 transition-all font-bold text-lg shadow-2xl flex items-center gap-3"
            >
              Request a Demo
              <ArrowRight size={24} />
            </button>
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-teal-800 text-white rounded-lg hover:bg-teal-900 transition-all font-bold text-lg border-2 border-white/20"
            >
              Login to Platform
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="py-12 px-6 bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="text-2xl font-bold text-white">RuraLens</span>
              </div>
              <p className="text-gray-400 text-sm">
                Powered by IoT, AI & Real-time Analytics
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="#users" className="hover:text-teal-400 transition-colors">For Whom</a></li>
                <li><button onClick={onGetStarted} className="hover:text-teal-400 transition-colors">Login</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="https://github.com/Abhishekmishra2808/village-digital-twin" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2025 RuraLens. All rights reserved. Built for smarter, more equitable rural India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
