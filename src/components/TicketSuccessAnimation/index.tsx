import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Title,
  Text,
  Icon,
  ProgressIndicator,
  Button,
  FlexBox,
  FlexBoxDirection,
  FlexBoxAlignItems,
  FlexBoxJustifyContent
} from '@ui5/webcomponents-react';
import './styles.css';

interface TicketSuccessAnimationProps {
  isOpen: boolean;
  ticketId: string;
  onComplete: () => void;
}

const TicketSuccessAnimation: React.FC<TicketSuccessAnimationProps> = ({
  isOpen,
  ticketId,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const stages = [
    'Ticket submitted successfully...',
    'Notifying our best support engineers...',
    'Initializing AI classification...',
    'Preparing for expert assignment...',
    'Redirecting to engineer dashboard...'
  ];

  useEffect(() => {
    if (isOpen) {
      let stageIndex = 0;
      setProgress(0);
      setShowSuccess(false);
      setCurrentStage(stages[0]);

      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 20;
          
          if (newProgress <= 100) {
            // Update stage based on progress
            const newStageIndex = Math.floor(newProgress / 20) - 1;
            if (newStageIndex >= 0 && newStageIndex < stages.length) {
              setCurrentStage(stages[newStageIndex]);
            }
            
            if (newProgress === 100) {
              setTimeout(() => {
                setShowSuccess(true);
              }, 500);
            }
            
            return newProgress;
          }
          
          clearInterval(interval);
          return prev;
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [isOpen, onComplete]);

  return (
    <Dialog
      open={isOpen}
      className="ticket-success-dialog"
      headerText=""
    >
      <div className="ticket-success-content">
        {!showSuccess ? (
          <div className="success-progress">
            <div className="success-icon-container">
              <div className="success-rings">
                <div className="success-ring success-ring-1"></div>
                <div className="success-ring success-ring-2"></div>
                <div className="success-ring success-ring-3"></div>
              </div>
              <Icon name="accept" className="success-icon pulsing" />
            </div>
            
            <Title level="H2" className="success-title">
              Ticket Submitted Successfully!
            </Title>
            
            <Text className="success-ticket-id">
              Ticket ID: <strong>{ticketId}</strong>
            </Text>
            
            <div className="success-progress-section">
              <ProgressIndicator
                value={progress}
                valueState="Positive"
                displayValue={`${progress}%`}
                className="success-progress-bar"
              />
              
              <div className="success-stage-indicator">
                <div className="success-stage-pulse active"></div>
                <Text className="success-current-stage">{currentStage}</Text>
              </div>
            </div>
            
            <div className="success-message">
              <Icon name="employee" className="engineer-icon" />
              <Text className="success-description">
                Our best support engineers are working on it
              </Text>
            </div>
          </div>
        ) : (
          <div className="success-complete">
            <div className="success-checkmark">
              <Icon name="accept" className="checkmark-icon" />
            </div>
            
            <Title level="H2" className="complete-title">
              All Set!
            </Title>
            
            <Text className="complete-message">
              Your ticket has been submitted and is ready for processing by our lead engineers.
            </Text>
            
            <div className="success-actions">
              <Button
                design="Emphasized"
                onClick={onComplete}
                className="continue-button"
              >
                Continue to Lead Engineer Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default TicketSuccessAnimation;