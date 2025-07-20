import React from 'react';
import { 
  ShellBar, 
  ShellBarItem, 
  Avatar,
  Popover,
  List
} from '@ui5/webcomponents-react';
import { useAuth } from '../../contexts/AuthContext';
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