import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FlexBox,
    FlexBoxDirection,
    FlexBoxAlignItems,
    FlexBoxJustifyContent,
    Title,
    Text,
    Card,
    CardHeader,
    Dialog,
    Button,
    BusyIndicator,
    Panel
} from '@ui5/webcomponents-react';
import { UrgencyLevel, AffectedSystem } from '../../models/types';
import { ticketService } from '../../services/api/ticketService';
import { systemStatusService } from '../../services/system/systemStatusService';
import ErrorSimulator from '../../components/ErrorSimulator';
import ThreadDecompositionExamples from '../../components/ThreadDecompositionExamples';
import SystemStatusBanner from '../../components/SystemStatusBanner';
import LoadingState from '../../components/LoadingState';
import FeedbackMessage from '../../components/FeedbackMessage';
import './styles.css';

const CustomerPortal: React.FC = () => {
    const navigate = useNavigate();

    // Form state
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState<UrgencyLevel>('Medium');
    const [affectedSystem, setAffectedSystem] = useState<AffectedSystem>('SAP S/4HANA');
    const [attachments, setAttachments] = useState<File[]>([]);

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [submittedTicketId, setSubmittedTicketId] = useState('');
    const [formErrors, setFormErrors] = useState<{
        subject?: string;
        description?: string;
    }>({});

    // Handle file uploads
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };

    // Validate the form
    const validateForm = (): boolean => {
        const errors: { subject?: string; description?: string } = {};

        if (!subject.trim()) {
            errors.subject = 'Subject is required';
        }

        if (!description.trim()) {
            errors.description = 'Description is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const ticket = await ticketService.createTicket({
                subject,
                description,
                urgency,
                affectedSystem,
                attachments
            });

            setSubmittedTicketId(ticket.id);
            setShowSuccessDialog(true);

            // Reset form
            setSubject('');
            setDescription('');
            setUrgency('Medium');
            setAffectedSystem('SAP S/4HANA');
            setAttachments([]);

            // Update workflow state to submission stage
            // Note: Navigation service integration would be implemented here in a real application
            console.log('Ticket submitted successfully:', ticket);

            // Navigate to dashboard after a delay
            setTimeout(() => {
                navigate('/lead-dashboard');
            }, 3000);

        } catch (error) {
            console.error('Error submitting ticket:', error);
            // In a real app, we would show an error message
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle scenario selection
    const handleScenarioSelected = (scenarioId: string) => {
        console.log(`Demo scenario selected: ${scenarioId}`);
        // Additional handling could be added here
    };
    
    // Handle error simulation
    const handleErrorSimulated = (errorType: string) => {
        console.log(`Error simulated: ${errorType}`);
        // Additional handling could be added here
    };
    
    // Handle retry connection
    const handleRetryConnection = () => {
        // Reset system status
        systemStatusService.updateStatus({
            networkConnected: true,
            serverAvailable: true,
            features: {
                ticketSubmission: true,
                ticketClassification: true,
                threadDecomposition: true,
                engineerAssignment: true,
                fileUpload: true,
                realTimeUpdates: true
            }
        });
    };
    
    // Check if feature is available
    const isFeatureAvailable = systemStatusService.isFeatureAvailable('ticketSubmission');
    
    return (
        <div className="customer-portal">
            <SystemStatusBanner onRetry={handleRetryConnection} />
            
            <FlexBox
                direction={FlexBoxDirection.Column}
                alignItems={FlexBoxAlignItems.Center}
                justifyContent={FlexBoxJustifyContent.Center}
                className="customer-portal-container"
            >
                <div className="customer-portal-header">
                    <Title level="H1">SAP Customer Support Portal</Title>
                    <Text>Submit a new support ticket for your SAP system</Text>
                    
                    <div className="demo-tools">
                        <FlexBox
                            direction={FlexBoxDirection.Row}
                            alignItems={FlexBoxAlignItems.Center}
                            justifyContent={FlexBoxJustifyContent.End}
                            className="demo-tools-container"
                        >
                            <ErrorSimulator onErrorSimulated={handleErrorSimulated} />
                            <ThreadDecompositionExamples onScenarioSelected={handleScenarioSelected} />
                        </FlexBox>
                    </div>
                </div>

                <div className="customer-portal-content">
                    <Card
                        header={
                            <CardHeader
                                titleText="Submit a Support Ticket"
                                subtitleText="Please provide details about your issue"
                                interactive={false}
                            />
                        }
                    >
                        <div className="card-content">
                            {!isFeatureAvailable && (
                                <FeedbackMessage
                                    message="Ticket submission is currently operating in limited mode due to system maintenance. You can still prepare your ticket, but submission may be delayed."
                                    type="warning"
                                />
                            )}
                            
                            {isSubmitting ? (
                                <LoadingState 
                                    loading={true} 
                                    text="Processing Ticket Submission"
                                    progress={50}
                                    progressText="Validating and submitting ticket data..."
                                >
                                    <div className="submission-loading">
                                        <BusyIndicator active size="L" />
                                        <Text>Processing your ticket submission...</Text>
                                    </div>
                                </LoadingState>
                            ) : (
                                <form className="ticket-form" onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="subject">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            className={`form-control ${formErrors.subject ? 'error' : ''}`}
                                            placeholder="Brief summary of the issue"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                        />
                                        {formErrors.subject && <div className="error-message">{formErrors.subject}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            className={`form-control ${formErrors.description ? 'error' : ''}`}
                                            rows={5}
                                            placeholder="Please provide detailed information about the issue"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                        ></textarea>
                                        {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="urgency">Urgency</label>
                                        <select
                                            id="urgency"
                                            className="form-control"
                                            value={urgency}
                                            onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="system">Affected System</label>
                                        <select
                                            id="system"
                                            className="form-control"
                                            value={affectedSystem}
                                            onChange={(e) => setAffectedSystem(e.target.value as AffectedSystem)}
                                        >
                                            <option value="SAP ERP">SAP ERP</option>
                                            <option value="SAP S/4HANA">SAP S/4HANA</option>
                                            <option value="SAP SuccessFactors">SAP SuccessFactors</option>
                                            <option value="SAP Ariba">SAP Ariba</option>
                                            <option value="SAP Concur">SAP Concur</option>
                                            <option value="SAP Fieldglass">SAP Fieldglass</option>
                                            <option value="SAP Customer Experience">SAP Customer Experience</option>
                                            <option value="SAP Business Technology Platform">SAP Business Technology Platform</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="attachments">Attachments</label>
                                        <input
                                            type="file"
                                            id="attachments"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            multiple
                                            accept=".png,.jpg,.jpeg,.gif,.pdf,.mp4,.txt,.log"
                                            disabled={!systemStatusService.isFeatureAvailable('fileUpload')}
                                        />
                                        <small className="form-text text-muted">
                                            Accepted file types: .png, .jpg, .jpeg, .gif, .pdf, .mp4, .txt, .log
                                        </small>
                                        {!systemStatusService.isFeatureAvailable('fileUpload') && (
                                            <div className="feature-unavailable-message">
                                                File upload is currently unavailable due to system maintenance.
                                            </div>
                                        )}
                                        {attachments.length > 0 && (
                                            <div className="attachments-list">
                                                <p>Selected files:</p>
                                                <ul>
                                                    {attachments.map((file, index) => (
                                                        <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button 
                                            type="submit" 
                                            className="submit-button"
                                            disabled={!isFeatureAvailable}
                                        >
                                            Submit Ticket
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="customer-portal-footer">
                    <Text>Need help? Contact your SAP administrator for assistance with complex issues.</Text>
                </div>
                
                <Panel
                    headerText="Demo Information"
                    collapsed={true}
                    className="demo-info-panel"
                >
                    <div className="demo-info-content">
                        <Text>This demo showcases the SAP CRP (Collaborative Resolution Platform) with pre-defined scenarios and error handling capabilities.</Text>
                        <Text>Use the controls above to simulate system errors or load different ticket scenarios to demonstrate graceful degradation and error handling.</Text>
                        <ul className="demo-features-list">
                            <li>Error Simulator: Test how the application handles various error conditions</li>
                            <li>Thread Decomposition Examples: View examples of how complex tickets are broken down into skill-based threads</li>
                            <li>System Status Banner: Shows the current system status and allows for recovery from simulated errors</li>
                        </ul>
                    </div>
                </Panel>
            </FlexBox>

            {showSuccessDialog && (
                <Dialog
                    headerText="Ticket Submitted Successfully"
                    open={showSuccessDialog}
                    onClose={() => setShowSuccessDialog(false)}
                >
                    <div className="success-dialog-content">
                        <Text>Your ticket has been submitted successfully with ID: {submittedTicketId}</Text>
                        <Text>Our support team will review your ticket and respond shortly.</Text>
                    </div>
                    <div slot="footer" className="dialog-footer">
                        <Button onClick={() => setShowSuccessDialog(false)}>Close</Button>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default CustomerPortal;