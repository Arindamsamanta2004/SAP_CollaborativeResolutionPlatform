import React, { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Card,
  BusyIndicator,
  Bar,
  IllustratedMessage,
  Button,
  MessageStrip,
  Grid,
  TabContainer,
  Tab
} from '@ui5/webcomponents-react';
import { useTickets } from '../../contexts/TicketContext';
import TicketCard from '../../components/TicketCard';
import LeadEngineerAssignment from '../../components/LeadEngineerAssignment';
import TicketStatistics from '../../components/TicketStatistics';
import DemoWorkflowTester from '../../components/DemoWorkflowTester';
import DemoDocumentation from '../../components/DemoDocumentation';
import CRPAutoLaunch from '../../components/CRPAutoLaunch';
import CustomerChatPanel from '../../components/CustomerChatPanel';
import { Ticket } from '../../models/types';
import { autoLaunchService, CRPLaunchResult } from '../../services/crp/autoLaunchService';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const LeadEngineerDashboard: React.FC = () => {
  const {
    tickets,
    loading,
    triggerCRP,
    routeToStandard,
    refreshTickets
  } = useTickets();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [processingTicket, setProcessingTicket] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [autoLaunchTicket, setAutoLaunchTicket] = useState<Ticket | null>(null);
  const [showAutoLaunch, setShowAutoLaunch] = useState(false);
  const navigate = useNavigate();

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  // Auto-launch CRP for qualifying tickets
  useEffect(() => {
    const checkForAutoLaunch = async () => {
      for (const ticket of tickets) {
        if (ticket.aiClassification && !processingTicket) {
          const evaluation = await autoLaunchService.evaluateForCRPLaunch(ticket);
          if (evaluation.shouldLaunch) {
            setAutoLaunchTicket(ticket);
            setShowAutoLaunch(true);
            break; // Only auto-launch one ticket at a time
          }
        }
      }
    };

    if (tickets.length > 0) {
      checkForAutoLaunch();
    }
  }, [tickets, processingTicket]);

  const handleTicketProcess = (ticket: Ticket) => {
    setProcessingTicket(ticket.id);
    setProcessingProgress(0);
    
    // Simulate processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessingTicket(null);
          
          if (ticket.aiClassification?.recommendedAction === 'CRP') {
            triggerCRP(ticket);
          } else {
            routeToStandard(ticket);
          }
          
          return 0;
        }
        return prev + 10;
      });
    }, 300);

    // If this was the selected ticket, clear the selection
    if (selectedTicket && selectedTicket.id === ticket.id) {
      setSelectedTicket(null);
    }
  };

  const handleCRPLaunchComplete = (result: CRPLaunchResult) => {
    if (result.shouldLaunch && autoLaunchTicket) {
      // Navigate to CRP detail page
      navigate(`/crp/${autoLaunchTicket.id}`);
      
      // Update ticket context with CRP launch
      triggerCRP(autoLaunchTicket);
    }
    
    setShowAutoLaunch(false);
    setAutoLaunchTicket(null);
  };

  const handleAutoLaunchClose = () => {
    setShowAutoLaunch(false);
    setAutoLaunchTicket(null);
  };

  if (loading) {
    return (
      <div className="lead-dashboard-loading">
        <BusyIndicator size="L" />
        <Text>Loading tickets...</Text>
      </div>
    );
  }

  return (
    <div className="lead-engineer-dashboard">
      <Bar
        startContent={<Title>Lead Engineer Dashboard</Title>}
        endContent={
          <div className="dashboard-header-actions">
            <Button
              icon="collaborate"
              design="Emphasized"
              onClick={() => navigate('/crp')}
              tooltip="Go to CRP Dashboard"
              className="crp-dashboard-button"
            >
              CRP Dashboard
            </Button>
            <Button
              icon="refresh"
              design="Transparent"
              onClick={() => refreshTickets()}
              tooltip="Refresh tickets"
            />
          </div>
        }
      />

      <TabContainer
        onTabSelect={(e) => setActiveTab(e.detail.tab.getAttribute('data-key') || 'dashboard')}
        className="dashboard-tabs"
      >
        <Tab text="Dashboard" key="dashboard" data-key="dashboard" selected={activeTab === "dashboard"}>
          <div className="dashboard-content">
            <MessageStrip
              design="Information"
              hideCloseButton
              className="dashboard-info-strip"
            >
              This dashboard demonstrates AI-powered ticket classification with automatic CRP launch for complex tickets and experience-based lead engineer assignment.
            </MessageStrip>

            <Grid defaultSpan="XL6 L6 M12 S12" className="dashboard-grid">
              <div className="dashboard-section">
                <Title level="H2">Incoming Tickets</Title>
                <Text>Review and route new tickets based on AI classification</Text>

                <div className="ticket-list">
                  {tickets.length === 0 ? (
                    <Card className="empty-state-card">
                      <IllustratedMessage
                        name="NoData"
                        titleText="No tickets to process"
                        subtitleText="All tickets have been processed"
                      />
                    </Card>
                  ) : (
                    tickets.map(ticket => (
                      <div
                        key={ticket.id}
                        className={`ticket-wrapper ${selectedTicket?.id === ticket.id ? 'selected' : ''}`}
                        onClick={() => handleTicketSelect(ticket)}
                      >
                        <TicketCard
                          ticket={ticket}
                          isProcessing={processingTicket === ticket.id}
                          processingProgress={processingProgress}
                          onTriggerCRP={() => handleTicketProcess(ticket)}
                          onRouteToStandard={() => handleTicketProcess(ticket)}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="dashboard-section">
                <Title level="H2">Lead Engineer Assignment</Title>
                <Text>AI-powered assignment based on 70% skill dominance rule</Text>

                {selectedTicket ? (
                  <LeadEngineerAssignment ticket={selectedTicket} />
                ) : (
                  <TicketStatistics tickets={tickets} />
                )}

                {!selectedTicket && tickets.length === 0 && (
                  <Card className="empty-state-card">
                    <IllustratedMessage
                      name="NoEntries"
                      titleText="No ticket data available"
                      subtitleText="Statistics will appear when tickets are loaded"
                    />
                  </Card>
                )}
              </div>
            </Grid>
          </div>
        </Tab>
        
        <Tab text="Customer Communication" key="communication" data-key="communication" selected={activeTab === "communication"}>
          <div className="communication-content">
            <MessageStrip
              design="Information"
              hideCloseButton
              className="dashboard-info-strip"
            >
              Communicate directly with customers about their tickets. Chat remains available for follow-up questions after resolution.
            </MessageStrip>
            
            <Grid defaultSpan="XL12 L12 M12 S12" className="communication-grid">
              {selectedTicket ? (
                <CustomerChatPanel 
                  ticket={selectedTicket} 
                  isResolved={selectedTicket.status === 'Resolved'}
                />
              ) : (
                <Card className="empty-state-card">
                  <IllustratedMessage
                    name="NoEntries"
                    titleText="Select a ticket to start communication"
                    subtitleText="Choose a ticket from the Dashboard tab to chat with the customer"
                  />
                </Card>
              )}
            </Grid>
          </div>
        </Tab>
        
        <Tab text="Demo Workflow Testing" key="testing" data-key="testing" selected={activeTab === "testing"}>
          <div className="testing-content">
            <MessageStrip
              design="Information"
              hideCloseButton
              className="dashboard-info-strip"
            >
              Test the end-to-end demo workflow from ticket submission to resolution. Verify thread decomposition accuracy and lead engineer assignment logic.
            </MessageStrip>
            
            <Grid defaultSpan="XL12 L12 M12 S12" className="testing-grid">
              <DemoWorkflowTester />
              <DemoDocumentation />
            </Grid>
          </div>
        </Tab>
      </TabContainer>

      {/* CRP Auto-Launch Dialog */}
      {autoLaunchTicket && (
        <CRPAutoLaunch
          ticket={autoLaunchTicket}
          isOpen={showAutoLaunch}
          onClose={handleAutoLaunchClose}
          onLaunchComplete={handleCRPLaunchComplete}
        />
      )}
    </div>
  );
};

export default LeadEngineerDashboard;