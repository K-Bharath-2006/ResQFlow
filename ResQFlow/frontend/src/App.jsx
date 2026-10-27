import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DisasterProvider } from './context/DisasterContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScenarioPage from './pages/ScenarioPage';
import ImpactAnalysisPage from './pages/ImpactAnalysisPage';
import ResourcesPage from './pages/ResourcesPage';
import RequirementAnalysisPage from './pages/RequirementAnalysisPage';
import PriorityAllocationPage from './pages/PriorityAllocationPage';

function MainApp() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'scenario':
        return <ScenarioPage onNavigate={setCurrentPage} />;
      case 'impact':
        return <ImpactAnalysisPage onNavigate={setCurrentPage} />;
      case 'resources':
        return <ResourcesPage onNavigate={setCurrentPage} />;
      case 'requirements':
        return <RequirementAnalysisPage onNavigate={setCurrentPage} />;
      case 'priority':
        return <PriorityAllocationPage onNavigate={setCurrentPage} />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="main-content">
        <Navbar />
        <main className="page-body">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DisasterProvider>
        <MainApp />
      </DisasterProvider>
    </AuthProvider>
  );
}
