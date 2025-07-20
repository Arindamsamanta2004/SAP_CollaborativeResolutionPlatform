import React, { useState } from 'react';
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
import { Ticket } from '../../models/types';
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

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

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
          <Button
            icon="refresh"
            design="Transparent"
            onClick={() => refreshTickets()}
            tooltip="Refresh tickets"
          />
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
              This dashboard demonstrates AI-powered ticket classification and routing based on the 70% skill dominance rule.
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
    </div>
  );
};

export default LeadEngineerDashboard;