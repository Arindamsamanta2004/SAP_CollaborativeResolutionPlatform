import React, { useState, useEffect } from 'react';
import {
  Form,
  FormItem,
  Input,
  TextArea,
  Select,
  Option,
  Button,
  MessageBox,
  FlexBox,
  FlexBoxDirection,
  Title,
  Label,
  Bar,
  MessageStrip
} from '@ui5/webcomponents-react';
import { UrgencyLevel, AffectedSystem } from '../../models/types';
import { ticketService } from '../../services/api/ticketService';
import { systemStatusService } from '../../services/system/systemStatusService';
import { errorHandlingService, AppError, ErrorType } from '../../services/error/errorHandlingService';
import { createError, formValidation } from '../../services/error/errorUtils';
import FileUploader from '../FileUploader';
import SAPLogo from '../SAPLogo';
import LoadingState from '../LoadingState';
import FeedbackMessage from '../FeedbackMessage';
import './styles.css';

interface TicketSubmissionFormProps {
  onSubmissionSuccess: (ticketId: string) => void;
}

const TicketSubmissionForm: React.FC<TicketSubmissionFormProps> = ({ onSubmissionSuccess }) => {
  // Form state
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
  const [affectedSystem, setAffectedSystem] = useState<AffectedSystem>('SAP S/4HANA');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStage, setSubmissionStage] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<AppError | null>(null);
  const [isFeatureAvailable, setIsFeatureAvailable] = useState(true);

  // Available affected systems from the types
  const affectedSystems: AffectedSystem[] = [
    'SAP ERP',
    'SAP S/4HANA',
    'SAP SuccessFactors',
    'SAP Ariba',
    'SAP Concur',
    'SAP Fieldglass',
    'SAP Customer Experience',
    'SAP Business Technology Platform'
  ];

  // Check if ticket submission feature is available
  useEffect(() => {
    const checkFeatureAvailability = () => {
      const available = systemStatusService.isFeatureAvailable('ticketSubmission');
      setIsFeatureAvailable(available);
    };
    
    // Initial check
    checkFeatureAvailability();
    
    // Set up interval to check periodically
    const interval = setInterval(checkFeatureAvailability, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle file uploads
  const handleFileChange = (files: File[]) => {
    setAttachments([...attachments, ...files]);
    
    // Clear any previous file-related errors
    if (formErrors.attachments) {
      const { attachments, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };

  // Remove a file from attachments
  const handleFileRemove = (fileToRemove: File) => {
    setAttachments(attachments.filter(file => file !== fileToRemove));
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate subject
    const subjectRequiredError = formValidation.validateRequired(subject, 'Subject');
    if (subjectRequiredError) {
      errors.subject = subjectRequiredError.message;
    } else {
      const subjectLengthError = formValidation.validateLength(subject, 5, 100, 'Subject');
      if (subjectLengthError) {
        errors.subject = subjectLengthError.message;
      }
    }
    
    // Validate description
    const descriptionRequiredError = formValidation.validateRequired(description, 'Description');
    if (descriptionRequiredError) {
      errors.description = descriptionRequiredError.message;
    } else if (description.length < 20) {
      errors.description = 'Description must contain at least 20 characters';
    }
    
    // Validate attachments
    if (attachments.length > 5) {
      errors.attachments = 'Maximum 5 attachments allowed';
    }
    
    // Check total attachment size
    const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 50 * 1024 * 1024; // 50MB
    
    if (totalSize > maxTotalSize) {
      errors.attachments = 'Total attachment size exceeds 50MB limit';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormError(null);
    
    // Check if feature is available
    if (!isFeatureAvailable) {
      setFormError(createError(
        ErrorType.CLIENT,
        'error',
        'Ticket submission is currently unavailable',
        'The ticket submission feature is temporarily unavailable due to system maintenance or connectivity issues.'
      ));
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionProgress(0);
    setSubmissionStage('Preparing ticket submission...');
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSubmissionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
        
        // Update stage based on progress
        if (submissionProgress < 30) {
          setSubmissionStage('Validating ticket information...');
        } else if (submissionProgress < 60) {
          setSubmissionStage('Processing attachments...');
        } else if (submissionProgress < 90) {
          setSubmissionStage('Submitting ticket to system...');
        }
      }, 500);
      
      // Submit ticket
      const ticket = await ticketService.createTicket({
        subject,
        description,
        urgency,
        affectedSystem,
        attachments
      });
      
      // Clear interval and set progress to 100%
      clearInterval(progressInterval);
      setSubmissionProgress(100);
      setSubmissionStage('Ticket submitted successfully!');
      
      // Show success dialog
      setSubmittedTicketId(ticket.id);
      setShowSuccessDialog(true);
      onSubmissionSuccess(ticket.id);
      
      // Reset form
      setSubject('');
      setDescription('');
      setUrgency('Medium');
      setAffectedSystem('SAP S/4HANA');
      setAttachments([]);
      
    } catch (error) {
      console.error('Error submitting ticket:', error);
      
      // Create error object
      setFormError(createError(
        ErrorType.SERVER,
        'error',
        'Failed to submit ticket',
        'There was an error processing your ticket submission. Please try again later.',
        'SUBMISSION_FAILED'
      ));
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry submission after error
  const handleRetry = () => {
    setFormError(null);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="ticket-submission-form">
      <Bar
        design="Header"
        className="form-header"
      >
        <SAPLogo />
        <Title level="H2">Submit Support Ticket</Title>
      </Bar>
      
      {!isFeatureAvailable && (
        <MessageStrip
          design="Critical"
          hideCloseButton={false}
          className="feature-unavailable-message"
        >
          Ticket submission is currently operating in limited mode due to system maintenance.
          You can still prepare your ticket, but submission may be delayed.
        </MessageStrip>
      )}
      
      {formError && (
        <FeedbackMessage
          message={formError.message}
          type="error"
          onClose={() => setFormError(null)}
        />
      )}
      
      <LoadingState 
        loading={isSubmitting} 
        text="Submitting Ticket"
        progress={submissionProgress}
        progressText={submissionStage}
      >
        <div className="ticket-form">
          <Title level="H3" className="form-title">Ticket Information</Title>
          <Form 
            onSubmit={handleSubmit}
          >
          <div className="form-group">
            <Label for="subject" required>Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue"
              required
              valueState={formErrors.subject ? 'Negative' : 'None'}
            />
            {formErrors.subject && <div className="error-message">{formErrors.subject}</div>}
          </div>
          
          <div className="form-group">
            <Label for="description" required>Description</Label>
            <TextArea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about the issue"
              rows={5}
              required
              valueState={formErrors.description ? 'Negative' : 'None'}
              className="description-textarea"
            />
            {formErrors.description && <div className="error-message">{formErrors.description}</div>}
          </div>
          
          <div className="form-group">
            <Label for="urgency">Urgency</Label>
            <Select
              id="urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.detail.selectedOption.textContent as UrgencyLevel)}
            >
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
              <Option value="Critical">Critical</Option>
            </Select>
          </div>
          
          <div className="form-group">
            <Label for="affectedSystem">Affected System</Label>
            <Select
              id="affectedSystem"
              value={affectedSystem}
              onChange={(e) => setAffectedSystem(e.detail.selectedOption.textContent as AffectedSystem)}
            >
              {affectedSystems.map((system) => (
                <Option key={system} value={system}>{system}</Option>
              ))}
            </Select>
          </div>
          
          <div className="form-group">
            <Label for="attachments">Attachments</Label>
            <FileUploader
              onFilesSelected={handleFileChange}
              onFileRemoved={handleFileRemove}
              selectedFiles={attachments}
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedFileTypes={['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.mp4', '.txt', '.log']}
            />
            {formErrors.attachments && (
              <MessageStrip
                design="Negative"
                hideCloseButton={true}
                className="attachment-error"
              >
                {formErrors.attachments}
              </MessageStrip>
            )}
          </div>
          
          <FlexBox direction={FlexBoxDirection.Row} justifyContent="End" className="form-actions">
            <Button design="Emphasized" type="Submit" disabled={!isFeatureAvailable}>
              Submit Ticket
            </Button>
          </FlexBox>
        </Form>
        </div>
      </LoadingState>
      
      {showSuccessDialog && (
        <MessageBox
          open
          type="Success"
          title="Ticket Submitted Successfully"
          actions={["OK"]}
          onClose={() => setShowSuccessDialog(false)}
        >
          Your ticket has been submitted successfully with ID: {submittedTicketId}
        </MessageBox>
      )}
    </div>
  );
};

export default TicketSubmissionForm;