import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SideNavigation,
  SideNavigationItem,
  SideNavigationSubItem
} from '@ui5/webcomponents-react';
import { navigationService } from '../../services/navigation/navigationService';
import { enableKeyboardNavigation } from '../../utils/accessibilityUtils';
import Badge from '../Badge';
import './Navigation.css';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const workflowState = navigationService.getWorkflowState();
  const navigationRef = useRef<HTMLDivElement>(null);
  
  // Determine current workflow stage
  const currentStage = workflowState?.currentStage || 'submission';
  
  // Calculate progress percentage for ARIA
  const progressPercentage = 
    currentStage === 'submission' ? 25 :
    currentStage === 'classification' ? 50 :
    currentStage === 'resolution' ? 75 : 100;

  const handleSelect = (event: CustomEvent) => {
    const path = event.detail.item.getAttribute('data-path');
    if (path) {
      navigate(path);
      
      // Announce navigation to screen readers
      const liveRegion = document.getElementById('accessibility-live-region');
      if (liveRegion) {
        let destination = 'new page';
        if (path === '/' || path === '/lead-dashboard') {
          destination = 'Lead Engineer Dashboard';
        } else if (path === '/customer-portal') {
          destination = 'Customer Portal';
        } else if (path.includes('/crp/')) {
          destination = `Collaborative Resolution Platform for Ticket ${path.split('/').pop()}`;
        }
        
        liveRegion.textContent = `Navigating to ${destination}`;
      }
    }
  };
  
  // Setup keyboard navigation for workflow progress indicator
  useEffect(() => {
    if (navigationRef.current) {
      const container = navigationRef.current.querySelector('.navigation-workflow-progress');
      if (container) {
        enableKeyboardNavigation(
          container as HTMLElement,
          '.workflow-stage-button',
          (item) => {
            const path = item.getAttribute('data-path');
            if (path) navigate(path);
          },
          false // horizontal navigation
        );
      }
    }
  }, [navigate]);
  
  // Check if a path is part of the current workflow
  const isWorkflowPath = (path: string): boolean => {
    if (currentStage === 'submission' && path === '/customer-portal') {
      return true;
    } else if (currentStage === 'classification' && (path === '/' || path === '/lead-dashboard')) {
      return true;
    } else if (currentStage === 'resolution' && path.includes('/crp/')) {
      return true;
    }
    return false;
  };
  
  // Check if we're in a CRP detail page
  const isCRPDetailPage = location.pathname.match(/^\/crp\/[^\/]+$/);
  
  // Get workflow stage path
  const getWorkflowStagePath = (stage: string): string => {
    switch (stage) {
      case 'submission':
        return '/customer-portal';
      case 'classification':
        return '/lead-dashboard';
      case 'resolution':
        return workflowState?.ticketId ? `/crp/${workflowState.ticketId}` : '/crp';
      case 'completion':
        return workflowState?.ticketId ? `/crp/${workflowState.ticketId}` : '/crp';
      default:
        return '/';
    }
  };

  return (
    <div className="navigation-container" ref={navigationRef}>
      <SideNavigation
        onSelectionChange={handleSelect}
        aria-label="Main Navigation"
      >
        <SideNavigationItem 
          icon="customer" 
          text="Customer Portal" 
          data-path="/customer-portal"
          selected={location.pathname === '/customer-portal'}
          aria-current={location.pathname === '/customer-portal' ? 'page' : undefined}
        >
          {isWorkflowPath('/customer-portal') && (
            <Badge colorScheme="8" className="workflow-badge">Current Workflow</Badge>
          )}
        </SideNavigationItem>
        
        <SideNavigationItem 
          icon="manager-insight" 
          text="Lead Engineer Dashboard" 
          data-path="/"
          selected={location.pathname === '/' || location.pathname === '/lead-dashboard'}
          aria-current={location.pathname === '/' || location.pathname === '/lead-dashboard' ? 'page' : undefined}
        >
          {isWorkflowPath('/') && (
            <Badge colorScheme="8" className="workflow-badge">Current Workflow</Badge>
          )}
        </SideNavigationItem>
        
        <SideNavigationItem 
          icon="collaborate" 
          text="CRP List" 
          data-path="/crp"
          selected={Boolean(location.pathname === '/crp' || isCRPDetailPage)}
          aria-current={location.pathname === '/crp' ? 'page' : undefined}
          aria-expanded={Boolean(isCRPDetailPage) || location.pathname === '/crp/create'}
        >
          {workflowState?.ticketId && (
            <SideNavigationSubItem 
              text={`Ticket ${workflowState.ticketId}`}
              data-path={`/crp/${workflowState.ticketId}`}
              selected={location.pathname === `/crp/${workflowState.ticketId}`}
              aria-current={location.pathname === `/crp/${workflowState.ticketId}` ? 'page' : undefined}
            >
              {isWorkflowPath(`/crp/${workflowState.ticketId}`) && (
                <Badge colorScheme="8" className="workflow-badge">Current Workflow</Badge>
              )}
            </SideNavigationSubItem>
          )}
          
          <SideNavigationSubItem 
            text="Create CRP" 
            data-path="/crp/create"
            selected={location.pathname === '/crp/create'}
            aria-current={location.pathname === '/crp/create' ? 'page' : undefined}
          />
        </SideNavigationItem>
        
        <SideNavigationItem 
          icon="settings" 
          text="Settings" 
          data-path="/settings"
          selected={location.pathname === '/settings'}
          aria-current={location.pathname === '/settings' ? 'page' : undefined}
        />
      </SideNavigation>
      
      {/* Workflow progress indicator */}
      <div 
        className="navigation-workflow-progress" 
        role="region" 
        aria-label="Workflow Progress"
      >
        <div className="workflow-progress-title" id="workflow-progress-title">Workflow Progress</div>
        <div 
          className="workflow-progress-container" 
          role="progressbar" 
          aria-valuenow={progressPercentage} 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-labelledby="workflow-progress-title"
        >
          <div 
            className="workflow-progress-bar" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="workflow-progress-label" aria-live="polite">
          {currentStage === 'submission' ? 'Step 1: Ticket Submission' :
           currentStage === 'classification' ? 'Step 2: AI Classification' :
           currentStage === 'resolution' ? 'Step 3: Collaborative Resolution' :
           'Step 4: Resolution Complete'}
        </div>
        
        {/* Keyboard accessible workflow stage buttons */}
        <div className="workflow-stages-navigation" role="tablist" aria-label="Workflow Stages">
          <button 
            className={`workflow-stage-button ${currentStage === 'submission' ? 'active' : ''} ${currentStage === 'submission' ? 'current' : ''}`}
            role="tab"
            aria-selected={currentStage === 'submission'}
            data-path={getWorkflowStagePath('submission')}
            tabIndex={currentStage === 'submission' ? 0 : -1}
            aria-label="Ticket Submission Stage"
          >
            1
          </button>
          <button 
            className={`workflow-stage-button ${['classification', 'resolution', 'completion'].includes(currentStage) ? 'active' : ''} ${currentStage === 'classification' ? 'current' : ''}`}
            role="tab"
            aria-selected={currentStage === 'classification'}
            data-path={getWorkflowStagePath('classification')}
            tabIndex={currentStage === 'classification' ? 0 : -1}
            aria-label="AI Classification Stage"
          >
            2
          </button>
          <button 
            className={`workflow-stage-button ${['resolution', 'completion'].includes(currentStage) ? 'active' : ''} ${currentStage === 'resolution' ? 'current' : ''}`}
            role="tab"
            aria-selected={currentStage === 'resolution'}
            data-path={getWorkflowStagePath('resolution')}
            tabIndex={currentStage === 'resolution' ? 0 : -1}
            aria-label="Collaborative Resolution Stage"
          >
            3
          </button>
          <button 
            className={`workflow-stage-button ${currentStage === 'completion' ? 'active' : ''} ${currentStage === 'completion' ? 'current' : ''}`}
            role="tab"
            aria-selected={currentStage === 'completion'}
            data-path={getWorkflowStagePath('completion')}
            tabIndex={currentStage === 'completion' ? 0 : -1}
            aria-label="Resolution Complete Stage"
          >
            4
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;