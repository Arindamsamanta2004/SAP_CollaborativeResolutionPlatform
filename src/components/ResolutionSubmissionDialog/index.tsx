import React, { useState } from 'react';
import {
  Dialog,
  Title,
  Text,
  Button,
  TextArea,
  MessageStrip,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  Icon,
  Card,
  CardHeader,
  ProgressIndicator,
  List
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Ticket, IssueThread } from '../../models/types';
import './styles.css';

interface ResolutionSubmissionDialogProps {
  isOpen: boolean;
  ticket: Ticket;
  threads: IssueThread[];
  onClose: () => void;
  onSubmitToCustomer: (resolutionSummary: string) => void;
}

const ResolutionSubmissionDialog: React.FC<ResolutionSubmissionDialogProps> = ({
  isOpen,
  ticket,
  threads,
  onClose,
  onSubmitToCustomer
}) => {
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Prevent accidental closing during submission
  const handleDialogClose = () => {
    if (isSubmitting) {
      // Don't allow closing during submission
      return;
    }
    onClose();
  };

  const resolvedThreads = threads.filter(thread => thread.status === 'Resolved');
  const completionPercentage = Math.round((resolvedThreads.length / threads.length) * 100);

  const handleSubmitResolution = async () => {
    if (!resolutionSummary.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgress(0);
    setCurrentStage('Preparing resolution summary...');

    const stages = [
      'Preparing resolution summary...',
      'Compiling thread solutions...',
      'Generating customer notification...',
      'Sending resolution to customer...',
      'Updating ticket status...',
      'Resolution submitted successfully!'
    ];

    // Simulate submission process
    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(stages[i]);
      setSubmissionProgress(((i + 1) / stages.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setShowSuccess(true);
    setIsSubmitting(false);
    
    // Don't call the parent callback immediately - wait for user to click "Continue"
  };

  const generateAutoSummary = () => {
    const threadSolutions = resolvedThreads
      .map(thread => `• ${thread.title}: ${thread.solution || 'Solution implemented successfully'}`)
      .join('\n');

    const autoSummary = `Resolution Summary for Ticket ${ticket.id}:

Issue: ${ticket.subject}

Our technical team has successfully resolved your issue through collaborative analysis and implementation. Here's what was accomplished:

${threadSolutions}

The issue has been fully resolved and all systems are now functioning normally. Our team has tested the solution to ensure stability and performance.

If you experience any further issues or have questions about this resolution, please don't hesitate to contact us.

Best regards,
SAP Support Team`;

    setResolutionSummary(autoSummary);
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleDialogClose}
      className="resolution-submission-dialog"
      headerText="📋 Submit Resolution to Customer"
      preventInitialFocus={true}
      resizable={false}
    >
      <div className="resolution-submission-content">
        {!isSubmitting && !showSuccess ? (
          // Resolution Preparation View
          <div className="resolution-preparation">
            <div className="resolution-header">
              <Title level="H3">Resolution Ready for Customer</Title>
              <Text className="resolution-subtitle">
                All threads have been resolved. Prepare the final resolution summary for the customer.
              </Text>
            </div>

            {/* Ticket Summary */}
            <Card className="ticket-summary-card">
              <CardHeader titleText={ticket.subject} subtitleText={`Ticket ID: ${ticket.id}`} />
              <div className="ticket-summary-content">
                <FlexBox direction={FlexBoxDirection.Row} className="summary-metadata">
                  <Badge colorScheme="1">{ticket.affectedSystem}</Badge>
                  <Badge colorScheme="2">{ticket.urgency}</Badge>
                  <Badge colorScheme="8">{completionPercentage}% Complete</Badge>
                </FlexBox>
                <Text className="ticket-description">{ticket.description}</Text>
              </div>
            </Card>

            {/* Thread Solutions Summary */}
            <Card className="thread-solutions-card">
              <CardHeader titleText="Thread Solutions Summary" />
              <div className="thread-solutions-content">
                <List className="solutions-list">
                  {resolvedThreads.map(thread => (
                    <li key={thread.id} className="ui5-list-item solution-item">
                      <div className="solution-header">
                        <Icon name="complete" className="solution-icon" />
                        <Text className="solution-title">{thread.title}</Text>
                      </div>
                      <Text className="solution-description">
                        {thread.solution || 'Solution implemented successfully'}
                      </Text>
                    </li>
                  ))}
                </List>
              </div>
            </Card>

            {/* Resolution Summary Input */}
            <div className="resolution-input-section">
              <FlexBox 
                direction={FlexBoxDirection.Row} 
                justifyContent={FlexBoxJustifyContent.SpaceBetween}
                alignItems={FlexBoxAlignItems.Center}
                className="resolution-input-header"
              >
                <Text className="resolution-input-label">Customer Resolution Summary:</Text>
                <Button
                  design="Default"
                  icon="generate-shortcut"
                  onClick={generateAutoSummary}
                  tooltip="Generate automatic summary"
                >
                  Auto-Generate
                </Button>
              </FlexBox>
              
              <TextArea
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="Provide a comprehensive summary of the resolution for the customer..."
                rows={8}
                className="resolution-textarea"
              />
              
              {!resolutionSummary.trim() && (
                <MessageStrip design="Information" hideCloseButton className="resolution-hint">
                  Use "Auto-Generate" to create a professional summary, or write your own custom resolution summary.
                </MessageStrip>
              )}
            </div>

            {/* Action Buttons */}
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              justifyContent={FlexBoxJustifyContent.End}
              className="resolution-actions"
            >
              <Button design="Default" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                design="Emphasized" 
                icon="email"
                onClick={handleSubmitResolution}
                disabled={!resolutionSummary.trim()}
              >
                Submit to Customer
              </Button>
            </FlexBox>
          </div>
        ) : isSubmitting ? (
          // Submission Progress View
          <div className="resolution-submission-progress">
            <div className="submission-header">
              <Icon name="email" className="submission-icon" />
              <Title level="H3">Submitting Resolution</Title>
              <Text className="submission-subtitle">
                Sending resolution summary to customer...
              </Text>
            </div>

            <div className="submission-progress-section">
              <ProgressIndicator
                value={submissionProgress}
                valueState="Information"
                displayValue={`${Math.round(submissionProgress)}%`}
                className="submission-progress-bar"
              />
              
              <div className="submission-stage-indicator">
                <div className="submission-stage-pulse active"></div>
                <Text className="submission-current-stage">{currentStage}</Text>
              </div>
            </div>

            <div className="submission-animation">
              <div className="submission-rings active">
                <div className="submission-ring submission-ring-1"></div>
                <div className="submission-ring submission-ring-2"></div>
                <div className="submission-ring submission-ring-3"></div>
              </div>
            </div>
          </div>
        ) : (
          // Success View
          <div className="resolution-success">
            <div className="success-icon-container">
              <Icon name="accept" className="success-icon" />
            </div>
            
            <Title level="H2" className="success-title">
              Resolution Submitted Successfully!
            </Title>
            
            <Text className="success-message">
              The customer has been notified about the resolution and can now view the solution details.
            </Text>
            
            <div className="success-details">
              <Text>✓ Resolution summary sent to customer</Text>
              <Text>✓ Ticket status updated to "Resolved"</Text>
              <Text>✓ Customer portal updated with solution</Text>
              <Text>✓ Chat channel opened for follow-up questions</Text>
            </div>
            
            <FlexBox 
              direction={FlexBoxDirection.Row} 
              justifyContent={FlexBoxJustifyContent.Center}
              className="success-actions"
            >
              <Button 
                design="Emphasized" 
                icon="nav-back"
                onClick={() => {
                  // Now call the parent callback when user manually continues
                  onSubmitToCustomer(resolutionSummary);
                  setShowSuccess(false);
                  setResolutionSummary('');
                  onClose();
                }}
              >
                Continue to Dashboard
              </Button>
            </FlexBox>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ResolutionSubmissionDialog;