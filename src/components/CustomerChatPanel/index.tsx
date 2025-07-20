import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Title,
  Text,
  Button,
  TextArea,
  Avatar,
  Icon,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  MessageStrip
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Ticket } from '../../models/types';
import './styles.css';

interface ChatMessage {
  id: string;
  sender: 'customer' | 'engineer';
  message: string;
  timestamp: Date;
  senderName: string;
}

interface CustomerChatPanelProps {
  ticket: Ticket;
  isResolved?: boolean;
}

const CustomerChatPanel: React.FC<CustomerChatPanelProps> = ({ ticket, isResolved = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with some demo messages
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        sender: 'customer',
        message: `Hi, I submitted ticket ${ticket.id} regarding ${ticket.subject}. Can you provide an update on the progress?`,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        senderName: 'Customer'
      }
    ];

    if (isResolved) {
      initialMessages.push({
        id: '2',
        sender: 'engineer',
        message: `Hello! I'm pleased to inform you that we have successfully resolved your issue. The resolution has been implemented and all systems are now functioning normally. Please check your customer portal for the detailed resolution summary.`,
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        senderName: 'Lead Engineer'
      });
      
      initialMessages.push({
        id: '3',
        sender: 'customer',
        message: 'Thank you for the quick resolution! Everything seems to be working fine now.',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        senderName: 'Customer'
      });
    }

    setMessages(initialMessages);
  }, [ticket.id, ticket.subject, isResolved]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'engineer',
      message: newMessage,
      timestamp: new Date(),
      senderName: 'Lead Engineer'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate customer typing response
    if (!isResolved) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const customerResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'customer',
          message: 'Thank you for the update. I appreciate your help with this issue.',
          timestamp: new Date(),
          senderName: 'Customer'
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 2000);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="customer-chat-panel">
      <CardHeader
        titleText="Customer Communication"
        subtitleText={`Ticket ${ticket.id} - ${ticket.subject}`}
        avatar={<Icon name="discussion" />}
      />
      
      <div className="chat-panel-content">
        {isResolved && (
          <MessageStrip
            design="Positive"
            hideCloseButton
            className="resolution-status-strip"
          >
            ✓ Resolution submitted to customer. Chat remains open for follow-up questions.
          </MessageStrip>
        )}

        <div className="chat-messages">
          {messages.map(message => (
            <div
              key={message.id}
              className={`chat-message ${message.sender === 'engineer' ? 'engineer-message' : 'customer-message'}`}
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
          
          {isTyping && (
            <div className="chat-message customer-message typing-indicator">
              <div className="message-header">
                <Avatar size="XS" className="message-avatar customer">
                  <Icon name="customer" />
                </Avatar>
                <div className="message-info">
                  <Text className="message-sender">Customer</Text>
                  <Text className="message-time">typing...</Text>
                </div>
              </div>
              <div className="message-content typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-section">
          <FlexBox direction={FlexBoxDirection.Column} className="chat-input-container">
            <TextArea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message to the customer..."
              rows={3}
              className="chat-input"
            />
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              justifyContent={FlexBoxJustifyContent.SpaceBetween}
              alignItems={FlexBoxAlignItems.Center}
              className="chat-input-actions"
            >
              <div className="chat-status">
                <Badge colorScheme={isResolved ? '8' : '6'}>
                  {isResolved ? 'Resolved' : 'In Progress'}
                </Badge>
                <Text className="chat-status-text">
                  {isResolved ? 'Available for follow-up' : 'Active support session'}
                </Text>
              </div>
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
    </Card>
  );
};

export default CustomerChatPanel;