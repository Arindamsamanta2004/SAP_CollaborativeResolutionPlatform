import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  Title,
  Text,
  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon,
  MessageStrip,
  Timeline,
  TimelineItem,
  Dialog,
  TextArea,
  Avatar
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import CustomerFeedback from '../CustomerFeedback';
import { Ticket } from '../../models/types';
import './styles.css';

interface CustomerResolutionViewProps {
  ticket: Ticket;
  resolutionSummary: string;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'engineer';
  message: string;
  timestamp: Date;
  senderName: string;
}

const CustomerResolutionView: React.FC<CustomerResolutionViewProps> = ({ 
  ticket, 
  resolutionSummary 
}) => {
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'engineer',
      message: `Hello! Your ticket ${ticket.id} has been successfully resolved. Please review the resolution details and let us know if you have any questions.`,
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      senderName: 'Lead Engineer'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'customer',
      message: newMessage,
      timestamp: new Date(),
      senderName: 'You'
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate engineer response
    setTimeout(() => {
      const engineerResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'engineer',
        message: 'Thank you for your message. I\'m here to help if you have any questions about the resolution.',
        timestamp: new Date(),
        senderName: 'Lead Engineer'
      };
      setChatMessages(prev => [...prev, engineerResponse]);
    }, 2000);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return '8';
      case 'In Progress': return '6';
      case 'Submitted': return '1';
      default: return '1';
    }
  };

  return (
    <div className="customer-resolution-view">
      {/* Resolution Status Header */}
      <Card className="resolution-status-card">
        <div className="resolution-status-header">
          <div className="status-icon-container">
            <Icon name="accept" className="status-icon resolved" />
          </div>
          <div className="status-content">
            <Title level="H2">Ticket Resolved Successfully!</Title>
            <Text className="status-subtitle">
              Your issue has been resolved by our technical team
            </Text>
            <FlexBox direction={FlexBoxDirection.Row} className="status-metadata">
              <Badge colorScheme={getStatusColor(ticket.status)}>
                {ticket.status}
              </Badge>
              <Badge colorScheme="1">
                Ticket ID: {ticket.id}
              </Badge>
              <Badge colorScheme="2">
                {ticket.affectedSystem}
              </Badge>
            </FlexBox>
          </div>
        </div>
      </Card>

      {/* Ticket Timeline */}
      <Card className="ticket-timeline-card">
        <CardHeader titleText="Resolution Timeline" />
        <div className="timeline-content">
          <Timeline>
            <TimelineItem
              titleText="Ticket Submitted"
              subtitleText="Issue reported by customer"
              icon="document-text"
              name="Step 1"
            >
              <Text>{ticket.subject}</Text>
            </TimelineItem>
            
            <TimelineItem
              titleText="AI Classification"
              subtitleText="Ticket analyzed and classified"
              icon="artificial-intelligence"
              name="Step 2"
            >
              <Text>Complexity: {ticket.aiClassification?.complexityEstimate || 'Medium'}</Text>
              <Text>Skills Required: {ticket.aiClassification?.skillTags.join(', ') || 'Technical Support'}</Text>
            </TimelineItem>
            
            <TimelineItem
              titleText="Collaborative Resolution"
              subtitleText="Expert team assigned to resolve issue"
              icon="collaborate"
              name="Step 3"
            >
              <Text>Multiple specialists worked together to resolve your issue</Text>
            </TimelineItem>
            
            <TimelineItem
              titleText="Resolution Complete"
              subtitleText="Issue successfully resolved"
              icon="complete"
              name="Step 4"
            >
              <Text>All technical issues have been addressed and tested</Text>
            </TimelineItem>
          </Timeline>
        </div>
      </Card>

      {/* Resolution Details */}
      <Card className="resolution-details-card">
        <CardHeader titleText="Resolution Details" />
        <div className="resolution-details-content">
          <div className="resolution-summary">
            <Title level="H4">What We Fixed</Title>
            <div className="resolution-text">
              <Text>{resolutionSummary}</Text>
            </div>
          </div>
          
          <div className="resolution-actions">
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              justifyContent={FlexBoxJustifyContent.SpaceBetween}
              alignItems={FlexBoxAlignItems.Center}
              className="action-buttons"
            >
              <div className="primary-actions">
                <Button
                  design="Emphasized"
                  icon="discussion"
                  onClick={() => setShowChatDialog(true)}
                >
                  Chat with Support
                </Button>
                
                <Button
                  design="Positive"
                  icon="accept"
                  onClick={() => {
                    // Handle close ticket action
                    alert('Thank you! Your ticket has been closed successfully. We appreciate your feedback.');
                  }}
                  className="close-ticket-button"
                >
                  Close Ticket
                </Button>
                
                <Button
                  design="Attention"
                  icon="warning"
                  onClick={() => {
                    // Handle issue persists action
                    alert('We understand the issue persists. A senior engineer will be assigned to investigate further. You will be contacted within 2 hours.');
                  }}
                  className="issue-persists-button"
                >
                  Issue Persists
                </Button>
              </div>
              
              <div className="support-info">
                <Text className="support-text">
                  Need help? Our support team is available 24/7
                </Text>
              </div>
            </FlexBox>
          </div>
        </div>
      </Card>

      {/* Customer Feedback Component */}
      <CustomerFeedback ticket={ticket} resolutionSummary={resolutionSummary} />

      {/* Chat Dialog */}
      <Dialog
        open={showChatDialog}
        onClose={() => setShowChatDialog(false)}
        className="customer-chat-dialog"
        headerText="💬 Chat with Support Team"
      >
        <div className="customer-chat-content">
          <div className="chat-messages-container">
            {chatMessages.map(message => (
              <div
                key={message.id}
                className={`chat-message ${message.sender === 'customer' ? 'customer-message' : 'engineer-message'}`}
              >
                <div className="message-header">
                  <Avatar size="XS" className={`message-avatar ${message.sender}`}>
                    <Icon name={message.sender === 'engineer' ? 'employee' : 'customer'} />
                  </Avatar>
                  <div className="message-info">
                    <Text className="message-sender">{message.senderName}</Text>
                    <Text className="message-time">{formatTime(message.timestamp)}</Text>
                  </div>
                </div>
                <div className="message-content">
                  <Text>{message.message}</Text>
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-section">
            <FlexBox direction={FlexBoxDirection.Column} className="chat-input-container">
              <TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="chat-input"
              />
              <FlexBox 
                direction={FlexBoxDirection.Row} 
                justifyContent={FlexBoxJustifyContent.End}
                className="chat-input-actions"
              >
                <Button
                  design="Emphasized"
                  icon="paper-plane"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </FlexBox>
            </FlexBox>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CustomerResolutionView;