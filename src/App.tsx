import { useVillageStore } from './store/villageStore';
import LoginPage from './components/Auth/LoginPage';
import TopNav from './components/Layout/TopNav';
import Sidebar from './components/Sidebar/Sidebar';
import StatusBar from './components/Layout/StatusBar';
import Map3D from './components/Map3D/Map3D';
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
import AdminControls from './components/ControlPanel/AdminControls';
import useWebSocket from './hooks/useWebSocket';

function App() {
  const { activeView, sidebarCollapsed, infoPanelOpen, isAuthenticated, userRole, login } = useVillageStore();
  useWebSocket();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
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
      case 'water':
        return <WaterView />;
      case 'power':
        return <PowerView />;
      case 'agriculture':
        return <AgricultureView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <CitizenReportsView />;
      case 'analytics':
        return userRole === 'admin' ? <AnalyticsView /> : <Map3D />;
      case 'settings':
        return <SettingsView />;
      case 'roads':
      case 'waste':
        return <Map3D />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-dashboard">
      <TopNav />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className={`flex-1 flex transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {/* Central Canvas */}
          <div className={`flex-1 relative transition-all duration-300 ${
            infoPanelOpen ? 'w-3/4' : 'w-full'
          }`}>
            {renderView()}
          </div>
          
          {/* Info Panel */}
          {infoPanelOpen && (
            <div className="w-1/4 min-w-[300px] max-w-[400px]">
              <InfoPanel />
            </div>
          )}
        </main>
      </div>
      
      <StatusBar />
      
      {/* Admin Control Panel - Floating (Only for Admin) */}
      {userRole === 'admin' && <AdminControls />}
    </div>
  );
}

export default App;
