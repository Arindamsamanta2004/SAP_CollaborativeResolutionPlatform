import { Ticket, IssueThread, Engineer } from '../../models/types';
import { complexityAnalyzer } from './complexityAnalyzer';
import { threadDecomposer } from './threadDecomposer';
import { skillMapper } from './skillMapper';

/**
 * AI Processing Service
 * Coordinates the AI processing workflow for tickets
 */
export const aiProcessingService = {
  /**
   * Process a ticket through the AI engine
   * @param ticket The ticket to process
   * @param progressCallback Optional callback for progress updates
   * @returns Promise resolving to the processed ticket with AI classification
   */
  processTicket: async (
    ticket: Ticket, 
    progressCallback?: (progress: number, stage: string) => void
  ): Promise<Ticket> => {
    // Stage 1: Initial classification (25% of progress)
    if (progressCallback) progressCallback(0, 'Starting AI analysis');
    
    // Simulate AI processing delay
    await simulateProcessingDelay(500);
    
    // Analyze complexity
    const { score: complexityScore, estimate: complexityEstimate } = 
      complexityAnalyzer.analyzeComplexity(ticket);
    
    if (progressCallback) progressCallback(10, 'Analyzing complexity');
    await simulateProcessingDelay(700);
    
    // Identify required skills
    const skillScores = complexityAnalyzer.identifyRequiredSkills(ticket);
    const skillTags = skillScores.map(item => item.skill);
    
    if (progressCallback) progressCallback(20, 'Identifying required skills');
    await simulateProcessingDelay(600);
    
    // Determine recommended action
    const recommendedAction = complexityAnalyzer.shouldRouteToCRP(ticket) ? 'CRP' : 'Standard';
    
    if (progressCallback) progressCallback(25, 'Determining routing recommendation');
    await simulateProcessingDelay(500);
    
    // Create AI classification
    const aiClassification = {
      urgencyScore: calculateUrgencyScore(ticket),
      complexityEstimate,
      skillTags,
      recommendedAction: recommendedAction as 'CRP' | 'Standard',
      confidenceScore: calculateConfidenceScore(complexityScore, skillScores)
    };
    
    // Update ticket with AI classification
    const classifiedTicket: Ticket = {
      ...ticket,
      aiClassification,
      status: 'Classified'
    };
    
    // Stage 2: Lead engineer assignment (50% of progress)
    if (progressCallback) progressCallback(30, 'Finding optimal lead engineer');
    await simulateProcessingDelay(800);
    
    // Find lead engineer
    const leadEngineer = skillMapper.findLeadEngineer(classifiedTicket);
    
    if (progressCallback) progressCallback(50, 'Assigning lead engineer');
    await simulateProcessingDelay(700);
    
    // Update ticket with lead engineer if found
    const ticketWithLead: Ticket = leadEngineer ? {
      ...classifiedTicket,
      assignedLeadId: leadEngineer.id
    } : classifiedTicket;
    
    // Stage 3: Thread decomposition (if CRP recommended) (100% of progress)
    if (recommendedAction === 'CRP') {
      if (progressCallback) progressCallback(60, 'Decomposing ticket into threads');
      await simulateProcessingDelay(1000);
      
      // Decompose ticket into threads
      const threads = threadDecomposer.decomposeTicket(ticketWithLead);
      
      if (progressCallback) progressCallback(80, 'Optimizing thread assignments');
      await simulateProcessingDelay(800);
      
      // Update ticket with threads
      const ticketWithThreads: Ticket = {
        ...ticketWithLead,
        threads
      };
      
      if (progressCallback) progressCallback(100, 'AI processing complete');
      return ticketWithThreads;
    }
    
    if (progressCallback) progressCallback(100, 'AI processing complete');
    return ticketWithLead;
  },
  
  /**
   * Decompose a ticket into threads
   * @param ticket The ticket to decompose
   * @param progressCallback Optional callback for progress updates
   * @returns Promise resolving to an array of issue threads
   */
  decomposeTicket: async (
    ticket: Ticket,
    progressCallback?: (progress: number, stage: string) => void
  ): Promise<IssueThread[]> => {
    if (progressCallback) progressCallback(0, 'Starting thread decomposition');
    await simulateProcessingDelay(500);
    
    if (progressCallback) progressCallback(30, 'Analyzing ticket complexity');
    await simulateProcessingDelay(700);
    
    if (progressCallback) progressCallback(60, 'Identifying thread boundaries');
    await simulateProcessingDelay(800);
    
    // Decompose ticket into threads
    const threads = threadDecomposer.decomposeTicket(ticket);
    
    if (progressCallback) progressCallback(90, 'Finalizing thread creation');
    await simulateProcessingDelay(500);
    
    if (progressCallback) progressCallback(100, 'Thread decomposition complete');
    return threads;
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
    if (progressCallback) progressCallback(0, 'Starting engineer matching');
    
    const results: Array<{ thread: IssueThread; engineer: Engineer | null }> = [];
    
    // Process each thread
    for (let i = 0; i < threads.length; i++) {
      const thread = threads[i];
      const progressPercent = Math.round((i / threads.length) * 80);
      
      if (progressCallback) {
        progressCallback(
          progressPercent, 
          `Matching engineers for thread ${i + 1} of ${threads.length}`
        );
      }
      
      await simulateProcessingDelay(400);
      
      // Find best engineer for thread
      const engineer = skillMapper.findBestEngineerForThread(thread);
      
      results.push({ thread, engineer });
    }
    
    if (progressCallback) progressCallback(90, 'Optimizing assignments');
    await simulateProcessingDelay(600);
    
    if (progressCallback) progressCallback(100, 'Engineer matching complete');
    return results;
  }
};

/**
 * Simulate processing delay
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
const simulateProcessingDelay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate urgency score based on ticket urgency
 * @param ticket The ticket to evaluate
 * @returns Urgency score (0-100)
 */
const calculateUrgencyScore = (ticket: Ticket): number => {
  // Base score from urgency level
  let urgencyScore = 0;
  switch (ticket.urgency) {
    case 'Critical':
      urgencyScore = 80 + Math.floor(Math.random() * 20); // 80-100
      break;
    case 'High':
      urgencyScore = 60 + Math.floor(Math.random() * 20); // 60-80
      break;
    case 'Medium':
      urgencyScore = 40 + Math.floor(Math.random() * 20); // 40-60
      break;
    case 'Low':
      urgencyScore = 20 + Math.floor(Math.random() * 20); // 20-40
      break;
  }
  
  return urgencyScore;
};

/**
 * Calculate confidence score for AI classification
 * @param complexityScore Complexity score
 * @param skillScores Skill confidence scores
 * @returns Confidence score (0-100)
 */
const calculateConfidenceScore = (
  complexityScore: number,
  skillScores: Array<{ skill: string; confidence: number }>
): number => {
  // Average skill confidence
  const avgSkillConfidence = skillScores.length > 0
    ? skillScores.reduce((sum, item) => sum + item.confidence, 0) / skillScores.length
    : 50;
  
  // Higher complexity often means lower confidence
  const complexityFactor = Math.max(0, 100 - complexityScore) / 100;
  
  // Calculate weighted confidence score
  const confidenceScore = (avgSkillConfidence * 0.7) + (complexityFactor * 100 * 0.3);
  
  // Add some randomness but ensure minimum confidence of 60%
  return Math.max(60, Math.min(95, Math.round(confidenceScore) + (Math.random() * 5 - 2.5)));
};