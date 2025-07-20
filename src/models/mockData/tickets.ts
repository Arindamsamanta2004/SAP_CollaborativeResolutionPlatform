import { Ticket, UrgencyLevel, AffectedSystem, TicketStatus } from '../types';
import { mockThreads } from './threads';

/**
 * Mock data for tickets with realistic scenarios
 */
export const mockTickets: Ticket[] = [
  // Complex ticket scenario 1: Email system failure with database errors
  {
    id: 'TKT-2023-001',
    subject: 'Email system failure with database connection errors',
    description: 'Our SAP S/4HANA email notification system has stopped working. Users report that no automated emails are being sent for purchase order approvals. Database logs show connection timeouts. This is affecting our entire procurement process and is urgent.',
    urgency: 'Critical',
    affectedSystem: 'SAP S/4HANA',
    attachments: [
      {
        id: 'att-001',
        name: 'error_log.txt',
        type: 'text/plain',
        size: 25600,
        url: '/mock-files/error_log.txt'
      },
      {
        id: 'att-002',
        name: 'database_screenshot.png',
        type: 'image/png',
        size: 1048576,
        url: '/mock-files/database_screenshot.png'
      }
    ],
    aiClassification: {
      urgencyScore: 90,
      complexityEstimate: 'High',
      skillTags: ['Database', 'Backend', 'Integration'],
      recommendedAction: 'CRP',
      confidenceScore: 85
    },
    status: 'Classified',
    createdAt: new Date('2023-07-15T09:23:45'),
    updatedAt: new Date('2023-07-15T09:25:12'),
    threads: mockThreads.filter(thread => thread.parentTicketId === 'TKT-2023-001'),
    assignedLeadId: 'eng-001'
  },
  
  // Complex ticket scenario 2: Security breach with multiple affected systems
  {
    id: 'TKT-2023-002',
    subject: 'Potential security breach affecting multiple systems',
    description: 'We\'ve detected unusual login patterns across our SAP landscape. Security logs show multiple failed login attempts followed by successful logins from unrecognized IP addresses. This may indicate a potential security breach affecting user authentication across systems.',
    urgency: 'Critical',
    affectedSystem: 'SAP Business Technology Platform',
    attachments: [
      {
        id: 'att-003',
        name: 'security_logs.csv',
        type: 'text/csv',
        size: 512000,
        url: '/mock-files/security_logs.csv'
      }
    ],
    aiClassification: {
      urgencyScore: 95,
      complexityEstimate: 'High',
      skillTags: ['Security', 'Network', 'Backend'],
      recommendedAction: 'CRP',
      confidenceScore: 90
    },
    status: 'In Progress',
    createdAt: new Date('2023-07-14T15:42:18'),
    updatedAt: new Date('2023-07-14T15:45:30'),
    threads: mockThreads.filter(thread => thread.parentTicketId === 'TKT-2023-002'),
    assignedLeadId: 'eng-004'
  },
  
  // Complex ticket scenario 3: Performance issues across modules
  {
    id: 'TKT-2023-003',
    subject: 'Severe performance degradation across multiple modules',
    description: 'Since the latest update, our SAP ERP system has experienced significant performance issues. Reports take 5x longer to generate, transactions are timing out, and users report UI freezing. The issues span multiple modules including Finance, HR, and Logistics.',
    urgency: 'High',
    affectedSystem: 'SAP ERP',
    attachments: [
      {
        id: 'att-004',
        name: 'performance_metrics.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 2097152,
        url: '/mock-files/performance_metrics.xlsx'
      },
      {
        id: 'att-005',
        name: 'system_recording.mp4',
        type: 'video/mp4',
        size: 15728640,
        url: '/mock-files/system_recording.mp4'
      }
    ],
    aiClassification: {
      urgencyScore: 80,
      complexityEstimate: 'High',
      skillTags: ['Database', 'Backend', 'Analytics'],
      recommendedAction: 'CRP',
      confidenceScore: 85
    },
    status: 'Submitted',
    createdAt: new Date('2023-07-16T11:08:32'),
    updatedAt: new Date('2023-07-16T11:08:32')
  },
  
  // Standard ticket scenario 1: Report formatting issue
  {
    id: 'TKT-2023-004',
    subject: 'Financial report formatting incorrect',
    description: 'After the latest update, our financial reports are showing incorrect formatting. The decimal places are wrong and some currency symbols are missing.',
    urgency: 'Medium',
    affectedSystem: 'SAP S/4HANA',
    attachments: [
      {
        id: 'att-006',
        name: 'report_screenshot.png',
        type: 'image/png',
        size: 524288,
        url: '/mock-files/report_screenshot.png'
      }
    ],
    aiClassification: {
      urgencyScore: 50,
      complexityEstimate: 'Low',
      skillTags: ['Frontend', 'Analytics'],
      recommendedAction: 'Standard',
      confidenceScore: 95
    },
    status: 'Classified',
    createdAt: new Date('2023-07-17T14:22:45'),
    updatedAt: new Date('2023-07-17T14:24:12')
  },
  
  // Standard ticket scenario 2: User access issue
  {
    id: 'TKT-2023-005',
    subject: 'Unable to access procurement module',
    description: 'One of our purchasing managers cannot access the procurement module. The error message says "Insufficient privileges" even though they had access last week.',
    urgency: 'Medium',
    affectedSystem: 'SAP Ariba',
    attachments: [],
    aiClassification: {
      urgencyScore: 60,
      complexityEstimate: 'Low',
      skillTags: ['Security', 'Backend'],
      recommendedAction: 'Standard',
      confidenceScore: 90
    },
    status: 'Classified',
    createdAt: new Date('2023-07-18T09:15:22'),
    updatedAt: new Date('2023-07-18T09:17:45')
  }
];

/**
 * Get tickets by status
 * @param status The ticket status to filter by
 * @returns Array of tickets with the specified status
 */
export const getTicketsByStatus = (status: TicketStatus): Ticket[] => {
  return mockTickets.filter(ticket => ticket.status === status);
};

/**
 * Get tickets by urgency
 * @param urgency The urgency level to filter by
 * @returns Array of tickets with the specified urgency
 */
export const getTicketsByUrgency = (urgency: UrgencyLevel): Ticket[] => {
  return mockTickets.filter(ticket => ticket.urgency === urgency);
};

/**
 * Get tickets by affected system
 * @param system The affected system to filter by
 * @returns Array of tickets with the specified affected system
 */
export const getTicketsBySystem = (system: AffectedSystem): Ticket[] => {
  return mockTickets.filter(ticket => ticket.affectedSystem === system);
};

/**
 * Get tickets recommended for CRP
 * @returns Array of tickets recommended for CRP
 */
export const getTicketsForCRP = (): Ticket[] => {
  return mockTickets.filter(
    ticket => ticket.aiClassification?.recommendedAction === 'CRP'
  );
};

/**
 * Get tickets by assigned lead engineer
 * @param engineerId The engineer ID
 * @returns Array of tickets assigned to the specified lead engineer
 */
export const getTicketsByLeadEngineer = (engineerId: string): Ticket[] => {
  return mockTickets.filter(ticket => ticket.assignedLeadId === engineerId);
};

/**
 * Get a ticket by ID
 * @param id The ticket ID
 * @returns The ticket with the specified ID or undefined if not found
 */
export const getTicketById = (id: string): Ticket | undefined => {
  return mockTickets.find(ticket => ticket.id === id);
};