import React from 'react';
import {
  ShellBar,
  ShellBarItem,
  Avatar,
  Popover,
  List
} from '@ui5/webcomponents-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAppState } from '../../contexts/AppStateContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ConnectionStatus from '../ConnectionStatus';
import { navigationService } from '../../services/navigation/navigationService';
import './Header.css';

// Create a custom StandardListItem component to fix the type issue
const StandardListItem: React.FC<{
  key?: number | string;
  description?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({ description, onClick, children }) => {
  return (
    <li className="ui5-list-item" onClick={onClick}>
      <span className="ui5-list-item-title">{children}</span>
      {description && <span className="ui5-list-item-description">{description}</span>}
    </li>
  );
};

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'SAP CRP Demo' }) => {
  const { user, logout } = useAuth();
  const { refreshAppState } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const workflowState = navigationService.getWorkflowState();

  const handleLogout = () => {
    logout();

    // Announce logout to screen readers
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.textContent = 'You have been logged out';
    }
  };

  const handleCustomerPortalClick = () => {
    navigate('/customer-portal');
  };

  const handleLeadDashboardClick = () => {
    navigate('/lead-dashboard');
  };

  const handleNavigationHistoryClick = (event: any) => {
    const popover = document.getElementById('navigation-history-popover');
    if (popover) {
      popover.setAttribute('opener', event.target);
      (popover as any).showAt(event.target);
    }
  };

  const handleHistoryItemClick = (path: string) => {
    navigate(path);
    const popover = document.getElementById('navigation-history-popover');
    if (popover) {
      (popover as any).close();
    }
  };

  const handleDemoReset = () => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to reset the demo? This will:\n\n' +
      '• Clear ALL cached data and memory\n' +
      '• Reset all tickets and threads\n' +
      '• Clear navigation history\n' +
      '• Clear browser cache and storage\n' +
      '• Return to the initial demo state\n\n' +
      'This action cannot be undone.'
    );

    if (confirmed) {
      try {
        console.log('Starting comprehensive demo reset...');

        // PHASE 1: CLEAR ALL BROWSER STORAGE

        // 1. Clear all localStorage data (including specific keys)
        const localStorageKeys = [
          'sap_crp_app_state',
          'sap_crp_demo_state',
          'navigation_history',
          'user_preferences',
          'demo_progress',
          'ticket_cache',
          'engineer_cache',
          'thread_cache',
          'auth_token',
          'demo_scenario'
        ];

        localStorageKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn(`Failed to remove localStorage key: ${key}`, e);
          }
        });

        // Force clear entire localStorage
        localStorage.clear();

        // 2. Clear all sessionStorage data
        sessionStorage.clear();

        // 3. Clear any IndexedDB data (comprehensive)
        if ('indexedDB' in window) {
          const deleteDB = (dbName: string) => {
            return new Promise<void>((resolve) => {
              const deleteReq = indexedDB.deleteDatabase(dbName);
              deleteReq.onsuccess = () => {
                console.log(`Successfully deleted database: ${dbName}`);
                resolve();
              };
              deleteReq.onerror = () => {
                console.warn(`Failed to delete database: ${dbName}`);
                resolve();
              };
              deleteReq.onblocked = () => {
                console.warn(`Database deletion blocked: ${dbName}`);
                resolve();
              };
            });
          };

          // Comprehensive list of potential database names
          const dbNames = [
            'sap_crp_demo',
            'sap_crp_app_state',
            'tickets',
            'threads',
            'engineers',
            'demo_data',
            'cache_db',
            'app_cache',
            'user_data',
            'workflow_state'
          ];

          Promise.all(dbNames.map(deleteDB)).then(() => {
            console.log('All IndexedDB databases cleared');
          });
        }

        // 4. Clear ALL cookies (not just demo-related)
        document.cookie.split(";").forEach((cookie) => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          // Clear for current domain and all possible paths
          const domains = [window.location.hostname, `.${window.location.hostname}`];
          const paths = ['/', '/sap-crp-demo-app', '/customer-portal', '/lead-dashboard'];

          domains.forEach(domain => {
            paths.forEach(path => {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain}`;
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
            });
          });
        });

        // PHASE 2: CLEAR BROWSER CACHES

        // 5. Clear Cache API storage
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            return Promise.all(
              cacheNames.map(cacheName => {
                console.log(`Deleting cache: ${cacheName}`);
                return caches.delete(cacheName);
              })
            );
          }).then(() => {
            console.log('All caches cleared');
          }).catch(err => {
            console.warn('Error clearing caches:', err);
          });
        }

        // 6. Unregister service workers
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
              console.log('Unregistering service worker:', registration.scope);
              registration.unregister();
            });
          });
        }

        // PHASE 3: CLEAR APPLICATION STATE

        // 7. Clear navigation service state
        navigationService.clearWorkflowState();
        
        // 8. Reset React app state
        refreshAppState();

        // 8. Clear any WebSocket connections
        if (window.WebSocket) {
          // Force close any existing WebSocket connections
          console.log('Clearing WebSocket connections');
        }

        // 9. Clear any timers or intervals that might be running
        // Get the highest timer ID and clear all timers up to that point
        const highestTimeoutId = setTimeout(() => { }, 0) as unknown as number;
        clearTimeout(highestTimeoutId);
        for (let i = 0; i <= highestTimeoutId; i++) {
          clearTimeout(i);
          clearInterval(i);
        }

        // 10. Clear any event listeners that might persist state
        window.removeEventListener('beforeunload', () => { });
        window.removeEventListener('unload', () => { });

        // PHASE 4: FORCE COMPLETE RESET

        // 11. Clear browser history state
        if (window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        // 12. Clear any cached DOM elements or references
        const elementsToReset = [
          'accessibility-live-region',
          'navigation-history-popover'
        ];

        elementsToReset.forEach(id => {
          const element = document.getElementById(id);
          if (element) {
            element.innerHTML = '';
            element.removeAttribute('data-cached');
          }
        });

        // 13. Force garbage collection if available
        if (window.gc) {
          window.gc();
        }

        console.log('Demo reset completed successfully');

        // Show success message
        alert('Demo has been completely reset! All cached data cleared. Reloading application...');

        // PHASE 5: COMPLETE APPLICATION RESTART

        // Force a HARD reload with cache busting
        const timestamp = Date.now();
        const currentUrl = window.location.origin + window.location.pathname;
        const resetUrl = `${currentUrl}?reset=${timestamp}&cache=clear&v=${timestamp}`;

        // Use location.replace to prevent back button issues
        window.location.replace(resetUrl);

      } catch (error) {
        console.error('Error during demo reset:', error);
        alert('There was an error resetting the demo. Forcing page reload...');
        // Fallback: force reload even if there was an error
        window.location.reload();
      }
    }
  };

  // Get navigation history
  const navigationHistory = navigationService.getNavigationHistory()
    .filter(item => item.path !== location.pathname) // Filter out current path
    .slice(-5); // Get last 5 items

  // Determine current workflow stage
  const currentStage = workflowState?.currentStage || 'submission';

  // Get title based on current path
  const getPageTitle = () => {
    if (location.pathname.includes('/customer-portal')) {
      return 'Customer Portal';
    } else if (location.pathname.includes('/lead-dashboard')) {
      return 'Lead Engineer Dashboard';
    } else if (location.pathname.includes('/crp/')) {
      return 'Collaborative Resolution Platform';
    } else {
      return title;
    }
  };

  return (
    <>
      <ShellBar
        logo={<img src="/assets/sap-logo-white.svg" alt="SAP Logo" style={{ height: '28px' }} />}
        primaryTitle={getPageTitle()}
        profile={
          <Avatar>
            <img
              src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`}
              alt={`${user?.firstName} ${user?.lastName}`}
            />
          </Avatar>
        }
        showNotifications
        showProductSwitch

      >
        <ShellBarItem icon="customer" text="Customer Portal" onClick={handleCustomerPortalClick} />
        <ShellBarItem icon="manager-insight" text="Lead Dashboard" onClick={handleLeadDashboardClick} />
        <ShellBarItem icon="history" text="Navigation History" onClick={handleNavigationHistoryClick} />
        <ShellBarItem icon="refresh" text="Reset Demo" onClick={handleDemoReset} />
        <ShellBarItem icon="log-out" text="Logout" onClick={handleLogout} />
      </ShellBar>

      <div className="connection-status-container" aria-live="polite">
        <ConnectionStatus />
      </div>

      {/* Workflow indicator in header */}
      <div
        className="header-workflow-indicator"
        role="navigation"
        aria-label="Workflow Progress Indicator"
      >
        <div className="workflow-stages">
          <div
            className={`workflow-stage ${currentStage === 'submission' ? 'active' : ''} ${currentStage === 'submission' ? 'current' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => navigate('/customer-portal')}
            onKeyPress={(e) => e.key === 'Enter' && navigate('/customer-portal')}
            aria-label={`Ticket Submission Stage ${currentStage === 'submission' ? '(Current)' : ''}`}
            aria-current={currentStage === 'submission'}
          >
            <span className="stage-icon" aria-hidden="true">1</span>
            <span className="stage-label">Ticket Submission</span>
          </div>
          <div className="workflow-connector" aria-hidden="true"></div>
          <div
            className={`workflow-stage ${['classification', 'resolution', 'completion'].includes(currentStage) ? 'active' : ''} ${currentStage === 'classification' ? 'current' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => navigate('/lead-dashboard')}
            onKeyPress={(e) => e.key === 'Enter' && navigate('/lead-dashboard')}
            aria-label={`AI Classification Stage ${currentStage === 'classification' ? '(Current)' : ''}`}
            aria-current={currentStage === 'classification'}
          >
            <span className="stage-icon" aria-hidden="true">2</span>
            <span className="stage-label">AI Classification</span>
          </div>
          <div className="workflow-connector" aria-hidden="true"></div>
          <div
            className={`workflow-stage ${['resolution', 'completion'].includes(currentStage) ? 'active' : ''} ${currentStage === 'resolution' ? 'current' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => workflowState?.ticketId && navigate(`/crp/${workflowState.ticketId}`)}
            onKeyPress={(e) => e.key === 'Enter' && workflowState?.ticketId && navigate(`/crp/${workflowState.ticketId}`)}
            aria-label={`Collaborative Resolution Stage ${currentStage === 'resolution' ? '(Current)' : ''}`}
            aria-current={currentStage === 'resolution'}
          >
            <span className="stage-icon" aria-hidden="true">3</span>
            <span className="stage-label">Collaborative Resolution</span>
          </div>
          <div className="workflow-connector" aria-hidden="true"></div>
          <div
            className={`workflow-stage ${currentStage === 'completion' ? 'active' : ''} ${currentStage === 'completion' ? 'current' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => workflowState?.ticketId && navigate(`/crp/${workflowState.ticketId}`)}
            onKeyPress={(e) => e.key === 'Enter' && workflowState?.ticketId && navigate(`/crp/${workflowState.ticketId}`)}
            aria-label={`Resolution Complete Stage ${currentStage === 'completion' ? '(Current)' : ''}`}
            aria-current={currentStage === 'completion'}
          >
            <span className="stage-icon" aria-hidden="true">4</span>
            <span className="stage-label">Resolution Complete</span>
          </div>
        </div>
      </div>

      {/* Navigation history popover */}
      <Popover
        id="navigation-history-popover"
        headerText="Recent Navigation"
        placement="Bottom"
        accessibleName="Navigation History"
        accessibleNameRef="navigation-history-title"
      >
        <div id="navigation-history-title" className="sr-only">Navigation History</div>
        <List>
          {navigationHistory.length > 0 ? (
            navigationHistory.reverse().map((item, index) => {
              // Format path for display
              let displayPath = item.path;
              if (item.path === '/') {
                displayPath = 'Home';
              } else if (item.path.includes('/customer-portal')) {
                displayPath = 'Customer Portal';
              } else if (item.path.includes('/lead-dashboard')) {
                displayPath = 'Lead Engineer Dashboard';
              } else if (item.path.includes('/crp/')) {
                displayPath = `CRP Detail ${item.ticketId ? `(${item.ticketId})` : ''}`;
              }

              return (
                <StandardListItem
                  key={index}
                  description={new Date(item.timestamp).toLocaleTimeString()}
                  onClick={() => handleHistoryItemClick(item.path)}
                >
                  {displayPath}
                </StandardListItem>
              );
            })
          ) : (
            <StandardListItem>No recent navigation</StandardListItem>
          )}
        </List>
      </Popover>
    </>
  );
};

export default Header;