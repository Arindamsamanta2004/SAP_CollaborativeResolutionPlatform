import { Ticket, ComplexityEstimate, SkillType } from '../../models/types';

/**
 * Complexity Analyzer Service
 * Analyzes ticket complexity based on content, keywords, and patterns
 */
export const complexityAnalyzer = {
  /**
   * Analyze ticket complexity based on content and metadata
   * @param ticket The ticket to analyze
   * @returns Complexity score (0-100) and estimate
   */
  analyzeComplexity: (ticket: Ticket): { score: number; estimate: ComplexityEstimate } => {
    // Base score starts at 0
    let complexityScore = 0;
    
    // Factor 1: Description length (longer descriptions often indicate more complex issues)
    const descriptionLength = ticket.description.length;
    if (descriptionLength > 500) complexityScore += 20;
    else if (descriptionLength > 300) complexityScore += 15;
    else if (descriptionLength > 150) complexityScore += 10;
    else complexityScore += 5;
    
    // Factor 2: Number of attachments (more attachments suggest more complex documentation needed)
    const attachmentCount = ticket.attachments.length;
    complexityScore += Math.min(attachmentCount * 5, 15); // Max 15 points from attachments
    
    // Factor 3: Urgency level
    switch (ticket.urgency) {
      case 'Critical': complexityScore += 20; break;
      case 'High': complexityScore += 15; break;
      case 'Medium': complexityScore += 10; break;
      case 'Low': complexityScore += 5; break;
    }
    
    // Factor 4: Keyword analysis
    const complexityKeywords = [
      { term: 'multiple', weight: 3 },
      { term: 'complex', weight: 4 },
      { term: 'failure', weight: 3 },
      { term: 'error', weight: 2 },
      { term: 'critical', weight: 3 },
      { term: 'breach', weight: 4 },
      { term: 'security', weight: 3 },
      { term: 'performance', weight: 2 },
      { term: 'degradation', weight: 3 },
      { term: 'integration', weight: 3 },
      { term: 'across', weight: 3 },
      { term: 'systems', weight: 2 },
      { term: 'modules', weight: 2 },
      { term: 'inconsistent', weight: 3 },
      { term: 'intermittent', weight: 4 },
      { term: 'authentication', weight: 3 },
      { term: 'authorization', weight: 3 },
      { term: 'connectivity', weight: 2 },
      { term: 'configuration', weight: 2 },
      { term: 'corruption', weight: 4 }
    ];
    
    const text = `${ticket.subject} ${ticket.description}`.toLowerCase();
    let keywordScore = 0;
    
    complexityKeywords.forEach(({ term, weight }) => {
      if (text.includes(term)) {
        keywordScore += weight;
      }
    });
    
    // Cap keyword score at 25
    complexityScore += Math.min(keywordScore, 25);
    
    // Factor 5: Affected system complexity
    const systemComplexity: Record<string, number> = {
      'SAP ERP': 15,
      'SAP S/4HANA': 18,
      'SAP SuccessFactors': 12,
      'SAP Ariba': 10,
      'SAP Concur': 8,
      'SAP Fieldglass': 10,
      'SAP Customer Experience': 12,
      'SAP Business Technology Platform': 20
    };
    
    complexityScore += systemComplexity[ticket.affectedSystem] || 10;
    
    // Ensure score is between 0-100
    complexityScore = Math.max(0, Math.min(100, complexityScore));
    
    // Determine complexity estimate based on score
    let estimate: ComplexityEstimate;
    if (complexityScore >= 70) {
      estimate = 'High';
    } else if (complexityScore >= 40) {
      estimate = 'Medium';
    } else {
      estimate = 'Low';
    }
    
    return { score: complexityScore, estimate };
  },
  
  /**
   * Determine if a ticket should be routed to CRP based on complexity
   * @param ticket The ticket to analyze
   * @returns Boolean indicating if ticket should be routed to CRP
   */
  shouldRouteToCRP: (ticket: Ticket): boolean => {
    const { score, estimate } = complexityAnalyzer.analyzeComplexity(ticket);
    
    // Route to CRP if:
    // 1. Complexity is High, OR
    // 2. Complexity is Medium AND urgency is Critical or High
    return (
      estimate === 'High' || 
      (estimate === 'Medium' && (ticket.urgency === 'Critical' || ticket.urgency === 'High'))
    );
  },
  
  /**
   * Identify required skills based on ticket content
   * @param ticket The ticket to analyze
   * @returns Array of required skills with confidence scores
   */
  identifyRequiredSkills: (ticket: Ticket): Array<{ skill: SkillType; confidence: number }> => {
    const text = `${ticket.subject} ${ticket.description}`.toLowerCase();
    
    // Skill keywords mapping
    const skillKeywords: Record<SkillType, string[]> = {
      'Database': ['database', 'sql', 'query', 'data', 'connection', 'timeout', 'table', 'record', 'field'],
      'Frontend': ['ui', 'interface', 'screen', 'display', 'form', 'button', 'layout', 'css', 'html'],
      'Backend': ['api', 'service', 'server', 'process', 'function', 'module', 'method', 'class'],
      'Network': ['network', 'connection', 'timeout', 'latency', 'bandwidth', 'firewall', 'proxy', 'dns'],
      'Security': ['security', 'breach', 'authentication', 'login', 'password', 'access', 'permission', 'role'],
      'DevOps': ['deployment', 'pipeline', 'build', 'environment', 'configuration', 'ci/cd', 'docker'],
      'Integration': ['integration', 'connector', 'interface', 'communication', 'sync', 'middleware', 'api'],
      'Analytics': ['report', 'analytics', 'dashboard', 'metrics', 'statistics', 'chart', 'graph', 'kpi'],
      'Mobile': ['mobile', 'app', 'phone', 'tablet', 'responsive', 'android', 'ios', 'native'],
      'Cloud': ['cloud', 'aws', 'azure', 'saas', 'infrastructure', 'serverless', 'container', 'kubernetes'],
      'UX': ['user experience', 'ux', 'usability', 'design', 'workflow', 'journey', 'accessibility']
    };
    
    // Calculate confidence score for each skill
    const skillScores: Array<{ skill: SkillType; confidence: number }> = [];
    
    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      let matchCount = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          matchCount++;
        }
      });
      
      // Calculate confidence based on keyword matches
      const confidence = Math.min(100, (matchCount / keywords.length) * 100);
      
      // Only include skills with at least 20% confidence
      if (confidence >= 20) {
        skillScores.push({
          skill: skill as SkillType,
          confidence
        });
      }
    });
    
    // If no skills were detected, add default ones based on the affected system
    if (skillScores.length === 0) {
      switch (ticket.affectedSystem) {
        case 'SAP ERP':
        case 'SAP S/4HANA':
          skillScores.push({ skill: 'Backend', confidence: 70 });
          skillScores.push({ skill: 'Database', confidence: 60 });
          break;
        case 'SAP SuccessFactors':
        case 'SAP Customer Experience':
          skillScores.push({ skill: 'Frontend', confidence: 70 });
          skillScores.push({ skill: 'Integration', confidence: 60 });
          break;
        case 'SAP Business Technology Platform':
          skillScores.push({ skill: 'Cloud', confidence: 80 });
          skillScores.push({ skill: 'Integration', confidence: 70 });
          break;
        default:
          skillScores.push({ skill: 'Backend', confidence: 60 });
      }
    }
    
    // Sort by confidence (descending)
    return skillScores.sort((a, b) => b.confidence - a.confidence);
  }
};