import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Title,
  Text,
  Card,
  BusyIndicator,
  Bar,
  Button,
  MessageStrip,
  Grid,
  Icon,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Dialog
} from '@ui5/webcomponents-react';
import Badge from '../../components/Badge';
import { Ticket, IssueThread, Engineer } from '../../models/types';
import { getTicketById } from '../../models/mockData/tickets';
import { getThreadsByTicketId } from '../../models/mockData/threads';
import { useAppState } from '../../contexts/AppStateContext';
import ParentTicketHeader from '../../components/ParentTicketHeader';
import ThreadCardList from '../../components/ThreadCardList';
import EngineerAvailabilityPanel from '../../components/EngineerAvailabilityPanel';
import SolutionMergePanel from '../../components/SolutionMergePanel';
import EngineerAvailabilityMonitor from '../../components/EngineerAvailabilityMonitor';
import ConnectionStatusPanel from '../../components/ConnectionStatusPanel';
import WorkflowIndicator from '../../components/WorkflowIndicator';
import { navigationService } from '../../services/navigation/navigationService';
import './styles.css';

const CRPDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appState, isConnected } = useAppState();
  const [loading, setLoading] = useState<boolean>(true);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [threads, setThreads] = useState<IssueThread[]>([]);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [collaborationStats, setCollaborationStats] = useState({
    totalThreads: 0,
    assignedThreads: 0,
    resolvedThreads: 0,
    openThreads: 0,
    activeEngineers: 0
  });
  
  // Get available engineers from app state
  const availableEngineers = appState.engineers.filter(eng => eng.availability === 'Available');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real app, these would be API calls
        if (id) {
          const ticketData = await getTicketById(id);
          const threadData = await getThreadsByTicketId(id);
          
          if (ticketData) {
            setTicket(ticketData);
            setThreads(threadData);
            
            // Calculate collaboration stats
            const assignedThreads = threadData.filter(t => t.assignedEngineerId !== null).length;
            const resolvedThreads = threadData.filter(t => t.status === 'Resolved').length;
            const openThreads = threadData.filter(t => t.status === 'Open').length;
            
            // Count unique engineers assigned to threads
            const uniqueEngineers = new Set(
              threadData
                .filter(t => t.assignedEngineerId !== null)
                .map(t => t.assignedEngineerId)
            );
            
            setCollaborationStats({
              totalThreads: threadData.length,
              assignedThreads,
              resolvedThreads,
              openThreads,
              activeEngineers: uniqueEngineers.size
            });
          }
        }
      } catch (error) {
        console.error('Error loading CRP data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);
  
  // Update threads and stats when appState changes
  useEffect(() => {
    if (id && ticket) {
      // Find threads for this ticket in the app state
      const activeThreadsForTicket = appState.activeThreads.filter(t => t.parentTicketId === id);
      
      if (activeThreadsForTicket.length > 0) {
        setThreads(activeThreadsForTicket);
        
        // Recalculate collaboration stats
        const assignedThreads = activeThreadsForTicket.filter(t => t.assignedEngineerId !== null).length;
        const resolvedThreads = activeThreadsForTicket.filter(t => t.status === 'Resolved').length;
        const openThreads = activeThreadsForTicket.filter(t => t.status === 'Open').length;
        
        // Count unique engineers assigned to threads
        const uniqueEngineers = new Set(
          activeThreadsForTicket
            .filter(t => t.assignedEngineerId !== null)
            .map(t => t.assignedEngineerId)
        );
        
        setCollaborationStats({
          totalThreads: activeThreadsForTicket.length,
          assignedThreads,
          resolvedThreads,
          openThreads,
          activeEngineers: uniqueEngineers.size
        });
      }
    }
  }, [appState.activeThreads, id, ticket]);

  // Calculate progress percentage
  const calculateProgress = () => {
    if (collaborationStats.totalThreads === 0) return 0;
    return Math.round((collaborationStats.resolvedThreads / collaborationStats.totalThreads) * 100);
  };

  if (loading) {
    return (
      <div className="crp-dashboard-loading">
        <BusyIndicator size="M" />
        <Text>Loading collaborative resolution platform...</Text>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="crp-dashboard-error">
        <Title>Ticket Not Found</Title>
        <Text>The requested ticket could not be found.</Text>
      </div>
    );
  }

  return (
    <div className="crp-dashboard">
      <Bar
        design="Header"
        startContent={<Title>Collaborative Resolution Platform</Title>}
        endContent={
          <Button
            icon="refresh"
            design="Transparent"
            onClick={() => window.location.reload()}
            tooltip="Refresh data"
          />
        }
      />

      <div className="crp-dashboard-content">
        <MessageStrip
          design="Information"
          hideCloseButton
          className="crp-dashboard-info-strip"
        >
          This platform demonstrates collaborative resolution of complex tickets through skill-based thread decomposition.
        </MessageStrip>

        {/* Parent Ticket Header Section */}
        <ParentTicketHeader ticket={ticket} />
        
        {/* Collaboration Stats Section */}
        <Card className="crp-collaboration-stats">
          <div className="crp-stats-header">
            <Title level="H3">Collaboration Progress</Title>
            <Badge colorScheme={calculateProgress() === 100 ? '8' : '6'}>
              {calculateProgress()}% Complete
            </Badge>
          </div>
          
          <div className="crp-stats-grid">
            <div className="crp-stat-item">
              <div className="crp-stat-icon thread-icon">
                <Icon name="document-text" />
              </div>
              <div className="crp-stat-content">
                <div className="crp-stat-value">{collaborationStats.totalThreads}</div>
                <div className="crp-stat-label">Total Threads</div>
              </div>
            </div>
            
            <div className="crp-stat-item">
              <div className="crp-stat-icon assigned-icon">
                <Icon name="personnel-view" />
              </div>
              <div className="crp-stat-content">
                <div className="crp-stat-value">{collaborationStats.assignedThreads}</div>
                <div className="crp-stat-label">Assigned Threads</div>
              </div>
            </div>
            
            <div className="crp-stat-item">
              <div className="crp-stat-icon resolved-icon">
                <Icon name="complete" />
              </div>
              <div className="crp-stat-content">
                <div className="crp-stat-value">{collaborationStats.resolvedThreads}</div>
                <div className="crp-stat-label">Resolved Threads</div>
              </div>
            </div>
            
            <div className="crp-stat-item">
              <div className="crp-stat-icon engineer-icon">
                <Icon name="group" />
              </div>
              <div className="crp-stat-content">
                <div className="crp-stat-value">{collaborationStats.activeEngineers}</div>
                <div className="crp-stat-label">Active Engineers</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Workflow Indicator */}
        <div className="crp-workflow-indicator">
          <WorkflowIndicator currentStage="resolution" />
        </div>

        {/* Solution Merge Panel - Only show when there are resolved threads */}
        {collaborationStats.resolvedThreads > 0 && (
          <SolutionMergePanel 
            ticket={ticket} 
            threads={threads}
            onResolutionComplete={() => {
              // Update workflow state to completion stage
              navigationService.updateWorkflowStage('completion', ticket);
              // Show completion dialog
              setShowCompletionDialog(true);
            }}
          />
        )}

        <Grid defaultSpan="XL8 L8 M12 S12" className="crp-dashboard-grid">
          {/* Issue Threads Section */}
          <div className="crp-dashboard-section threads-section">
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              justifyContent={FlexBoxJustifyContent.SpaceBetween}
              alignItems={FlexBoxAlignItems.Center}
              className="crp-section-header"
            >
              <div>
                <Title level="H2">Issue Threads</Title>
                <Text>AI-decomposed issue threads based on required skills</Text>
              </div>
              <div className="crp-thread-filters">
                <Badge colorScheme="1" className="crp-thread-filter">All</Badge>
                <Badge colorScheme="1" className="crp-thread-filter">Open ({collaborationStats.openThreads})</Badge>
                <Badge colorScheme="1" className="crp-thread-filter">In Progress ({collaborationStats.assignedThreads - collaborationStats.resolvedThreads})</Badge>
                <Badge colorScheme="1" className="crp-thread-filter">Resolved ({collaborationStats.resolvedThreads})</Badge>
              </div>
            </FlexBox>
            <ThreadCardList threads={threads} />
          </div>

          {/* Engineer Availability Section */}
          <div className="crp-dashboard-section engineers-section">
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              justifyContent={FlexBoxJustifyContent.SpaceBetween}
              alignItems={FlexBoxAlignItems.Center}
              className="crp-section-header"
            >
              <div>
                <Title level="H2">Engineer Availability</Title>
                <Text>Available engineers with workload indicators</Text>
              </div>
              <div className="crp-collaboration-indicator">
                <Icon name="group" className="crp-collaboration-icon" />
                <span>{collaborationStats.activeEngineers} engineers collaborating</span>
              </div>
            </FlexBox>
            <EngineerAvailabilityPanel />
            
            {/* Real-time Engineer Availability Monitor */}
            <div className="crp-dashboard-subsection">
              <Title level="H3">Real-time Updates</Title>
              <EngineerAvailabilityMonitor />
            </div>
            
            {/* Connection Status Panel */}
            <ConnectionStatusPanel />
          </div>
        </Grid>
      </div>
      
      {/* Resolution Completion Dialog */}
      {showCompletionDialog && (
        <Dialog
          headerText="Resolution Complete"
          open={showCompletionDialog}
          onClose={() => setShowCompletionDialog(false)}
          className="completion-dialog"
        >
          <div className="completion-dialog-content">
            <div className="completion-icon-container">
              <Icon name="complete" className="completion-icon" />
            </div>
            <Title level="H2">Ticket Successfully Resolved</Title>
            <Text>All issue threads have been resolved and the solution has been merged.</Text>
            <Text>Ticket ID: {ticket.id}</Text>
            <Text>Resolution Time: {Math.floor(Math.random() * 24) + 1} hours</Text>
            
            <div className="completion-stats">
              <div className="completion-stat-item">
                <div className="completion-stat-value">{collaborationStats.totalThreads}</div>
                <div className="completion-stat-label">Threads Resolved</div>
              </div>
              <div className="completion-stat-item">
                <div className="completion-stat-value">{collaborationStats.activeEngineers}</div>
                <div className="completion-stat-label">Engineers Involved</div>
              </div>
            </div>
            
            <div className="completion-actions">
              <Button 
                design="Emphasized" 
                onClick={() => {
                  setShowCompletionDialog(false);
                  navigate('/lead-dashboard');
                }}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default CRPDetail;