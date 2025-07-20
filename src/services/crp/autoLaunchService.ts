import { Ticket, IssueThread, Engineer } from '../../models/types';
import { classificationService } from '../ai/classificationService';
import { skillMapper } from '../ai/skillMapper';
import { threadDecomposer } from '../ai/threadDecomposer';

/**
 * CRP Auto-Launch Service
 * Automatically launches CRP for tickets that meet the complexity threshold
 */
export interface CRPLaunchResult {
  shouldLaunch: boolean;
  reason: string;
  leadEngineer: Engineer | null;
  threads: IssueThread[];
  launchStages: string[];
  estimatedTime: number;
}

export const autoLaunchService = {
  /**
   * Evaluate if a ticket should auto-launch CRP
   * @param ticket The classified ticket to evaluate
   * @returns Promise resolving to CRP launch decision and data
   */
  evaluateForCRPLaunch: async (ticket: Ticket): Promise<CRPLaunchResult> => {
    // Default result
    const result: CRPLaunchResult = {
      shouldLaunch: false,
      reason: '',
      leadEngineer: null,
      threads: [],
      launchStages: [],
      estimatedTime: 0
    };

    // Check if ticket has AI classification
    if (!ticket.aiClassification) {
      result.reason = 'Ticket not yet classified by AI';
      return result;
    }

    // CRP Launch Criteria
    const shouldLaunch = 
      // High complexity tickets
      ticket.aiClassification.complexityEstimate === 'High' ||
      // AI explicitly recommends CRP
      ticket.aiClassification.recommendedAction === 'CRP' ||
      // Multiple skill domains (3 or more)
      ticket.aiClassification.skillTags.length >= 3 ||
      // High urgency with medium+ complexity
      (ticket.urgency === 'Critical' && ticket.aiClassification.complexityEstimate !== 'Low');

    if (!shouldLaunch) {
      result.reason = 'Ticket does not meet CRP launch criteria';
      return result;
    }

    // Ticket qualifies for CRP - proceed with launch
    result.shouldLaunch = true;
    result.reason = getCRPLaunchReason(ticket);
    result.launchStages = getCRPLaunchStages();
    result.estimatedTime = calculateLaunchTime(ticket);

    return result;
  },

  /**
   * Execute the CRP launch process with progress tracking
   * @param ticket The ticket to launch CRP for
   * @param progressCallback Callback for progress updates
   * @returns Promise resolving to the complete CRP launch result
   */
  executeCRPLaunch: async (
    ticket: Ticket,
    progressCallback?: (progress: number, stage: string) => void
  ): Promise<CRPLaunchResult> => {
    const result = await autoLaunchService.evaluateForCRPLaunch(ticket);
    
    if (!result.shouldLaunch) {
      return result;
    }

    const stages = result.launchStages;
    const stageTime = result.estimatedTime / stages.length;

    try {
      // Stage 1: Find Lead Engineer
      if (progressCallback) progressCallback(15, stages[0]);
      await new Promise(resolve => setTimeout(resolve, stageTime * 0.3));
      
      result.leadEngineer = await classificationService.findLeadEngineer(ticket);
      
      // Stage 2: Analyze Complexity
      if (progressCallback) progressCallback(30, stages[1]);
      await new Promise(resolve => setTimeout(resolve, stageTime * 0.2));
      
      // Stage 3: Decompose into Threads
      if (progressCallback) progressCallback(50, stages[2]);
      await new Promise(resolve => setTimeout(resolve, stageTime * 0.3));
      
      result.threads = await classificationService.decomposeTicket(ticket);
      
      // Stage 4: Assign Thread Engineers
      if (progressCallback) progressCallback(75, stages[3]);
      await new Promise(resolve => setTimeout(resolve, stageTime * 0.2));
      
      // Find engineers for each thread
      const threadAssignments = await Promise.all(
        result.threads.map(async (thread) => {
          const engineer = skillMapper.findBestEngineerForThread(thread);
          return { thread, engineer };
        })
      );

      // Update threads with assigned engineers
      result.threads = threadAssignments.map(({ thread, engineer }) => ({
        ...thread,
        assignedEngineerId: engineer?.id || null
      }));
      
      // Stage 5: Initialize Collaboration
      if (progressCallback) progressCallback(90, stages[4]);
      await new Promise(resolve => setTimeout(resolve, stageTime * 0.1));
      
      // Stage 6: CRP Ready
      if (progressCallback) progressCallback(100, stages[5]);
      await new Promise(resolve => setTimeout(resolve, stageTime * 0.1));

    } catch (error) {
      console.error('Error during CRP launch:', error);
      result.reason = 'CRP launch failed due to system error';
      result.shouldLaunch = false;
    }

    return result;
  },

  /**
   * Get the CRP threshold configuration
   * @returns Object with threshold settings
   */
  getCRPThresholds: () => ({
    complexityThreshold: 'Medium', // Minimum complexity for auto-launch
    skillCountThreshold: 3, // Minimum number of skills required
    urgencyOverride: ['Critical'], // Urgency levels that override other criteria
    confidenceThreshold: 70 // Minimum AI confidence score
  })
};

/**
 * Get the reason why CRP was launched for a ticket
 */
function getCRPLaunchReason(ticket: Ticket): string {
  const classification = ticket.aiClassification!;
  
  if (classification.complexityEstimate === 'High') {
    return `High complexity ticket requiring specialized expertise across ${classification.skillTags.length} skill domains`;
  }
  
  if (classification.recommendedAction === 'CRP') {
    return 'AI analysis recommends collaborative resolution approach';
  }
  
  if (classification.skillTags.length >= 3) {
    return `Multi-domain issue spanning ${classification.skillTags.length} technical areas: ${classification.skillTags.join(', ')}`;
  }
  
  if (ticket.urgency === 'Critical') {
    return 'Critical priority ticket requiring immediate collaborative response';
  }
  
  return 'Ticket meets CRP launch criteria for optimal resolution';
}

/**
 * Get the stages of CRP launch process
 */
function getCRPLaunchStages(): string[] {
  return [
    'Identifying optimal lead engineer based on experience',
    'Analyzing ticket complexity and skill requirements',
    'Decomposing ticket into specialized threads',
    'Matching threads with available expert engineers',
    'Initializing real-time collaboration channels',
    'CRP environment ready for collaborative resolution'
  ];
}

/**
 * Calculate estimated time for CRP launch based on ticket complexity
 */
function calculateLaunchTime(ticket: Ticket): number {
  const baseTime = 4000; // 4 seconds base time
  const classification = ticket.aiClassification!;
  
  let multiplier = 1;
  
  // Complexity factor
  if (classification.complexityEstimate === 'High') multiplier += 0.5;
  if (classification.complexityEstimate === 'Medium') multiplier += 0.2;
  
  // Skill count factor
  if (classification.skillTags.length >= 4) multiplier += 0.3;
  if (classification.skillTags.length >= 6) multiplier += 0.2;
  
  // Urgency factor (critical tickets get faster processing)
  if (ticket.urgency === 'Critical') multiplier -= 0.2;
  
  return Math.round(baseTime * Math.max(0.8, multiplier));
}