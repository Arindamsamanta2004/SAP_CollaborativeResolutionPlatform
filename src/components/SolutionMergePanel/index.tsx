import React, { useState, useEffect } from 'react';
import {
    Card,
    Title,
    Text,
    Button,
    Icon,
    ProgressIndicator,
    List,

    Dialog,
    Bar,
    TextArea,
    MessageStrip,
    FlexBox,
    FlexBoxDirection,
    FlexBoxJustifyContent,
    FlexBoxAlignItems
} from '@ui5/webcomponents-react';
import { Ticket, IssueThread, ThreadStatus } from '../../models/types';
import { updateThreadStatus } from '../../models/mockData/threads';
import { ticketService } from '../../services/api/ticketService';
import './styles.css';

interface SolutionMergePanelProps {
    ticket: Ticket;
    threads: IssueThread[];
    onResolutionComplete: () => void;
}

const SolutionMergePanel: React.FC<SolutionMergePanelProps> = ({
    ticket,
    threads,
    onResolutionComplete
}) => {
    const [showMergeDialog, setShowMergeDialog] = useState<boolean>(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
    const [mergedSolution, setMergedSolution] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate completion percentage
    const calculateCompletionPercentage = (): number => {
        if (threads.length === 0) return 0;
        const resolvedThreads = threads.filter(thread => thread.status === 'Resolved');
        return Math.round((resolvedThreads.length / threads.length) * 100);
    };

    // Check if all threads are resolved
    const areAllThreadsResolved = (): boolean => {
        return threads.length > 0 && threads.every(thread => thread.status === 'Resolved');
    };

    // Generate initial merged solution from resolved threads
    const generateInitialMergedSolution = (): string => {
        const resolvedThreads = threads.filter(thread => thread.status === 'Resolved');

        if (resolvedThreads.length === 0) return '';

        let solution = `# Comprehensive Solution for Ticket ${ticket.id}\n\n`;
        solution += `## Summary\n${ticket.subject}\n\n`;
        solution += `## Root Causes Identified\n\n`;

        resolvedThreads.forEach((thread, index) => {
            solution += `### ${index + 1}. ${thread.title}\n`;
            solution += `${thread.solution || 'No detailed solution provided.'}\n\n`;
        });

        solution += `## Resolution Steps\n\n`;
        solution += `1. [Add resolution steps here]\n`;
        solution += `2. [Add verification steps here]\n`;
        solution += `3. [Add prevention measures here]\n\n`;

        solution += `## Additional Notes\n\n`;
        solution += `[Add any additional information here]\n`;

        return solution;
    };

    // Handle opening the merge dialog
    const handleOpenMergeDialog = () => {
        setMergedSolution(generateInitialMergedSolution());
        setShowMergeDialog(true);
    };

    // Handle saving the merged solution
    const handleSaveMergedSolution = () => {
        setShowMergeDialog(false);
        setShowConfirmationDialog(true);
    };

    // Handle confirming the resolution
    const handleConfirmResolution = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Update the ticket status to Resolved with the merged solution
            await ticketService.completeTicketResolution(ticket.id, mergedSolution);

            // Set completion state
            setIsComplete(true);
            setShowConfirmationDialog(false);

            // Notify parent component
            onResolutionComplete();

            // Don't auto-reload the page - let the user control the workflow
        } catch (error) {
            console.error('Error completing resolution:', error);
            setError('Failed to complete the resolution process. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get status color for thread
    const getStatusColor = (status: ThreadStatus): string => {
        switch (status) {
            case 'Resolved': return 'Success';
            case 'In Progress': return 'Warning';
            case 'Open': return 'Information';
            default: return 'None';
        }
    };

    // Get status icon for thread
    const getStatusIcon = (status: ThreadStatus): string => {
        switch (status) {
            case 'Resolved': return 'complete';
            case 'In Progress': return 'in-progress';
            case 'Open': return 'circle-task';
            default: return 'circle-task';
        }
    };

    return (
        <Card className="solution-merge-panel">
            <div className="solution-merge-header">
                <Title level="H2">Solution Merge & Resolution</Title>
                <div className="solution-merge-status">
                    <Icon name="combine" />
                    <Text>{calculateCompletionPercentage()}% Complete</Text>
                </div>
            </div>

            <Text>Track thread completion and merge solutions into a final resolution.</Text>

            <div className="solution-merge-progress">
                <ProgressIndicator
                    value={calculateCompletionPercentage()}
                    valueState={areAllThreadsResolved() ? 'Positive' : 'Information'}
                    displayValue={`${calculateCompletionPercentage()}%`}
                />
            </div>

            <div className="solution-merge-threads">
                <Title level="H3">Thread Status</Title>
                <List>
                    {threads.map(thread => (
                        <li key={thread.id} className="ui5-list-item">
                            <div className="thread-status-item">
                                <Icon name={getStatusIcon(thread.status)} />
                                <div className="thread-status-content">
                                    <span className="ui5-list-item-title">{thread.title}</span>
                                    <span className="ui5-list-item-description">Required Skills: {thread.requiredSkills.join(', ')}</span>
                                </div>
                                <div className={`thread-status-badge status-${thread.status.toLowerCase().replace(' ', '-')}`}>
                                    {thread.status}
                                </div>
                            </div>
                        </li>
                    ))}
                </List>
            </div>

            {areAllThreadsResolved() ? (
                <div className="solution-merge-actions">
                    <Button
                        design="Emphasized"
                        icon="combine"
                        onClick={handleOpenMergeDialog}
                    >
                        Merge Solutions
                    </Button>
                </div>
            ) : (
                <MessageStrip
                    design="Information"
                    hideCloseButton
                >
                    All threads must be resolved before solutions can be merged.
                </MessageStrip>
            )}

            {/* Merge Dialog */}
            <Dialog
                open={showMergeDialog}
                onClose={() => setShowMergeDialog(false)}
                className="solution-merge-dialog"
                headerText="Merge Thread Solutions"
            >
                <Bar
                    design="Header"
                    endContent={
                        <Button
                            design="Transparent"
                            icon="refresh"
                            onClick={() => setMergedSolution(generateInitialMergedSolution())}
                            tooltip="Reset to generated solution"
                        />
                    }
                />

                <div className="solution-merge-dialog-content">
                    <Text>Review and edit the combined solution from all resolved threads:</Text>

                    <div className="solution-merge-content">
                        <TextArea
                            className="solution-merge-textarea"
                            value={mergedSolution}
                            onChange={(e) => setMergedSolution(e.target.value)}
                            rows={15}
                            growing={false}
                        />
                    </div>
                </div>

                <div className="solution-merge-dialog-actions">
                    <Button
                        design="Transparent"
                        onClick={() => setShowMergeDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        design="Emphasized"
                        icon="accept"
                        onClick={handleSaveMergedSolution}
                    >
                        Save & Continue
                    </Button>
                </div>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmationDialog}
                onClose={() => setShowConfirmationDialog(false)}
                className="solution-merge-dialog"
                headerText="Confirm Resolution"
            >
                <div className="solution-merge-dialog-content">
                    <MessageStrip
                        design="Positive"
                        hideCloseButton
                    >
                        All threads have been resolved successfully!
                    </MessageStrip>

                    <div className="solution-merge-summary">
                        <Title level="H3">Resolution Summary</Title>
                        <Text>Ticket: {ticket.subject}</Text>
                        <Text>Threads Resolved: {threads.length}</Text>
                        <Text>Engineers Involved: {new Set(threads.map(t => t.assignedEngineerId).filter(Boolean)).size}</Text>
                    </div>

                    <div className="solution-merge-content">
                        <Title level="H4">Final Solution</Title>
                        <div style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto', padding: '0.5rem', border: '1px solid #e5e5e5', borderRadius: '0.25rem' }}>
                            {mergedSolution}
                        </div>
                    </div>

                    {error && (
                        <MessageStrip
                            design="Negative"
                            hideCloseButton={false}
                            onClose={() => setError(null)}
                        >
                            {error}
                        </MessageStrip>
                    )}
                </div>

                <div className="solution-merge-dialog-actions">
                    <Button
                        design="Transparent"
                        onClick={() => setShowConfirmationDialog(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        design="Emphasized"
                        icon="complete"
                        onClick={handleConfirmResolution}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Complete Resolution'}
                    </Button>
                </div>
            </Dialog>

            {/* Completion Message */}
            {isComplete && (
                <div className="solution-merge-confirmation">
                    <Icon name="complete" className="solution-merge-confirmation-icon" />
                    <div>
                        <Title level="H3">Resolution Complete</Title>
                        <Text>The ticket has been successfully resolved and closed.</Text>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default SolutionMergePanel;