import React, { useState, useEffect } from 'react';
import {
  Title,
  Text,
  Card,
  CardHeader,
  BusyIndicator,
  Bar,
  IllustratedMessage,
  Button,
  MessageStrip,
  Grid,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon,
  ProgressIndicator
} from '@ui5/webcomponents-react';
import { useTickets } from '../../contexts/TicketContext';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge';
import { Ticket } from '../../models/types';
import './styles.css';

const CRPList: React.FC = () => {
  const { tickets, loading, refreshTickets } = useTickets();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Filter tickets that are in CRP (have threads)
  const crpTickets = tickets.filter(ticket => 
    ticket.status === 'In Progress' && 
    ticket.threads && 
    ticket.threads.length > 0
  );

  // Apply additional filtering
  const filteredTickets = crpTickets.filter(ticket => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') {
      return ticket.threads?.some(thread => thread.status !== 'Resolved');
    }
    if (selectedFilter === 'completed') {
      return ticket.threads?.every(thread => thread.status === 'Resolved');
    }
    return true;
  });

  const getTicketProgress = (ticket: Ticket): number => {
    if (!ticket.threads || ticket.threads.length === 0) return 0;
    const resolvedThreads = ticket.threads.filter(thread => thread.status === 'Resolved').length;
    return Math.round((resolvedThreads / ticket.threads.length) * 100);
  };

  const getProgressState = (progress: number) => {
    if (progress === 100) return 'Positive';
    if (progress >= 50) return 'Information';
    return 'Critical';
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return '5';
      case 'Medium': return '4';
      case 'Low': return '3';
      default: return '1';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return '5';
      case 'High': return '4';
      case 'Medium': return '3';
      case 'Low': return '2';
      default: return '1';
    }
  };

  if (loading) {
    return (
      <div className="crp-list-loading">
        <BusyIndicator size="L" />
        <Text>Loading CRP tickets...</Text>
      </div>
    );
  }

  return (
    <div className="crp-list-page">
      <Bar
        startContent={
          <div className="crp-list-header">
            <Icon name="collaborate" className="crp-header-icon" />
            <Title>Collaborative Resolution Platform</Title>
          </div>
        }
        endContent={
          <div className="crp-list-actions">
            <Button
              icon="nav-back"
              design="Default"
              onClick={() => navigate('/lead-dashboard')}
              tooltip="Back to Lead Dashboard"
            >
              Back to Dashboard
            </Button>
            <Button
              icon="refresh"
              design="Transparent"
              onClick={() => refreshTickets()}
              tooltip="Refresh CRP tickets"
            />
          </div>
        }
      />

      <div className="crp-list-content">
        <MessageStrip
          design="Information"
          hideCloseButton
          className="crp-info-strip"
        >
          This dashboard shows all tickets currently in collaborative resolution. Each ticket has been decomposed into specialized threads for parallel processing by expert engineers.
        </MessageStrip>

        {/* Filter Tabs */}
        <div className="crp-filter-tabs">
          <Button
            design={selectedFilter === 'all' ? 'Emphasized' : 'Default'}
            onClick={() => setSelectedFilter('all')}
            className="filter-tab"
          >
            All CRP Tickets ({crpTickets.length})
          </Button>
          <Button
            design={selectedFilter === 'active' ? 'Emphasized' : 'Default'}
            onClick={() => setSelectedFilter('active')}
            className="filter-tab"
          >
            Active ({crpTickets.filter(t => t.threads?.some(th => th.status !== 'Resolved')).length})
          </Button>
          <Button
            design={selectedFilter === 'completed' ? 'Emphasized' : 'Default'}
            onClick={() => setSelectedFilter('completed')}
            className="filter-tab"
          >
            Completed ({crpTickets.filter(t => t.threads?.every(th => th.status === 'Resolved')).length})
          </Button>
        </div>

        {/* CRP Tickets Grid */}
        <div className="crp-tickets-grid">
          {filteredTickets.length === 0 ? (
            <Card className="empty-state-card">
              <IllustratedMessage
                name={selectedFilter === 'all' ? 'NoData' : 'NoEntries'}
                titleText={
                  selectedFilter === 'all' 
                    ? 'No CRP tickets found' 
                    : `No ${selectedFilter} CRP tickets`
                }
                subtitleText={
                  selectedFilter === 'all'
                    ? 'Complex tickets will appear here when they are routed to CRP'
                    : `Switch to "All" to see all CRP tickets`
                }
              />
            </Card>
          ) : (
            filteredTickets.map(ticket => {
              const progress = getTicketProgress(ticket);
              const activeThreads = ticket.threads?.filter(t => t.status === 'In Progress').length || 0;
              const totalThreads = ticket.threads?.length || 0;
              
              return (
                <Card
                  key={ticket.id}
                  className="crp-ticket-card"
                  onClick={() => navigate(`/crp/${ticket.id}`)}
                >
                  <CardHeader
                    titleText={ticket.subject}
                    subtitleText={`Ticket ID: ${ticket.id}`}
                    avatar={<Icon name="collaborate" />}
                  />
                  
                  <div className="crp-ticket-content">
                    <div className="ticket-metadata">
                      <FlexBox direction={FlexBoxDirection.Row} className="metadata-badges">
                        <Badge colorScheme={getUrgencyColor(ticket.urgency)}>
                          {ticket.urgency}
                        </Badge>
                        {ticket.aiClassification && (
                          <Badge colorScheme={getComplexityColor(ticket.aiClassification.complexityEstimate)}>
                            {ticket.aiClassification.complexityEstimate} Complexity
                          </Badge>
                        )}
                        <Badge colorScheme="1">
                          {ticket.affectedSystem}
                        </Badge>
                      </FlexBox>
                    </div>

                    <div className="ticket-description">
                      <Text>{ticket.description.substring(0, 120)}...</Text>
                    </div>

                    <div className="thread-summary">
                      <FlexBox 
                        direction={FlexBoxDirection.Row} 
                        justifyContent={FlexBoxJustifyContent.SpaceBetween}
                        alignItems={FlexBoxAlignItems.Center}
                        className="thread-info"
                      >
                        <div className="thread-stats">
                          <Icon name="workflow-tasks" className="thread-icon" />
                          <Text className="thread-count">
                            {totalThreads} Threads ({activeThreads} Active)
                          </Text>
                        </div>
                        <div className="thread-progress">
                          <Text className="progress-text">{progress}% Complete</Text>
                        </div>
                      </FlexBox>
                      
                      <ProgressIndicator
                        value={progress}
                        valueState={getProgressState(progress)}
                        className="ticket-progress-bar"
                      />
                    </div>

                    {ticket.aiClassification && (
                      <div className="required-skills">
                        <Text className="skills-label">Skills Required:</Text>
                        <div className="skills-tags">
                          {ticket.aiClassification.skillTags.slice(0, 4).map((skill, index) => (
                            <Badge key={skill} colorScheme={`${(index % 10) + 1}`}>
                              {skill}
                            </Badge>
                          ))}
                          {ticket.aiClassification.skillTags.length > 4 && (
                            <Badge colorScheme="8">
                              +{ticket.aiClassification.skillTags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="crp-actions">
                      <Button
                        design="Emphasized"
                        icon="detail-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/crp/${ticket.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary Statistics */}
        {crpTickets.length > 0 && (
          <Card className="crp-summary-card">
            <CardHeader titleText="CRP Summary Statistics" />
            <div className="crp-summary-content">
              <Grid defaultSpan="XL3 L3 M6 S12" className="summary-grid">
                <div className="summary-stat">
                  <Icon name="collaborate" className="stat-icon" />
                  <div className="stat-content">
                    <Text className="stat-number">{crpTickets.length}</Text>
                    <Text className="stat-label">Total CRP Tickets</Text>
                  </div>
                </div>
                
                <div className="summary-stat">
                  <Icon name="workflow-tasks" className="stat-icon" />
                  <div className="stat-content">
                    <Text className="stat-number">
                      {crpTickets.reduce((sum, ticket) => sum + (ticket.threads?.length || 0), 0)}
                    </Text>
                    <Text className="stat-label">Active Threads</Text>
                  </div>
                </div>
                
                <div className="summary-stat">
                  <Icon name="employee" className="stat-icon" />
                  <div className="stat-content">
                    <Text className="stat-number">
                      {crpTickets.filter(t => t.threads?.some(th => th.status === 'In Progress')).length}
                    </Text>
                    <Text className="stat-label">Engineers Working</Text>
                  </div>
                </div>
                
                <div className="summary-stat">
                  <Icon name="accept" className="stat-icon" />
                  <div className="stat-content">
                    <Text className="stat-number">
                      {Math.round(crpTickets.reduce((sum, ticket) => sum + getTicketProgress(ticket), 0) / crpTickets.length)}%
                    </Text>
                    <Text className="stat-label">Avg. Completion</Text>
                  </div>
                </div>
              </Grid>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CRPList;