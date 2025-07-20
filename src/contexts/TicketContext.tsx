import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Engineer, IssueThread } from '../models/types';
import { ticketService } from '../services/api/ticketService';
import { classificationService } from '../services/ai/classificationService';
import { navigationService } from '../services/navigation/navigationService';

interface ProcessingState {
  ticketId: string | null;
  progress: number;
  stage: string;
  threads: IssueThread[];
  visualFeedback: {
    processingStages: string[];
    estimatedTime: number;
    complexityIndicator: number;
  } | null;
}

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  processing: ProcessingState;
  triggerCRP: (ticket: Ticket) => Promise<void>;
  routeToStandard: (ticket: Ticket) => Promise<void>;
  refreshTickets: () => Promise<void>;
  navigateToCRP: (ticketId: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

interface TicketProviderProps {
  children: ReactNode;
}

export const TicketProvider: React.FC<TicketProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<ProcessingState>({
    ticketId: null,
    progress: 0,
    stage: '',
    threads: [],
    visualFeedback: null
  });

  useEffect(() => {
    refreshTickets();
  }, []);

  const refreshTickets = async () => {
    setLoading(true);
    try {
      const allTickets = await ticketService.getAllTickets();
      // Filter for tickets that are in 'Submitted' or 'Classified' status
      const relevantTickets = allTickets.filter(
        ticket => ticket.status === 'Submitted' || ticket.status === 'Classified'
      );
      setTickets(relevantTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerCRP = async (ticket: Ticket) => {
    // Initialize processing state with visual feedback
    const visualFeedback = classificationService.getVisualFeedback(ticket);
    setProcessing({
      ticketId: ticket.id,
      progress: 0,
      stage: 'Initializing AI processing',
      threads: [],
      visualFeedback
    });
    
    // Update workflow state to classification stage
    navigationService.updateWorkflowStage('classification', ticket);
    
    try {
      // Step 1: Classify the ticket if not already classified
      let classifiedTicket = ticket;
      if (!ticket.aiClassification) {
        classifiedTicket = await classificationService.classifyTicket(
          ticket,
          (progress, stage) => {
            setProcessing(prev => ({
              ...prev,
              progress: Math.round(progress * 0.4), // First 40% of progress
              stage
            }));
          }
        );
      }
      
      // Step 2: Decompose the ticket into threads
      const threads = await classificationService.decomposeTicket(
        classifiedTicket,
        (progress, stage) => {
          setProcessing(prev => ({
            ...prev,
            progress: 40 + Math.round(progress * 0.3), // Next 30% of progress
            stage,
            threads: prev.threads // Keep existing threads during processing
          }));
        }
      );
      
      // Update processing state with threads
      setProcessing(prev => ({
        ...prev,
        threads,
        progress: 70, // At 70% progress after thread decomposition
        stage: 'Finding optimal lead engineer'
      }));
      
      // Step 3: Find the best lead engineer based on skill dominance
      const leadEngineer = await classificationService.findLeadEngineer(classifiedTicket);
      
      // Update processing state
      setProcessing(prev => ({
        ...prev,
        progress: 85, // At 85% progress after lead engineer assignment
        stage: 'Finalizing ticket processing'
      }));
      
      // Step 4: Update the ticket with lead engineer assignment, threads, and status
      await ticketService.updateTicket(ticket.id, {
        status: 'In Progress',
        assignedLeadId: leadEngineer?.id,
        threads
      });
      
      // Update processing state to completion
      setProcessing(prev => ({
        ...prev,
        progress: 100,
        stage: 'Processing complete'
      }));
      
      // Step 5: Remove the processed ticket from the list
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
      
      // Update workflow state to resolution stage
      navigationService.updateWorkflowStage('resolution', ticket);
      
      // Clear processing state after a short delay to show completion
      setTimeout(() => {
        setProcessing({
          ticketId: null,
          progress: 0,
          stage: '',
          threads: [],
          visualFeedback: null
        });
        
        // Navigate to CRP detail page
        navigate(`/crp/${ticket.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error processing ticket:', error);
      
      // Update processing state to show error
      setProcessing(prev => ({
        ...prev,
        progress: 100,
        stage: 'Error processing ticket'
      }));
      
      // Clear processing state after error display
      setTimeout(() => {
        setProcessing({
          ticketId: null,
          progress: 0,
          stage: '',
          threads: [],
          visualFeedback: null
        });
      }, 2000);
    }
  };

  const routeToStandard = async (ticket: Ticket) => {
    // Initialize processing state
    setProcessing({
      ticketId: ticket.id,
      progress: 0,
      stage: 'Routing to standard queue',
      threads: [],
      visualFeedback: null
    });
    
    // Simulate processing with progress updates
    const progressInterval = setInterval(() => {
      setProcessing(prev => ({
        ...prev,
        progress: Math.min(100, prev.progress + 10),
        stage: prev.progress < 50 
          ? 'Analyzing ticket requirements' 
          : 'Assigning to standard queue'
      }));
    }, 100); // Update progress every 100ms for standard routing (faster)
    
    try {
      // Update the ticket status
      await ticketService.updateTicket(ticket.id, {
        status: 'In Progress'
      });
      
      // Remove the processed ticket from the list
      setTickets(prev => prev.filter(t => t.id !== ticket.id));
    } catch (error) {
      console.error('Error routing ticket:', error);
    } finally {
      clearInterval(progressInterval);
      
      // Ensure progress is complete
      setProcessing(prev => ({
        ...prev,
        progress: 100,
        stage: 'Routing complete'
      }));
      
      // Clear processing state after a short delay to show completion
      setTimeout(() => {
        setProcessing({
          ticketId: null,
          progress: 0,
          stage: '',
          threads: [],
          visualFeedback: null
        });
      }, 1000);
    }
  };

  const navigateToCRP = (ticketId: string) => {
    // Navigate to the CRP detail page for the specified ticket
    navigate(`/crp/${ticketId}`);
  };

  const value = {
    tickets,
    loading,
    processing,
    triggerCRP,
    routeToStandard,
    refreshTickets,
    navigateToCRP
  };

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
};

export const useTickets = (): TicketContextType => {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};