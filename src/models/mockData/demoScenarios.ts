import { Ticket, IssueThread, Engineer } from '../types';
import { mockTickets } from './tickets';
import { mockThreads } from './threads';
import { mockEngineers } from './engineers';
import { generateTicketId, generateThreadId } from '../../utils/dataUtils';

/**
 * Demo Scenarios Service
 * Provides pre-defined ticket scenarios for comprehensive demonstrations
 */
export const demoScenarios = {
  /**
   * Load a pre-defined demo scenario
   * @param scenarioId The scenario ID to load
   * @returns The loaded scenario data
   */
  loadScenario: (scenarioId: string): {
    ticket: Ticket;
    threads: IssueThread[];
    engineers: Engineer[];
  } | null => {
    const scenario = scenarios[scenarioId];
    if (!scenario) return null;
    
    return scenario();
  },
  
  /**
   * Get available scenario IDs
   * @returns Array of available scenario IDs
   */
  getAvailableScenarios: (): Array<{
    id: string;
    name: string;
    description: string;
    complexity: 'Low' | 'Medium' | 'High';
  }> => {
    return [
      {
        id: 'data-migration-failure',
        name: 'Data Migration Failure',
        description: 'Complex data migration failure affecting multiple systems with data integrity issues',
        complexity: 'High'
      },
      {
        id: 'security-compliance-audit',
        name: 'Security Compliance Audit',
        description: 'Security compliance issues identified during external audit requiring immediate remediation',
        complexity: 'High'
      },
      {
        id: 'integration-breakdown',
        name: 'Integration Breakdown',
        description: 'Critical integration failure between SAP systems and third-party applications',
        complexity: 'Medium'
      },
      {
        id: 'performance-degradation',
        name: 'Performance Degradation',
        description: 'Gradual performance degradation across multiple modules after recent update',
        complexity: 'Medium'
      },
      {
        id: 'mobile-app-crash',
        name: 'Mobile App Crash',
        description: 'Mobile application crashes when accessing specific functionality',
        complexity: 'Low'
      }
    ];
  }
};

/**
 * Pre-defined scenarios
 */
const scenarios: Record<string, () => {
  ticket: Ticket;
  threads: IssueThread[];
  engineers: Engineer[];
}> = {
  // Scenario 1: Data Migration Failure
  'data-migration-failure': () => {
    const now = new Date();
    
    // Create ticket
    const ticket: Ticket = {
      id: generateTicketId(),
      subject: 'Critical data migration failure with data integrity issues',
      description: 'Our SAP S/4HANA data migration from legacy ERP has failed during the final stage. We\'re seeing data integrity issues with financial records, missing customer data, and duplicate inventory entries. Business operations are severely impacted as we cannot process orders or generate accurate financial reports. Error logs show database constraint violations and unexpected termination of migration jobs.',
      urgency: 'Critical',
      affectedSystem: 'SAP S/4HANA',
      attachments: [
        {
          id: 'att-dm-001',
          name: 'migration_error_log.txt',
          type: 'text/plain',
          size: 256000,
          url: '/mock-files/migration_error_log.txt'
        },
        {
          id: 'att-dm-002',
          name: 'data_validation_report.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1548576,
          url: '/mock-files/data_validation_report.xlsx'
        }
      ],
      aiClassification: {
        urgencyScore: 95,
        complexityEstimate: 'High',
        skillTags: ['Database', 'Backend', 'Integration', 'Analytics'],
        recommendedAction: 'CRP',
        confidenceScore: 90
      },
      status: 'Classified',
      createdAt: now,
      updatedAt: now
    };
    
    // Create threads
    const threads: IssueThread[] = [
      {
        id: generateThreadId(ticket.id, 1),
        parentTicketId: ticket.id,
        title: 'Database integrity investigation',
        description: 'Investigate database constraint violations and data integrity issues. Analyze error logs for specific failure points and identify affected database tables and relationships.',
        requiredSkills: ['Database'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 10,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 2),
        parentTicketId: ticket.id,
        title: 'Migration process analysis',
        description: 'Analyze the migration process flow and identify the point of failure. Review migration job configurations and execution logs to determine what caused the unexpected termination.',
        requiredSkills: ['Backend', 'Integration'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 9,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 3),
        parentTicketId: ticket.id,
        title: 'Data reconciliation strategy',
        description: 'Develop a strategy for data reconciliation between source and target systems. Create validation queries to identify and fix inconsistencies in financial records, customer data, and inventory entries.',
        requiredSkills: ['Analytics', 'Database'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 8,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 4),
        parentTicketId: ticket.id,
        title: 'Business continuity plan',
        description: 'Develop a temporary business continuity plan to allow critical operations to continue while the migration issues are being resolved. Identify workarounds for order processing and financial reporting.',
        requiredSkills: ['Backend'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 7,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Assign relevant engineers
    const relevantEngineers = mockEngineers.filter(engineer => 
      engineer.skills.some(skill => 
        ['Database', 'Backend', 'Integration', 'Analytics'].includes(skill)
      )
    );
    
    return {
      ticket,
      threads,
      engineers: relevantEngineers
    };
  },
  
  // Scenario 2: Security Compliance Audit
  'security-compliance-audit': () => {
    const now = new Date();
    
    // Create ticket
    const ticket: Ticket = {
      id: generateTicketId(),
      subject: 'Critical security compliance issues from external audit',
      description: 'An external security audit has identified several critical compliance issues in our SAP landscape that require immediate remediation. Issues include insufficient password policies, excessive user permissions, unencrypted data transmission, and outdated security patches. The audit report indicates these issues must be resolved within 30 days to maintain compliance certification.',
      urgency: 'Critical',
      affectedSystem: 'SAP Business Technology Platform',
      attachments: [
        {
          id: 'att-sc-001',
          name: 'security_audit_report.pdf',
          type: 'application/pdf',
          size: 3548576,
          url: '/mock-files/security_audit_report.pdf'
        },
        {
          id: 'att-sc-002',
          name: 'compliance_requirements.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 1248576,
          url: '/mock-files/compliance_requirements.docx'
        }
      ],
      aiClassification: {
        urgencyScore: 90,
        complexityEstimate: 'High',
        skillTags: ['Security', 'Network', 'Backend', 'DevOps'],
        recommendedAction: 'CRP',
        confidenceScore: 95
      },
      status: 'Classified',
      createdAt: now,
      updatedAt: now
    };
    
    // Create threads
    const threads: IssueThread[] = [
      {
        id: generateThreadId(ticket.id, 1),
        parentTicketId: ticket.id,
        title: 'Authentication and password policy remediation',
        description: 'Address insufficient password policies and implement stronger authentication mechanisms. Update password complexity requirements, implement account lockout policies, and enforce multi-factor authentication where appropriate.',
        requiredSkills: ['Security'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 10,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 2),
        parentTicketId: ticket.id,
        title: 'User permission review and adjustment',
        description: 'Review and adjust excessive user permissions across the SAP landscape. Implement least privilege principles, remove unnecessary authorizations, and establish role-based access control.',
        requiredSkills: ['Security', 'Backend'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 9,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 3),
        parentTicketId: ticket.id,
        title: 'Data transmission encryption implementation',
        description: 'Implement encryption for all data transmission channels. Configure TLS/SSL for all communication paths, verify certificate validity, and ensure secure communication protocols are enforced.',
        requiredSkills: ['Network', 'Security'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 8,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 4),
        parentTicketId: ticket.id,
        title: 'Security patch management',
        description: 'Address outdated security patches across the SAP landscape. Develop a comprehensive patching strategy, test patches in non-production environments, and implement them in production systems.',
        requiredSkills: ['DevOps', 'Security'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 7,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Assign relevant engineers
    const relevantEngineers = mockEngineers.filter(engineer => 
      engineer.skills.some(skill => 
        ['Security', 'Network', 'Backend', 'DevOps'].includes(skill)
      )
    );
    
    return {
      ticket,
      threads,
      engineers: relevantEngineers
    };
  },
  
  // Scenario 3: Integration Breakdown
  'integration-breakdown': () => {
    const now = new Date();
    
    // Create ticket
    const ticket: Ticket = {
      id: generateTicketId(),
      subject: 'Integration failure between SAP and third-party systems',
      description: 'We\'re experiencing a critical integration failure between our SAP S/4HANA system and several third-party applications. The integration middleware is reporting connection timeouts and data format errors. This is affecting our supply chain operations as purchase orders are not being transmitted to suppliers and inventory updates are not being received.',
      urgency: 'High',
      affectedSystem: 'SAP S/4HANA',
      attachments: [
        {
          id: 'att-if-001',
          name: 'integration_error_logs.txt',
          type: 'text/plain',
          size: 458576,
          url: '/mock-files/integration_error_logs.txt'
        }
      ],
      aiClassification: {
        urgencyScore: 80,
        complexityEstimate: 'Medium',
        skillTags: ['Integration', 'Backend', 'Network'],
        recommendedAction: 'CRP',
        confidenceScore: 85
      },
      status: 'Classified',
      createdAt: now,
      updatedAt: now
    };
    
    // Create threads
    const threads: IssueThread[] = [
      {
        id: generateThreadId(ticket.id, 1),
        parentTicketId: ticket.id,
        title: 'Integration middleware investigation',
        description: 'Investigate the integration middleware for connection timeouts and configuration issues. Check middleware logs, connection settings, and service availability.',
        requiredSkills: ['Integration'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 9,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 2),
        parentTicketId: ticket.id,
        title: 'Data format and mapping analysis',
        description: 'Analyze data format errors and mapping configurations. Review message structures, data transformations, and schema definitions for inconsistencies.',
        requiredSkills: ['Integration', 'Backend'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 8,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 3),
        parentTicketId: ticket.id,
        title: 'Network connectivity troubleshooting',
        description: 'Troubleshoot network connectivity issues between SAP and third-party systems. Check firewall rules, network routes, and DNS resolution.',
        requiredSkills: ['Network'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 7,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Assign relevant engineers
    const relevantEngineers = mockEngineers.filter(engineer => 
      engineer.skills.some(skill => 
        ['Integration', 'Backend', 'Network'].includes(skill)
      )
    );
    
    return {
      ticket,
      threads,
      engineers: relevantEngineers
    };
  },
  
  // Scenario 4: Performance Degradation
  'performance-degradation': () => {
    const now = new Date();
    
    // Create ticket
    const ticket: Ticket = {
      id: generateTicketId(),
      subject: 'Gradual performance degradation across multiple modules',
      description: 'Since our last quarterly update, we\'ve observed a gradual performance degradation across multiple SAP modules. Users report increasing response times for transactions, report generation is taking twice as long as before, and batch jobs are frequently timing out. System monitoring shows increasing database query times and higher than normal CPU utilization.',
      urgency: 'Medium',
      affectedSystem: 'SAP ERP',
      attachments: [
        {
          id: 'att-pd-001',
          name: 'performance_metrics.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1248576,
          url: '/mock-files/performance_metrics.xlsx'
        },
        {
          id: 'att-pd-002',
          name: 'system_monitoring.png',
          type: 'image/png',
          size: 548576,
          url: '/mock-files/system_monitoring.png'
        }
      ],
      aiClassification: {
        urgencyScore: 65,
        complexityEstimate: 'Medium',
        skillTags: ['Database', 'Backend', 'Analytics'],
        recommendedAction: 'CRP',
        confidenceScore: 80
      },
      status: 'Classified',
      createdAt: now,
      updatedAt: now
    };
    
    // Create threads
    const threads: IssueThread[] = [
      {
        id: generateThreadId(ticket.id, 1),
        parentTicketId: ticket.id,
        title: 'Database performance analysis',
        description: 'Analyze database performance issues including query execution plans, index usage, and table statistics. Identify slow-running queries and optimization opportunities.',
        requiredSkills: ['Database'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 8,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 2),
        parentTicketId: ticket.id,
        title: 'Application code review',
        description: 'Review application code changes from the last quarterly update. Identify inefficient code patterns, excessive database calls, or resource-intensive operations.',
        requiredSkills: ['Backend'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 7,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 3),
        parentTicketId: ticket.id,
        title: 'System resource utilization investigation',
        description: 'Investigate system resource utilization patterns including CPU, memory, disk I/O, and network bandwidth. Identify resource bottlenecks and capacity issues.',
        requiredSkills: ['Analytics', 'DevOps'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 6,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Assign relevant engineers
    const relevantEngineers = mockEngineers.filter(engineer => 
      engineer.skills.some(skill => 
        ['Database', 'Backend', 'Analytics', 'DevOps'].includes(skill)
      )
    );
    
    return {
      ticket,
      threads,
      engineers: relevantEngineers
    };
  },
  
  // Scenario 5: Mobile App Crash
  'mobile-app-crash': () => {
    const now = new Date();
    
    // Create ticket
    const ticket: Ticket = {
      id: generateTicketId(),
      subject: 'Mobile application crashes when accessing specific functionality',
      description: 'Our SAP mobile application crashes consistently when users attempt to access the inventory management module. The issue affects all users on both iOS and Android platforms. The application was working correctly before the latest update last week. Users can access other modules without issues.',
      urgency: 'Medium',
      affectedSystem: 'SAP Customer Experience',
      attachments: [
        {
          id: 'att-mc-001',
          name: 'crash_report.log',
          type: 'text/plain',
          size: 348576,
          url: '/mock-files/crash_report.log'
        },
        {
          id: 'att-mc-002',
          name: 'screen_recording.mp4',
          type: 'video/mp4',
          size: 5248576,
          url: '/mock-files/screen_recording.mp4'
        }
      ],
      aiClassification: {
        urgencyScore: 60,
        complexityEstimate: 'Low',
        skillTags: ['Mobile', 'Frontend', 'Backend'],
        recommendedAction: 'CRP',
        confidenceScore: 85
      },
      status: 'Classified',
      createdAt: now,
      updatedAt: now
    };
    
    // Create threads
    const threads: IssueThread[] = [
      {
        id: generateThreadId(ticket.id, 1),
        parentTicketId: ticket.id,
        title: 'Mobile application crash analysis',
        description: 'Analyze mobile application crash reports and logs. Identify the specific component or code path that\'s causing the crash in the inventory management module.',
        requiredSkills: ['Mobile'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 7,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 2),
        parentTicketId: ticket.id,
        title: 'API and data validation',
        description: 'Investigate backend API responses and data validation for the inventory management module. Check for unexpected data formats or missing fields that might cause the mobile app to crash.',
        requiredSkills: ['Backend'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 6,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: generateThreadId(ticket.id, 3),
        parentTicketId: ticket.id,
        title: 'UI component troubleshooting',
        description: 'Troubleshoot UI components in the inventory management module. Check for rendering issues, memory leaks, or event handling problems that might cause crashes.',
        requiredSkills: ['Frontend', 'Mobile'],
        assignedEngineerId: null,
        status: 'Open',
        priority: 5,
        chatEnabled: true,
        createdAt: now,
        updatedAt: now
      }
    ];
    
    // Assign relevant engineers
    const relevantEngineers = mockEngineers.filter(engineer => 
      engineer.skills.some(skill => 
        ['Mobile', 'Frontend', 'Backend'].includes(skill)
      )
    );
    
    return {
      ticket,
      threads,
      engineers: relevantEngineers
    };
  }
};