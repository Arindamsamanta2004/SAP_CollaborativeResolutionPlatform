import React from 'react';
import { 
  Card, 
  CardHeader, 
  Text, 
  Button,
  Icon,
  ProgressIndicator,
  Title
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Ticket } from '../../models/types';
import { useTickets } from '../../contexts/TicketContext';
import './styles.css';

interface TicketCardProps {
  ticket: Ticket;
  isProcessing: boolean;
  processingProgress: number;
  onTriggerCRP: (ticket: Ticket) => void;
  onRouteToStandard: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  isProcessing,
  processingProgress,
  onTriggerCRP,
  onRouteToStandard
}) => {
  const { navigateToCRP } = useTickets();
  return (
    <Card className="ticket-card">
      <CardHeader
        titleText={ticket.subject}
        subtitleText={`Ticket ID: ${ticket.id} | ${ticket.affectedSystem}`}
        avatar={<Icon name="document-text" />}
      />
      
      <div className="ticket-card-content">
        <div className="ticket-description">
          <Text>{ticket.description.substring(0, 150)}...</Text>
        </div>
        
        {ticket.aiClassification && (
          <div className="ai-classification">
            <Title level="H5">AI Classification</Title>
            
            <div className="classification-badges">
              <Badge className={`urgency-badge urgency-${ticket.urgency.toLowerCase()}`}>
                Urgency: {ticket.urgency} ({ticket.aiClassification.urgencyScore}/100)
              </Badge>
              
              <Badge className={`complexity-badge complexity-${ticket.aiClassification.complexityEstimate.toLowerCase()}`}>
                Complexity: {ticket.aiClassification.complexityEstimate}
              </Badge>
            </div>
            
            <div className="skill-tags">
              <Text>Required Skills:</Text>
              <div className="skill-badges">
                {ticket.aiClassification.skillTags.map(skill => (
                  <Badge key={skill} className={`skill-badge skill-${skill.toLowerCase()}`}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="recommended-action">
              <Text>Recommended Action:</Text>
              <Badge className={`action-badge action-${ticket.aiClassification.recommendedAction.toLowerCase()}`}>
                {ticket.aiClassification.recommendedAction}
              </Badge>
            </div>
            
            {isProcessing ? (
              <div className="processing-indicator">
                <Text>Processing ticket...</Text>
                <ProgressIndicator 
                  value={processingProgress} 
                  valueState={processingProgress < 100 ? "Information" : "Positive"}
                />
              </div>
            ) : ticket.status === 'In Progress' && ticket.threads && ticket.threads.length > 0 ? (
              <div className="routing-actions">
                <Button 
                  design="Emphasized"
                  onClick={() => navigateToCRP(ticket.id)}
                  icon="workflow-tasks"
                >
                  View in CRP
                </Button>
              </div>
            ) : (
              <div className="routing-actions">
                <Button 
                  design="Emphasized"
                  onClick={() => onTriggerCRP(ticket)}
                  disabled={ticket.aiClassification.recommendedAction !== 'CRP'}
                  icon="workflow-tasks"
                >
                  Trigger CRP
                </Button>
                <Button 
                  design="Default"
                  onClick={() => onRouteToStandard(ticket)}
                  icon="inbox"
                >
                  Route to Standard Queue
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TicketCard;