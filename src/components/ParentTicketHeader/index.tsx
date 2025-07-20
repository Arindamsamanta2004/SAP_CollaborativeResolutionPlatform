import React, { useState } from 'react';
import {
  Card,
  Title,
  Text,
  Label,
  Button,
  Dialog,
  Bar,
  FlexBox,
  FlexBoxDirection,
  FlexBoxAlignItems,
  FlexBoxJustifyContent,
  Avatar
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Ticket } from '../../models/types';
import { getEngineerById } from '../../models/mockData/engineers';
import './styles.css';

interface ParentTicketHeaderProps {
  ticket: Ticket;
}

const ParentTicketHeader: React.FC<ParentTicketHeaderProps> = ({ ticket }) => {
  // State for resolution dialog
  const [showResolutionDialog, setShowResolutionDialog] = useState<boolean>(false);
  // Get lead engineer if assigned
  const leadEngineer = ticket.assignedLeadId 
    ? getEngineerById(ticket.assignedLeadId) 
    : null;

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return '8';
      case 'High': return '6';
      case 'Medium': return '5';
      case 'Low': return '3';
      default: return '1';
    }
  };

  // Get complexity color
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return '8';
      case 'Medium': return '5';
      case 'Low': return '3';
      default: return '1';
    }
  };

  return (
    <Card className="parent-ticket-header">
      <div className="parent-ticket-content">
        <div className="parent-ticket-main">
          <div className="parent-ticket-id-section">
            <Label>Ticket ID</Label>
            <Title level="H3">{ticket.id}</Title>
            <Badge colorScheme={getUrgencyColor(ticket.urgency)}>{ticket.urgency}</Badge>
          </div>
          
          <div className="parent-ticket-details">
            <Title level="H2">{ticket.subject}</Title>
            <Text className="parent-ticket-description">{ticket.description}</Text>
            
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              alignItems={FlexBoxAlignItems.Center}
              justifyContent={FlexBoxJustifyContent.SpaceBetween}
              className="parent-ticket-metadata"
            >
              <div className="parent-ticket-info-item">
                <Label>Affected System</Label>
                <Text>{ticket.affectedSystem}</Text>
              </div>
              
              <div className="parent-ticket-info-item">
                <Label>Created</Label>
                <Text>{formatDate(ticket.createdAt)}</Text>
              </div>
              
              <div className="parent-ticket-info-item">
                <Label>Status</Label>
                <Badge colorScheme={ticket.status === 'Resolved' ? '8' : '6'}>{ticket.status}</Badge>
              </div>
            </FlexBox>
          </div>
        </div>
        
        <div className="parent-ticket-sidebar">
          {ticket.status === 'Resolved' && ticket.resolution && (
            <div className="parent-ticket-resolution">
              <Title level="H5">Resolution Details</Title>
              
              <div className="parent-ticket-ai-item">
                <Label>Resolved Date</Label>
                <Text>{ticket.resolvedAt ? formatDate(ticket.resolvedAt) : 'N/A'}</Text>
              </div>
              
              <div className="parent-ticket-ai-item">
                <Label>Resolution Summary</Label>
                <div className="parent-ticket-resolution-summary">
                  <Text>{ticket.resolution.substring(0, 100)}...</Text>
                  <Button 
                    design="Transparent" 
                    icon="document-text"
                    onClick={() => setShowResolutionDialog(true)}
                  >
                    View Full Resolution
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {ticket.aiClassification && (
            <div className="parent-ticket-ai-classification">
              <Title level="H5">AI Classification</Title>
              
              <div className="parent-ticket-ai-item">
                <Label>Complexity</Label>
                <Badge colorScheme={getComplexityColor(ticket.aiClassification.complexityEstimate)}>
                  {ticket.aiClassification.complexityEstimate}
                </Badge>
              </div>
              
              <div className="parent-ticket-ai-item">
                <Label>Urgency Score</Label>
                <Text>{ticket.aiClassification.urgencyScore}/100</Text>
              </div>
              
              <div className="parent-ticket-ai-item">
                <Label>Required Skills</Label>
                <div className="parent-ticket-skill-tags">
                  {ticket.aiClassification.skillTags.map(skill => (
                    <Badge key={skill} colorScheme="2">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {leadEngineer && (
            <div className="parent-ticket-lead-engineer">
              <Title level="H5">Lead Engineer</Title>
              <FlexBox 
                direction={FlexBoxDirection.Row} 
                alignItems={FlexBoxAlignItems.Center}
                className="parent-ticket-lead-info"
              >
                <Avatar size="S">
                  {leadEngineer.avatar && <img src={leadEngineer.avatar} alt={leadEngineer.name} />}
                </Avatar>
                <div>
                  <Text>{leadEngineer.name}</Text>
                  <Badge colorScheme={leadEngineer.availability === 'Available' ? '7' : '8'}>
                    {leadEngineer.availability}
                  </Badge>
                </div>
              </FlexBox>
            </div>
          )}
        </div>
      </div>
      
      {/* Resolution Dialog */}
      {ticket.resolution && (
        <Dialog
          open={showResolutionDialog}
          onClose={() => setShowResolutionDialog(false)}
          headerText="Complete Resolution Details"
        >
          <Bar
            design="Header"
            endContent={
              <Button 
                design="Transparent" 
                icon="decline"
                onClick={() => setShowResolutionDialog(false)}
              />
            }
          />
          
          <div style={{ padding: '1rem' }}>
            <Title level="H3">Resolution for Ticket {ticket.id}</Title>
            <Text style={{ margin: '0.5rem 0' }}>
              Resolved on: {ticket.resolvedAt ? formatDate(ticket.resolvedAt) : 'N/A'}
            </Text>
            
            <div style={{ 
              whiteSpace: 'pre-wrap', 
              margin: '1rem 0', 
              padding: '1rem', 
              backgroundColor: '#f7f7f7',
              borderRadius: '0.25rem',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {ticket.resolution}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            padding: '1rem', 
            borderTop: '1px solid #e5e5e5' 
          }}>
            <Button 
              design="Emphasized" 
              onClick={() => setShowResolutionDialog(false)}
            >
              Close
            </Button>
          </div>
        </Dialog>
      )}
    </Card>
  );
};

export default ParentTicketHeader;