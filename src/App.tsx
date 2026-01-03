import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useVillageStore } from './store/villageStore';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPageNew';
import TopNav from './components/Layout/TopNav';
import Sidebar from './components/Sidebar/Sidebar';
import StatusBar from './components/Layout/StatusBar';
import InfoPanel from './components/InfoPanel/InfoPanel';
import Dashboard from './components/Dashboard/Dashboard';
import WaterView from './components/Views/WaterView';
import PowerView from './components/Views/PowerView';
import AgricultureView from './components/Views/AgricultureView';
import AlertsView from './components/Views/AlertsView';
import SettingsView from './components/Views/SettingsView';
import AnalyticsView from './components/Views/AnalyticsView';
import CitizenReportsView from './components/Views/CitizenReportsView';
import FieldWorkerView from './components/Views/FieldWorkerView';
import RoadsView from './components/Views/RoadsView';
import WasteView from './components/Views/WasteView';
import MapView from './components/Views/MapView';
import EnvironmentView from './components/Views/EnvironmentView';
import FloodView from './components/Views/FloodView';
import SchemesView from './components/Views/SchemesView';
import AdminControls from './components/ControlPanel/AdminControls';
import useWebSocket from './hooks/useWebSocket';

function App() {
  const { activeView, sidebarCollapsed, infoPanelOpen, isAuthenticated, userRole } = useVillageStore();
  const [showLanding, setShowLanding] = useState(true);
  const isMobile = Capacitor.isNativePlatform();
  useWebSocket();

  // Control body overflow based on authentication state
  useEffect(() => {
    if (isAuthenticated) {
      document.body.classList.add('dashboard-mode');
    } else {
      document.body.classList.remove('dashboard-mode');
    }
    
    return () => {
      document.body.classList.remove('dashboard-mode');
    };
  }, [isAuthenticated]);

  // Show landing page first
  if (showLanding && !isAuthenticated) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onBack={() => setShowLanding(true)} />;
  }

  // Render appropriate view based on activeView and userRole
  const renderView = () => {
    // Field Worker sees their dashboard by default
    if (userRole === 'field_worker') {
      return <FieldWorkerView />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <MapView />;
      case 'schemes':
        return <SchemesView />;
      case 'water':
        return <WaterView />;
      case 'power':
        return <PowerView />;
      case 'roads':
        return <RoadsView />;
      case 'waste':
        return <WasteView />;
      case 'agriculture':
        return <AgricultureView />;
      case 'environment':
        return <EnvironmentView />;
      case 'flood':
        return <FloodView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <CitizenReportsView />;
      case 'analytics':
        return userRole === 'admin' ? <AnalyticsView /> : <Dashboard />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 text-slate-200">
      <TopNav />
      
      <div className="flex-1 flex overflow-hidden" style={{
        marginTop: isMobile ? 'calc(64px + env(safe-area-inset-top, 0px))' : '64px',
        marginBottom: isMobile ? 'calc(32px + env(safe-area-inset-bottom, 0px))' : '32px'
      }}>
        <Sidebar />
        
        <main className={`flex-1 flex transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        } ml-0`}>
          {/* Central Canvas */}
          <div className={`flex-1 relative transition-all duration-300 ${
            infoPanelOpen && !isMobile ? 'lg:w-3/4' : 'w-full'
          }`}>
            {renderView()}
          </div>
          
          {/* Info Panel - Hidden on mobile in native app */}
          {infoPanelOpen && !isMobile && (
            <div className="hidden lg:block w-1/4 min-w-[300px] max-w-[400px]">
              <InfoPanel />
            </div>
          )}
        </main>
      </div>
      
      <StatusBar />
      
      {/* Admin Control Panel - Floating (Only for Admin, hidden on mobile) */}
      {userRole === 'admin' && !isMobile && <AdminControls />}
    </div>
  );
}

export default App;
