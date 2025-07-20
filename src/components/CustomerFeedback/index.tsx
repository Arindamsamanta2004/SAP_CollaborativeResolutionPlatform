import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  Title,
  Text,
  Button,
  TextArea,
  RatingIndicator,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  MessageStrip,
  Icon,
  Dialog
} from '@ui5/webcomponents-react';
import Badge from '../Badge';
import { Ticket } from '../../models/types';
import './styles.css';

interface CustomerFeedbackProps {
  ticket: Ticket;
  resolutionSummary?: string;
}

const CustomerFeedback: React.FC<CustomerFeedbackProps> = ({ ticket, resolutionSummary }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);

    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitted(true);
    setIsSubmitting(false);
    setShowThankYou(true);

    // Auto-close thank you dialog after 3 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Dissatisfied';
      case 2: return 'Dissatisfied';
      case 3: return 'Neutral';
      case 4: return 'Satisfied';
      case 5: return 'Very Satisfied';
      default: return 'Please rate your experience';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '8'; // Green
    if (rating === 3) return '6'; // Yellow
    if (rating >= 1) return '5'; // Red
    return '1'; // Default
  };

  return (
    <>
      <Card className="customer-feedback-card">
        <CardHeader
          titleText="Resolution Feedback"
          subtitleText={`Ticket ${ticket.id} - ${ticket.subject}`}
          avatar={<Icon name="feedback" />}
        />
        
        <div className="feedback-content">
          {!isSubmitted ? (
            <>
              <MessageStrip
                design="Positive"
                hideCloseButton
                className="resolution-complete-strip"
              >
                ✓ Your ticket has been resolved! Please rate your support experience.
              </MessageStrip>

              {resolutionSummary && (
                <div className="resolution-summary-section">
                  <Title level="H4">Resolution Summary</Title>
                  <div className="resolution-summary-content">
                    <Text>{resolutionSummary}</Text>
                  </div>
                </div>
              )}

              <div className="rating-section">
                <Title level="H4">How satisfied are you with the support provided?</Title>
                
                <FlexBox 
                  direction={FlexBoxDirection.Column} 
                  alignItems={FlexBoxAlignItems.Center}
                  className="rating-container"
                >
                  <RatingIndicator
                    value={rating}
                    onChange={(e) => setRating((e.target as any).value || 0)}
                    className="rating-stars"
                  />
                  
                  <Badge colorScheme={getRatingColor(rating)} className="rating-text-badge">
                    {getRatingText(rating)}
                  </Badge>
                </FlexBox>
              </div>

              <div className="feedback-text-section">
                <Title level="H4">Additional Comments (Optional)</Title>
                <TextArea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Please share any additional feedback about your support experience..."
                  rows={4}
                  className="feedback-textarea"
                />
              </div>

              <FlexBox 
                direction={FlexBoxDirection.Row} 
                justifyContent={FlexBoxJustifyContent.End}
                className="feedback-actions"
              >
                <Button
                  design="Emphasized"
                  icon="feedback"
                  onClick={handleSubmitFeedback}
                  disabled={rating === 0 || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </FlexBox>
            </>
          ) : (
            <div className="feedback-submitted">
              <div className="feedback-submitted-icon">
                <Icon name="accept" className="success-icon" />
              </div>
              <Title level="H3">Thank You for Your Feedback!</Title>
              <Text>Your feedback has been submitted and will help us improve our support services.</Text>
              
              <div className="submitted-rating-summary">
                <Text>Your Rating:</Text>
                <FlexBox direction={FlexBoxDirection.Row} alignItems={FlexBoxAlignItems.Center}>
                  <RatingIndicator value={rating} readonly className="submitted-rating" />
                  <Badge colorScheme={getRatingColor(rating)}>
                    {getRatingText(rating)}
                  </Badge>
                </FlexBox>
              </div>

              {feedback && (
                <div className="submitted-feedback-text">
                  <Text className="feedback-label">Your Comments:</Text>
                  <Text className="feedback-text">"{feedback}"</Text>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Thank You Dialog */}
      <Dialog
        open={showThankYou}
        onClose={() => setShowThankYou(false)}
        className="thank-you-dialog"
        headerText="🎉 Feedback Received"
      >
        <div className="thank-you-content">
          <div className="thank-you-animation">
            <Icon name="accept" className="thank-you-icon" />
          </div>
          <Title level="H2">Thank You!</Title>
          <Text>Your feedback is valuable to us and helps improve our support quality.</Text>
          
          <div className="thank-you-stats">
            <div className="thank-you-stat">
              <Icon name="star-2" className="stat-icon" />
              <Text>{rating}/5 Stars</Text>
            </div>
            <div className="thank-you-stat">
              <Icon name="time" className="stat-icon" />
              <Text>Response in 24h</Text>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CustomerFeedback;