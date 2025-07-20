import { Ticket } from '../../models/types';
import { localStorageService } from '../storage/localStorageService';

// Navigation history key in local storage
const NAV_HISTORY_KEY = 'sap_crp_nav_history';
const WORKFLOW_STATE_KEY = 'sap_crp_workflow_state';

// Define workflow stages
export type WorkflowStage = 'submission' | 'classification' | 'resolution' | 'completion';

// Define navigation history item
interface NavigationHistoryItem {
  path: string;
  timestamp: number;
  ticketId?: string;
}

// Define workflow state
interface WorkflowState {
  currentStage: WorkflowStage;
  ticketId?: string;
  ticketSubject?: string;
}

class NavigationService {
  // Get navigation history
  getNavigationHistory(): NavigationHistoryItem[] {
    return localStorageService.getItem<NavigationHistoryItem[]>(NAV_HISTORY_KEY) || [];
  }
  
  // Add path to navigation history
  addToHistory(path: string, ticketId?: string): void {
    const history = this.getNavigationHistory();
    
    // Add new history item
    history.push({
      path,
      timestamp: Date.now(),
      ticketId
    });
    
    // Keep only the last 10 items
    const trimmedHistory = history.slice(-10);
    
    // Save to local storage
    localStorageService.setItem(NAV_HISTORY_KEY, trimmedHistory);
  }
  
  // Get workflow state
  getWorkflowState(): WorkflowState | null {
    return localStorageService.getItem<WorkflowState>(WORKFLOW_STATE_KEY) || null;
  }
  
  // Set workflow state
  setWorkflowState(state: WorkflowState): void {
    localStorageService.setItem(WORKFLOW_STATE_KEY, state);
  }
  
  // Update workflow stage
  updateWorkflowStage(stage: WorkflowStage, ticket?: Ticket): void {
    const currentState = this.getWorkflowState() || {
      currentStage: 'submission'
    };
    
    const newState: WorkflowState = {
      ...currentState,
      currentStage: stage
    };
    
    // If ticket is provided, update ticket info
    if (ticket) {
      newState.ticketId = ticket.id;
      newState.ticketSubject = ticket.subject;
    }
    
    this.setWorkflowState(newState);
  }
  
  // Clear workflow state
  clearWorkflowState(): void {
    localStorageService.removeItem(WORKFLOW_STATE_KEY);
  }
  
  // Determine workflow stage from path
  getWorkflowStageFromPath(path: string): WorkflowStage {
    if (path.includes('/customer-portal')) {
      return 'submission';
    } else if (path.includes('/lead-dashboard')) {
      return 'classification';
    } else if (path.includes('/crp/')) {
      return 'resolution';
    } else {
      return 'submission'; // Default
    }
  }
}

export const navigationService = new NavigationService();