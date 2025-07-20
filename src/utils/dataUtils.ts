import { Ticket, IssueThread, Engineer, SkillType, ThreadStatus } from '../models/types';
import { mockTickets } from '../models/mockData/tickets';
import { mockThreads } from '../models/mockData/threads';
import { mockEngineers } from '../models/mockData/engineers';

/**
 * Utility functions for data manipulation and filtering
 */

/**
 * Find the best engineer for a thread based on required skills and availability
 * @param thread The issue thread
 * @returns The best matching engineer or null if none found
 */
export const findBestEngineerForThread = (thread: IssueThread): Engineer | null => {
  // Get available engineers
  const availableEngineers = mockEngineers.filter(
    engineer => engineer.availability === 'Available'
  );
  
  if (availableEngineers.length === 0) return null;
  
  // Calculate match score for each engineer based on required skills
  const engineersWithScores = availableEngineers.map(engineer => {
    let matchScore = 0;
    let skillsMatched = 0;
    
    thread.requiredSkills.forEach(skill => {
      const expertiseLevel = engineer.expertise[skill] || 0;
      if (expertiseLevel > 0) {
        matchScore += expertiseLevel;
        skillsMatched++;
      }
    });
    
    // Normalize score based on number of skills matched
    const normalizedScore = thread.requiredSkills.length > 0 
      ? (matchScore / thread.requiredSkills.length) * (skillsMatched / thread.requiredSkills.length)
      : 0;
    
    return {
      engineer,
      matchScore: normalizedScore
    };
  });
  
  // Sort by match score (descending)
  engineersWithScores.sort((a, b) => b.matchScore - a.matchScore);
  
  // Return the best match or null if no good match found
  return engineersWithScores.length > 0 && engineersWithScores[0].matchScore > 0
    ? engineersWithScores[0].engineer
    : null;
};

/**
 * Find the best lead engineer for a ticket based on skill dominance (70% rule)
 * @param ticket The ticket
 * @returns The best matching lead engineer or null if none found
 */
export const findLeadEngineerForTicket = (ticket: Ticket): Engineer | null => {
  if (!ticket.aiClassification?.skillTags || ticket.aiClassification.skillTags.length === 0) {
    return null;
  }
  
  // Get lead engineers who are available
  const availableLeads = mockEngineers.filter(
    engineer => engineer.isLeadEngineer && engineer.availability === 'Available'
  );
  
  if (availableLeads.length === 0) return null;
  
  // Calculate dominance score for each lead engineer
  const leadsWithScores = availableLeads.map(lead => {
    let dominanceScore = 0;
    let primarySkill: SkillType | null = null;
    let highestExpertise = 0;
    
    // Find the lead's primary skill among the required skills
    ticket.aiClassification!.skillTags.forEach(skill => {
      const expertiseLevel = lead.expertise[skill] || 0;
      if (expertiseLevel > highestExpertise) {
        highestExpertise = expertiseLevel;
        primarySkill = skill;
      }
    });
    
    // Calculate dominance percentage (primary skill expertise vs. total expertise)
    if (primarySkill) {
      const totalExpertise = ticket.aiClassification!.skillTags.reduce(
        (sum, skill) => sum + (lead.expertise[skill] || 0), 
        0
      );
      
      dominanceScore = totalExpertise > 0 
        ? (lead.expertise[primarySkill] || 0) / totalExpertise 
        : 0;
    }
    
    return {
      lead,
      dominanceScore,
      primarySkill
    };
  });
  
  // Filter leads with at least 70% dominance in one skill
  const qualifiedLeads = leadsWithScores.filter(item => item.dominanceScore >= 0.7);
  
  // Sort by dominance score (descending)
  qualifiedLeads.sort((a, b) => b.dominanceScore - a.dominanceScore);
  
  // Return the best match or null if no qualified lead found
  return qualifiedLeads.length > 0 ? qualifiedLeads[0].lead : null;
};

/**
 * Calculate the completion percentage of a ticket based on its threads
 * @param ticketId The ticket ID
 * @returns Completion percentage (0-100)
 */
export const calculateTicketCompletion = (ticketId: string): number => {
  const threads = mockThreads.filter(thread => thread.parentTicketId === ticketId);
  
  if (threads.length === 0) return 0;
  
  const completedThreads = threads.filter(thread => thread.status === 'Resolved');
  return Math.round((completedThreads.length / threads.length) * 100);
};

/**
 * Generate a unique ID for a new ticket
 * @returns A new ticket ID
 */
export const generateTicketId = (): string => {
  const year = new Date().getFullYear();
  const lastTicketNumber = mockTickets
    .map(t => parseInt(t.id.split('-')[2]))
    .reduce((max, num) => Math.max(max, num), 0);
  
  const newNumber = (lastTicketNumber + 1).toString().padStart(3, '0');
  return `TKT-${year}-${newNumber}`;
};

/**
 * Generate a unique ID for a new thread
 * @param ticketId The parent ticket ID
 * @param index Optional index for the thread (defaults to next available number)
 * @returns A new thread ID
 */
export const generateThreadId = (ticketId: string, index?: number): string => {
  const ticketNumber = ticketId.split('-')[2];
  
  if (index !== undefined) {
    return `THR-${ticketNumber}-${index}`;
  }
  
  const existingThreads = mockThreads.filter(t => t.parentTicketId === ticketId);
  const threadNumber = existingThreads.length + 1;
  
  return `THR-${ticketNumber}-${threadNumber}`;
};

/**
 * Filter tickets by search term
 * @param searchTerm The search term
 * @returns Array of tickets matching the search term
 */
export const searchTickets = (searchTerm: string): Ticket[] => {
  const term = searchTerm.toLowerCase();
  
  return mockTickets.filter(ticket => 
    ticket.id.toLowerCase().includes(term) ||
    ticket.subject.toLowerCase().includes(term) ||
    ticket.description.toLowerCase().includes(term)
  );
};

/**
 * Get the workload distribution across engineers
 * @returns Object mapping engineer IDs to their workload percentage
 */
export const getWorkloadDistribution = (): Record<string, number> => {
  const distribution: Record<string, number> = {};
  
  mockEngineers.forEach(engineer => {
    distribution[engineer.id] = engineer.currentWorkload;
  });
  
  return distribution;
};

/**
 * Get thread statistics by status
 * @returns Object with counts of threads by status
 */
export const getThreadStatsByStatus = (): Record<ThreadStatus, number> => {
  const stats: Record<ThreadStatus, number> = {
    'Open': 0,
    'In Progress': 0,
    'Resolved': 0
  };
  
  mockThreads.forEach(thread => {
    stats[thread.status]++;
  });
  
  return stats;
};

/**
 * Get skill demand statistics based on thread requirements
 * @returns Object mapping skill types to their demand count
 */
export const getSkillDemandStats = (): Record<SkillType, number> => {
  const stats: Partial<Record<SkillType, number>> = {};
  
  mockThreads.forEach(thread => {
    thread.requiredSkills.forEach(skill => {
      stats[skill] = (stats[skill] || 0) + 1;
    });
  });
  
  return stats as Record<SkillType, number>;
};