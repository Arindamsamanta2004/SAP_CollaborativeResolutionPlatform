import { Ticket, IssueThread, SkillType } from '../../models/types';
import { complexityAnalyzer } from './complexityAnalyzer';
import { generateThreadId } from '../../utils/dataUtils';

/**
 * Thread Decomposer Service
 * Decomposes complex tickets into skill-based issue threads
 */
export const threadDecomposer = {
  /**
   * Decompose a ticket into multiple issue threads based on required skills
   * @param ticket The ticket to decompose
   * @returns Array of issue threads
   */
  decomposeTicket: (ticket: Ticket): IssueThread[] => {
    // Get required skills with confidence scores
    const skillScores = complexityAnalyzer.identifyRequiredSkills(ticket);
    
    // Only use skills with confidence > 40%
    const significantSkills = skillScores.filter(item => item.confidence > 40);
    
    // If no significant skills, use the top 2 skills
    const skillsToUse = significantSkills.length > 0 
      ? significantSkills 
      : skillScores.slice(0, 2);
    
    // Generate threads based on identified skills
    const threads: IssueThread[] = [];
    const now = new Date();
    
    // Create thread templates based on skills and ticket content
    skillsToUse.forEach((skillItem, index) => {
      const { skill } = skillItem;
      
      // Generate thread title and description based on skill and ticket content
      const { title, description } = generateThreadContent(ticket, skill);
      
      // Create the thread
      const thread: IssueThread = {
        id: generateThreadId(ticket.id, index + 1),
        parentTicketId: ticket.id,
        title,
        description,
        requiredSkills: [skill],
        assignedEngineerId: null,
        status: 'Open',
        priority: calculatePriority(ticket, skill, index),
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      };
      
      threads.push(thread);
    });
    
    // For complex tickets, add an integration thread if multiple skills are involved
    if (threads.length > 1 && ticket.aiClassification?.complexityEstimate === 'High') {
      const integrationThread: IssueThread = {
        id: generateThreadId(ticket.id, threads.length + 1),
        parentTicketId: ticket.id,
        title: `Integration and system-wide verification for ${ticket.subject}`,
        description: `Verify that all individual thread solutions work together correctly. Ensure system-wide consistency and perform integration testing across the affected components.`,
        requiredSkills: ['Integration'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 5, // Medium priority, to be addressed after core issues
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      };
      
      threads.push(integrationThread);
    }
    
    return threads;
  }
};

/**
 * Generate thread content (title and description) based on skill and ticket content
 * @param ticket The source ticket
 * @param skill The primary skill for this thread
 * @returns Thread title and description
 */
const generateThreadContent = (ticket: Ticket, skill: SkillType): { title: string; description: string } => {
  const subject = ticket.subject;
  const description = ticket.description;
  
  // Templates for different skills
  const templates: Record<SkillType, { title: string; description: string }> = {
    'Database': {
      title: `Database investigation for ${subject}`,
      description: `Investigate database-related issues in the ticket. Check for connection problems, query performance, data integrity, and database configuration. Review any error logs for SQL errors or timeouts.`
    },
    'Frontend': {
      title: `User interface analysis for ${subject}`,
      description: `Analyze frontend components related to the issue. Check for rendering problems, form validation, UI responsiveness, and browser compatibility issues. Verify CSS and layout consistency.`
    },
    'Backend': {
      title: `Backend service investigation for ${subject}`,
      description: `Investigate backend services and business logic related to the issue. Check API endpoints, service methods, data processing, and application server logs. Verify business rule implementation and service configuration.`
    },
    'Network': {
      title: `Network connectivity analysis for ${subject}`,
      description: `Analyze network-related aspects of the issue. Check for connectivity problems, latency issues, firewall configurations, and network timeouts. Verify DNS resolution and proxy settings if applicable.`
    },
    'Security': {
      title: `Security assessment for ${subject}`,
      description: `Perform security analysis related to the issue. Check authentication mechanisms, authorization rules, access controls, and potential security vulnerabilities. Review security logs and user permissions.`
    },
    'DevOps': {
      title: `Deployment and environment investigation for ${subject}`,
      description: `Investigate deployment and environment configuration related to the issue. Check build artifacts, deployment scripts, environment variables, and infrastructure configuration. Verify CI/CD pipeline and deployment logs.`
    },
    'Integration': {
      title: `Integration point analysis for ${subject}`,
      description: `Analyze integration aspects of the issue. Check interfaces between systems, data mapping, message formats, and communication protocols. Verify middleware configuration and integration error logs.`
    },
    'Analytics': {
      title: `Reporting and analytics investigation for ${subject}`,
      description: `Investigate reporting and analytics components related to the issue. Check data aggregation, calculation logic, report rendering, and metric definitions. Verify dashboard functionality and data visualization.`
    },
    'Mobile': {
      title: `Mobile application analysis for ${subject}`,
      description: `Analyze mobile-specific aspects of the issue. Check responsive design, mobile app functionality, device compatibility, and mobile-specific features. Verify performance on different mobile devices.`
    },
    'Cloud': {
      title: `Cloud infrastructure investigation for ${subject}`,
      description: `Investigate cloud infrastructure related to the issue. Check cloud service configuration, resource allocation, scaling policies, and cloud provider-specific settings. Verify cloud service limits and quotas.`
    },
    'UX': {
      title: `User experience evaluation for ${subject}`,
      description: `Evaluate user experience aspects of the issue. Check workflow design, usability patterns, accessibility compliance, and user journey mapping. Verify consistency with design guidelines and user expectations.`
    }
  };
  
  // Get the template for the skill
  const template = templates[skill];
  
  // Extract relevant parts of the ticket description based on skill
  const relevantContent = extractRelevantContent(description, skill);
  
  // Combine template with relevant content if available
  return {
    title: template.title,
    description: relevantContent 
      ? `${template.description}\n\nRelevant information from ticket: ${relevantContent}` 
      : template.description
  };
};

/**
 * Extract relevant content from ticket description based on skill
 * @param description The ticket description
 * @param skill The skill to focus on
 * @returns Relevant content or null if none found
 */
const extractRelevantContent = (description: string, skill: SkillType): string | null => {
  const skillKeywords: Record<SkillType, string[]> = {
    'Database': ['database', 'sql', 'query', 'data', 'connection', 'timeout', 'table'],
    'Frontend': ['ui', 'interface', 'screen', 'display', 'form', 'button'],
    'Backend': ['api', 'service', 'server', 'process', 'function', 'module'],
    'Network': ['network', 'connection', 'timeout', 'latency', 'bandwidth'],
    'Security': ['security', 'breach', 'authentication', 'login', 'password'],
    'DevOps': ['deployment', 'pipeline', 'build', 'environment', 'configuration'],
    'Integration': ['integration', 'connector', 'interface', 'communication'],
    'Analytics': ['report', 'analytics', 'dashboard', 'metrics', 'statistics'],
    'Mobile': ['mobile', 'app', 'phone', 'tablet', 'responsive'],
    'Cloud': ['cloud', 'aws', 'azure', 'saas', 'infrastructure'],
    'UX': ['user experience', 'ux', 'usability', 'design', 'workflow']
  };
  
  // Get keywords for the skill
  const keywords = skillKeywords[skill] || [];
  
  // Split description into sentences
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Find sentences containing skill keywords
  const relevantSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return keywords.some(keyword => lowerSentence.includes(keyword));
  });
  
  // Return relevant sentences or null if none found
  return relevantSentences.length > 0 ? relevantSentences.join('. ') + '.' : null;
};

/**
 * Calculate thread priority based on ticket urgency, skill, and position
 * @param ticket The source ticket
 * @param skill The thread skill
 * @param index The position in the thread list
 * @returns Priority value (1-10)
 */
const calculatePriority = (ticket: Ticket, skill: SkillType, index: number): number => {
  // Base priority from ticket urgency
  let priority = 0;
  switch (ticket.urgency) {
    case 'Critical': priority = 10; break;
    case 'High': priority = 8; break;
    case 'Medium': priority = 6; break;
    case 'Low': priority = 4; break;
  }
  
  // Adjust based on skill (security and database issues often need priority)
  if (skill === 'Security') {
    priority = Math.min(10, priority + 2);
  } else if (skill === 'Database') {
    priority = Math.min(10, priority + 1);
  }
  
  // Adjust based on position (first identified skill might be more relevant)
  priority = Math.max(1, Math.min(10, priority - (index * 0.5)));
  
  return Math.round(priority);
};