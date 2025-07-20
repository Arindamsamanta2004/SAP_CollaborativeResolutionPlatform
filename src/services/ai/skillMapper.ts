import { Engineer, SkillType, Ticket, IssueThread } from '../../models/types';
import { mockEngineers } from '../../models/mockData/engineers';

/**
 * Skill Mapper Service
 * Maps engineer expertise to ticket requirements and implements the 70% skill dominance rule
 */
export const skillMapper = {
  /**
   * Find the best lead engineer for a ticket based on experience and expertise
   * @param ticket The classified ticket
   * @returns The best matching lead engineer or null if none found
   */
  findLeadEngineer: (ticket: Ticket): Engineer | null => {
    if (!ticket.aiClassification?.skillTags || ticket.aiClassification.skillTags.length === 0) {
      return null;
    }
    
    // Get all engineers who are available (not just leads)
    const availableEngineers = mockEngineers.filter(
      engineer => engineer.availability === 'Available'
    );
    
    if (availableEngineers.length === 0) {
      return null;
    }
    
    // Calculate experience score for each engineer
    const engineersWithScores = availableEngineers.map(engineer => {
      const experienceResult = calculateExperienceScore(engineer, ticket.aiClassification!.skillTags);
      
      return {
        engineer,
        ...experienceResult
      };
    });
    
    // Sort by experience score (descending) and prefer lead engineers
    engineersWithScores.sort((a, b) => {
      // First priority: experience score
      if (b.experienceScore !== a.experienceScore) {
        return b.experienceScore - a.experienceScore;
      }
      // Second priority: prefer existing lead engineers
      if (a.engineer.isLeadEngineer && !b.engineer.isLeadEngineer) return -1;
      if (!a.engineer.isLeadEngineer && b.engineer.isLeadEngineer) return 1;
      // Third priority: lower current workload
      return a.engineer.currentWorkload - b.engineer.currentWorkload;
    });
    
    // Return the most experienced engineer
    return engineersWithScores.length > 0 ? engineersWithScores[0].engineer : null;
  },
  
  /**
   * Find the best engineer for a specific thread based on required skills
   * @param thread The issue thread
   * @returns The best matching engineer or null if none found
   */
  findBestEngineerForThread: (thread: IssueThread): Engineer | null => {
    if (!thread.requiredSkills || thread.requiredSkills.length === 0) {
      return null;
    }
    
    // Get engineers who are available
    const availableEngineers = mockEngineers.filter(
      engineer => engineer.availability === 'Available'
    );
    
    if (availableEngineers.length === 0) {
      return null;
    }
    
    // Calculate expertise score for each engineer
    const engineersWithScores = availableEngineers.map(engineer => {
      let totalExpertise = 0;
      let matchCount = 0;
      
      // Calculate average expertise across all required skills
      thread.requiredSkills.forEach(skill => {
        const expertiseLevel = engineer.expertise[skill] || 0;
        if (expertiseLevel > 0) {
          totalExpertise += expertiseLevel;
          matchCount++;
        }
      });
      
      const averageExpertise = matchCount > 0 ? totalExpertise / matchCount : 0;
      const skillCoverage = matchCount / thread.requiredSkills.length;
      
      // Combined score considers both expertise level and skill coverage
      const combinedScore = averageExpertise * skillCoverage;
      
      return {
        engineer,
        averageExpertise,
        skillCoverage,
        combinedScore
      };
    });
    
    // Filter engineers with at least some expertise in required skills
    const qualifiedEngineers = engineersWithScores.filter(item => item.combinedScore > 0);
    
    // Sort by combined score (descending)
    qualifiedEngineers.sort((a, b) => b.combinedScore - a.combinedScore);
    
    // Return the best match or null if no qualified engineer found
    return qualifiedEngineers.length > 0 ? qualifiedEngineers[0].engineer : null;
  },
  
  /**
   * Find engineers with complementary skills for a team
   * @param primarySkills The primary skills already covered
   * @param additionalSkillsNeeded Additional skills needed
   * @param excludeEngineerIds Engineers to exclude from results
   * @returns Array of engineers with complementary skills
   */
  findComplementaryEngineers: (
    primarySkills: SkillType[],
    additionalSkillsNeeded: SkillType[],
    excludeEngineerIds: string[] = []
  ): Engineer[] => {
    // Get available engineers not in the exclude list
    const availableEngineers = mockEngineers.filter(
      engineer => 
        engineer.availability === 'Available' && 
        !excludeEngineerIds.includes(engineer.id)
    );
    
    if (availableEngineers.length === 0 || additionalSkillsNeeded.length === 0) {
      return [];
    }
    
    // Calculate skill coverage for each engineer
    const engineersWithCoverage = availableEngineers.map(engineer => {
      // Count how many of the needed skills this engineer covers
      const coveredSkills = additionalSkillsNeeded.filter(skill => 
        engineer.skills.includes(skill) && engineer.expertise[skill] > 60
      );
      
      return {
        engineer,
        coveredSkills,
        coverageCount: coveredSkills.length,
        // Avoid engineers who are too similar to the primary skills
        overlapWithPrimary: primarySkills.filter(skill => 
          engineer.skills.includes(skill) && engineer.expertise[skill] > 70
        ).length
      };
    });
    
    // Filter engineers who cover at least one needed skill
    const qualifiedEngineers = engineersWithCoverage.filter(item => item.coverageCount > 0);
    
    // Sort by coverage count (descending) and then by overlap with primary (ascending)
    qualifiedEngineers.sort((a, b) => {
      if (b.coverageCount !== a.coverageCount) {
        return b.coverageCount - a.coverageCount;
      }
      return a.overlapWithPrimary - b.overlapWithPrimary;
    });
    
    // Return the engineers, limited to what we need
    return qualifiedEngineers.map(item => item.engineer);
  },
  
  /**
   * Calculate workload impact if an engineer is assigned to a thread
   * @param engineer The engineer to evaluate
   * @param thread The thread to be assigned
   * @returns The projected workload after assignment
   */
  calculateWorkloadImpact: (engineer: Engineer, thread: IssueThread): number => {
    // Base impact depends on thread priority
    const baseImpact = thread.priority * 3;
    
    // Adjust based on engineer's expertise in the required skills
    let expertiseAdjustment = 0;
    thread.requiredSkills.forEach(skill => {
      const expertise = engineer.expertise[skill] || 0;
      // Higher expertise means lower workload impact
      expertiseAdjustment += (100 - expertise) / 20;
    });
    
    // Calculate projected workload
    const projectedWorkload = Math.min(100, engineer.currentWorkload + baseImpact + expertiseAdjustment);
    
    return projectedWorkload;
  }
};

/**
 * Calculate experience score for an engineer based on required skills
 * @param engineer The engineer to evaluate
 * @param requiredSkills The skills required for the task
 * @returns Experience score, primary skill, and total expertise
 */
const calculateExperienceScore = (
  engineer: Engineer, 
  requiredSkills: SkillType[]
): { experienceScore: number; primarySkill: SkillType | null; totalExpertise: number } => {
  let primarySkill: SkillType | null = null;
  let highestExpertise = 0;
  let totalExpertise = 0;
  let skillCount = 0;
  
  // Calculate total expertise and find primary skill
  requiredSkills.forEach(skill => {
    const expertiseLevel = engineer.expertise[skill] || 0;
    if (expertiseLevel > 0) {
      totalExpertise += expertiseLevel;
      skillCount++;
      
      if (expertiseLevel > highestExpertise) {
        highestExpertise = expertiseLevel;
        primarySkill = skill;
      }
    }
  });
  
  // Calculate experience score based on:
  // 1. Average expertise across required skills (60%)
  // 2. Skill coverage (how many required skills they have) (25%)
  // 3. Lead engineer bonus (15%)
  const averageExpertise = skillCount > 0 ? totalExpertise / skillCount : 0;
  const skillCoverage = skillCount / requiredSkills.length;
  const leadBonus = engineer.isLeadEngineer ? 20 : 0;
  
  const experienceScore = (averageExpertise * 0.6) + (skillCoverage * 100 * 0.25) + leadBonus;
  
  return {
    experienceScore: Math.round(experienceScore),
    primarySkill,
    totalExpertise
  };
};

/**
 * Calculate skill dominance for an engineer based on required skills
 * @param engineer The engineer to evaluate
 * @param requiredSkills The skills required for the task
 * @returns Dominance score, primary skill, and expertise level
 */
const calculateSkillDominance = (
  engineer: Engineer, 
  requiredSkills: SkillType[]
): { dominanceScore: number; primarySkill: SkillType | null; primaryExpertise: number } => {
  let primarySkill: SkillType | null = null;
  let highestExpertise = 0;
  
  // Find the engineer's primary skill among the required skills
  requiredSkills.forEach(skill => {
    const expertiseLevel = engineer.expertise[skill] || 0;
    if (expertiseLevel > highestExpertise) {
      highestExpertise = expertiseLevel;
      primarySkill = skill;
    }
  });
  
  // Calculate dominance percentage (primary skill expertise vs. total expertise)
  let dominanceScore = 0;
  if (primarySkill) {
    const totalExpertise = requiredSkills.reduce(
      (sum, skill) => sum + (engineer.expertise[skill] || 0), 
      0
    );
    
    dominanceScore = totalExpertise > 0 
      ? (engineer.expertise[primarySkill] || 0) / totalExpertise 
      : 0;
  }
  
  return {
    dominanceScore,
    primarySkill,
    primaryExpertise: highestExpertise
  };
};