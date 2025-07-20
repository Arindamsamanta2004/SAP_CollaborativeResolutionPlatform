import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TicketProvider } from './contexts/TicketContext';
import { AppStateProvider } from './contexts/AppStateContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ConnectionStatus from './components/ConnectionStatus';
import Breadcrumb from './components/Breadcrumb';
import PageTransition from './components/PageTransition';
import DemoController from './components/DemoController';
import ErrorBoundary from './components/ErrorBoundary';
import SystemStatusBanner from './components/SystemStatusBanner';
import { navigationService } from './services/navigation/navigationService';
import { initializeSystemMonitoring } from './services/system/systemStatusService';
import { setupSkipToMainContent } from './utils/accessibilityUtils';
import './App.css';
import './styles/accessibility.css';

// Import pages
import CustomerPortal from './pages/CustomerPortal';
import LeadEngineerDashboard from './pages/LeadEngineerDashboard';
import CRPDetail from './pages/CRPDetail';
// import CRPList from './pages/CRPList';
// import CRPCreate from './pages/CRPCreate';
// import Login from './pages/Login';

// Temporary placeholder component
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ padding: '2rem' }}>
    <h1>{title}</h1>
    <p>This page is under construction.</p>
  </div>
);

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" />;
};

// Route change tracker component
const RouteChangeTracker: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track navigation in our service
    navigationService.addToHistory(location.pathname);
    
    // Update workflow stage based on path
    const stage = navigationService.getWorkflowStageFromPath(location.pathname);
    navigationService.updateWorkflowStage(stage);
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const workflowState = navigationService.getWorkflowState();
  
  // Initialize system monitoring and accessibility features
  useEffect(() => {
    const cleanup = initializeSystemMonitoring();
    
    // Setup accessibility features
    setupSkipToMainContent();
    
    // Create accessibility live region if it doesn't exist
    if (!document.getElementById('accessibility-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'accessibility-live-region';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(liveRegion);
    }
    
    return () => {
      cleanup();
      // Clean up any accessibility features if needed
    };
  }, []);
  
  // Handle demo scenario loading
  const handleScenarioLoaded = (scenarioId: string) => {
    console.log(`Demo scenario loaded: ${scenarioId}`);
    // Announce to screen readers that a new scenario has been loaded
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.textContent = `Demo scenario ${scenarioId} has been loaded`;
    }
  };
  
  // Get page title for screen readers
  const getPageTitle = () => {
    if (location.pathname.includes('/customer-portal')) {
      return 'Customer Portal';
    } else if (location.pathname.includes('/lead-dashboard') || location.pathname === '/') {
      return 'Lead Engineer Dashboard';
    } else if (location.pathname.includes('/crp/')) {
      return `Collaborative Resolution Platform ${workflowState?.ticketId ? `for Ticket ${workflowState.ticketId}` : ''}`;
    } else if (location.pathname.includes('/settings')) {
      return 'Settings';
    } else {
      return 'SAP CRP Demo';
    }
  };
  
  return (
    <TicketProvider>
      <ErrorBoundary componentName="Application">
        <div className="app">
          {/* Skip to main content link for keyboard users */}
          <a href="#main-content" id="skip-to-main" className="skip-to-main">
            Skip to main content
          </a>
          
          {/* Announce page title to screen readers */}
          <div className="sr-only" role="status" aria-live="polite">
            {getPageTitle()}
          </div>
          
          <RouteChangeTracker />
          {isAuthenticated && <Header />}
          <SystemStatusBanner />
          {isAuthenticated && <DemoController onScenarioLoaded={handleScenarioLoaded} />}
          <div className="app-content">
            {isAuthenticated && (
              <div className="app-navigation" role="navigation" aria-label="Main Navigation">
                <Navigation />
              </div>
            )}
            <main id="main-content" className="app-main" tabIndex={-1}>
              {isAuthenticated && location.pathname !== '/login' && (
                <Breadcrumb 
                  ticketId={workflowState?.ticketId} 
                  ticketSubject={workflowState?.ticketSubject} 
                />
              )}
              <PageTransition>
                <Routes>
                  <Route path="/login" element={<PlaceholderPage title="Login" />} />
                  <Route path="/customer-portal" element={
                    <ErrorBoundary componentName="Customer Portal">
                      <CustomerPortal />
                    </ErrorBoundary>
                  } />
                  <Route path="/" element={
                    <ProtectedRoute element={
                      <ErrorBoundary componentName="Lead Engineer Dashboard">
                        <LeadEngineerDashboard />
                      </ErrorBoundary>
                    } />
                  } />
                  <Route path="/lead-dashboard" element={
                    <ProtectedRoute element={
                      <ErrorBoundary componentName="Lead Engineer Dashboard">
                        <LeadEngineerDashboard />
                      </ErrorBoundary>
                    } />
                  } />
                  <Route path="/crp" element={
                    <ProtectedRoute element={
                      <ErrorBoundary componentName="CRP List">
                        <PlaceholderPage title="CRP List" />
                      </ErrorBoundary>
                    } />
                  } />
                  <Route path="/crp/:id" element={
                    <ProtectedRoute element={
                      <ErrorBoundary componentName="CRP Detail">
                        <CRPDetail />
                      </ErrorBoundary>
                    } />
                  } />
                  <Route path="/crp/create" element={
                    <ProtectedRoute element={
                      <ErrorBoundary componentName="Create CRP">
                        <PlaceholderPage title="Create CRP" />
                      </ErrorBoundary>
                    } />
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute element={
                      <ErrorBoundary componentName="Settings">
                        <PlaceholderPage title="Settings" />
                      </ErrorBoundary>
                    } />
                  } />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </PageTransition>
            </main>
          </div>
          {isAuthenticated && <Footer />}
        </div>
      </ErrorBoundary>
    </TicketProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppStateProvider>
            <AppContent />
          </AppStateProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;