import { Ticket, AIClassification, SkillType, Engineer, IssueThread } from '../../models/types';
import { mockEngineers } from '../../models/mockData/engineers';
import { aiProcessingService } from './aiProcessingService';
import { skillMapper } from './skillMapper';
import { threadDecomposer } from './threadDecomposer';

/**
 * AI Classification Service for simulating AI-based ticket classification and routing
 */
export const classificationService = {
  /**
   * Simulate AI classification of a ticket
   * @param ticket The ticket to classify
   * @param progressCallback Optional callback for progress updates
   * @returns Promise resolving to the classified ticket
   */
  classifyTicket: async (
    ticket: Ticket, 
    progressCallback?: (progress: number, stage: string) => void
  ): Promise<Ticket> => {
    // Use the AI processing service to classify the ticket
    return aiProcessingService.processTicket(ticket, progressCallback);
  },
  
  /**
   * Find the best lead engineer for a ticket based on skill dominance (70% rule)
   * @param ticket The classified ticket
   * @returns Promise resolving to the best matching lead engineer or null
   */
  findLeadEngineer: async (ticket: Ticket): Promise<Engineer | null> => {
    if (!ticket.aiClassification?.skillTags || ticket.aiClassification.skillTags.length === 0) {
      return Promise.resolve(null);
    }
    
    // Simulate processing delay
    return new Promise(resolve => {
      setTimeout(() => {
        // Use the skill mapper to find the best lead engineer
        const leadEngineer = skillMapper.findLeadEngineer(ticket);
        resolve(leadEngineer);
      }, 1500); // Simulate 1.5 second processing time
    });
  },
  
  /**
   * Decompose a ticket into issue threads
   * @param ticket The ticket to decompose
   * @param progressCallback Optional callback for progress updates
   * @returns Promise resolving to an array of issue threads
   */
  decomposeTicket: async (
    ticket: Ticket,
    progressCallback?: (progress: number, stage: string) => void
  ): Promise<IssueThread[]> => {
    return aiProcessingService.decomposeTicket(ticket, progressCallback);
  },
  
  /**
   * Find the best engineers for threads
   * @param threads The threads to assign
   * @param progressCallback Optional callback for progress updates
   * @returns Promise resolving to thread-engineer mappings
   */
  findEngineersForThreads: async (
    threads: IssueThread[],
    progressCallback?: (progress: number, stage: string) => void
  ): Promise<Array<{ thread: IssueThread; engineer: Engineer | null }>> => {
    return aiProcessingService.findEngineersForThreads(threads, progressCallback);
  },
  
  /**
   * Get visual feedback data for AI processing
   * @param ticket The ticket being processed
   * @returns Object with visual indicators for AI processing
   */
  getVisualFeedback: (ticket: Ticket): { 
    processingStages: string[];
    estimatedTime: number;
    complexityIndicator: number;
  } => {
    // Determine processing stages based on ticket content and complexity
    const hasAiClassification = !!ticket.aiClassification;
    const isComplex = hasAiClassification && ticket.aiClassification && 
      (ticket.aiClassification.complexityEstimate === 'High' || 
       ticket.aiClassification.recommendedAction === 'CRP');
    
    // Define processing stages
    const processingStages = [
      'Analyzing ticket content',
      'Calculating complexity score',
      'Identifying required skills',
      'Determining routing recommendation'
    ];
    
    // Add additional stages for complex tickets
    if (isComplex) {
      processingStages.push(
        'Finding optimal lead engineer',
        'Decomposing into skill-based threads',
        'Optimizing thread assignments'
      );
    }
    
    // Calculate estimated processing time based on complexity
    const baseTime = 3000; // 3 seconds base time
    const complexityFactor = hasAiClassification && ticket.aiClassification ? 
      (ticket.aiClassification.complexityEstimate === 'High' ? 2 : 
       ticket.aiClassification.complexityEstimate === 'Medium' ? 1.5 : 1) : 1;
    
    const estimatedTime = baseTime * complexityFactor;
    
    // Calculate complexity indicator (0-100)
    const complexityIndicator = hasAiClassification && ticket.aiClassification ? 
      (ticket.aiClassification.complexityEstimate === 'High' ? 85 + Math.random() * 15 : 
       ticket.aiClassification.complexityEstimate === 'Medium' ? 50 + Math.random() * 20 : 
       20 + Math.random() * 20) : 50;
    
    return {
      processingStages,
      estimatedTime,
      complexityIndicator: Math.round(complexityIndicator)
    };
  }
};