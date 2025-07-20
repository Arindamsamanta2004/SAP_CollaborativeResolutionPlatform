import { IssueThread, ThreadStatus, SkillType } from '../types';

/**
 * Mock data for issue threads with realistic decomposition
 */
export const mockThreads: IssueThread[] = [
  // Threads for ticket TKT-2023-001: Email system failure with database errors
  {
    id: 'THR-001-1',
    parentTicketId: 'TKT-2023-001',
    title: 'Database connection timeout investigation',
    description: 'Investigate the database connection timeouts shown in the logs. Check connection pooling, database server load, and network connectivity between application and database servers.',
    requiredSkills: ['Database'],
    assignedEngineerId: 'eng-003',
    status: 'In Progress',
    priority: 10,
    chatEnabled: true,
    createdAt: new Date('2023-07-15T09:26:00'),
    updatedAt: new Date('2023-07-15T10:15:22')
  },
  {
    id: 'THR-001-2',
    parentTicketId: 'TKT-2023-001',
    title: 'Email service configuration check',
    description: 'Verify the email service configuration and connectivity. Check SMTP settings, email templates, and service availability.',
    requiredSkills: ['Backend', 'Integration'],
    assignedEngineerId: null,
    status: 'Open',
    priority: 8,
    chatEnabled: true,
    createdAt: new Date('2023-07-15T09:26:00'),
    updatedAt: new Date('2023-07-15T09:26:00')
  },
  {
    id: 'THR-001-3',
    parentTicketId: 'TKT-2023-001',
    title: 'Purchase order approval workflow validation',
    description: 'Validate the purchase order approval workflow configuration and check for any broken steps in the process that might be affecting email notifications.',
    requiredSkills: ['Backend'],
    assignedEngineerId: 'eng-001',
    status: 'In Progress',
    priority: 7,
    chatEnabled: true,
    createdAt: new Date('2023-07-15T09:26:00'),
    updatedAt: new Date('2023-07-15T11:05:45')
  },
  
  // Threads for ticket TKT-2023-002: Security breach with multiple affected systems
  {
    id: 'THR-002-1',
    parentTicketId: 'TKT-2023-002',
    title: 'Security log analysis and threat identification',
    description: 'Analyze security logs to identify patterns of unauthorized access attempts. Map IP addresses and timestamps to determine attack vectors.',
    requiredSkills: ['Security'],
    assignedEngineerId: 'eng-004',
    status: 'In Progress',
    priority: 10,
    chatEnabled: true,
    createdAt: new Date('2023-07-14T15:46:12'),
    updatedAt: new Date('2023-07-14T16:30:00')
  },
  {
    id: 'THR-002-2',
    parentTicketId: 'TKT-2023-002',
    title: 'Network traffic analysis and firewall configuration',
    description: 'Review network traffic patterns and firewall configurations. Check for any unauthorized open ports or misconfigured access rules.',
    requiredSkills: ['Network', 'Security'],
    assignedEngineerId: null,
    status: 'Open',
    priority: 9,
    chatEnabled: true,
    createdAt: new Date('2023-07-14T15:46:12'),
    updatedAt: new Date('2023-07-14T15:46:12')
  },
  {
    id: 'THR-002-3',
    parentTicketId: 'TKT-2023-002',
    title: 'User authentication system review',
    description: 'Review the user authentication system for vulnerabilities. Check password policies, MFA configuration, and session management.',
    requiredSkills: ['Security', 'Backend'],
    assignedEngineerId: null,
    status: 'Open',
    priority: 8,
    chatEnabled: true,
    createdAt: new Date('2023-07-14T15:46:12'),
    updatedAt: new Date('2023-07-14T15:46:12')
  },
  {
    id: 'THR-002-4',
    parentTicketId: 'TKT-2023-002',
    title: 'Implement emergency access controls',
    description: 'Implement emergency access controls to prevent further unauthorized access while the investigation is ongoing.',
    requiredSkills: ['Security', 'DevOps'],
    assignedEngineerId: null,
    status: 'Open',
    priority: 10,
    chatEnabled: true,
    createdAt: new Date('2023-07-14T15:46:12'),
    updatedAt: new Date('2023-07-14T15:46:12')
  }
];

/**
 * Get threads by parent ticket ID
 * @param ticketId The parent ticket ID
 * @returns Array of threads for the specified ticket
 */
export const getThreadsByTicketId = (ticketId: string): IssueThread[] => {
  return mockThreads.filter(thread => thread.parentTicketId === ticketId);
};

/**
 * Get threads by status
 * @param status The thread status to filter by
 * @returns Array of threads with the specified status
 */
export const getThreadsByStatus = (status: ThreadStatus): IssueThread[] => {
  return mockThreads.filter(thread => thread.status === status);
};

/**
 * Get threads by required skill
 * @param skill The required skill to filter by
 * @returns Array of threads requiring the specified skill
 */
export const getThreadsBySkill = (skill: SkillType): IssueThread[] => {
  return mockThreads.filter(thread => thread.requiredSkills.includes(skill));
};

/**
 * Get threads by assigned engineer
 * @param engineerId The engineer ID
 * @returns Array of threads assigned to the specified engineer
 */
export const getThreadsByEngineer = (engineerId: string): IssueThread[] => {
  return mockThreads.filter(thread => thread.assignedEngineerId === engineerId);
};

/**
 * Get unassigned threads
 * @returns Array of threads that are not assigned to any engineer
 */
export const getUnassignedThreads = (): IssueThread[] => {
  return mockThreads.filter(thread => thread.assignedEngineerId === null);
};

/**
 * Assign a thread to an engineer
 * @param threadId The thread ID
 * @param engineerId The engineer ID
 * @returns The updated thread or undefined if not found
 */
export const assignThreadToEngineer = (
  threadId: string, 
  engineerId: string
): IssueThread | undefined => {
  const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
  if (threadIndex === -1) return undefined;
  
  mockThreads[threadIndex] = {
    ...mockThreads[threadIndex],
    assignedEngineerId: engineerId,
    status: 'In Progress',
    updatedAt: new Date()
  };
  
  return mockThreads[threadIndex];
};

/**
 * Update thread status
 * @param threadId The thread ID
 * @param status The new thread status
 * @param solution Optional solution text when marking as resolved
 * @returns The updated thread or undefined if not found
 */
export const updateThreadStatus = (
  threadId: string, 
  status: ThreadStatus,
  solution?: string
): IssueThread | undefined => {
  const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
  if (threadIndex === -1) return undefined;
  
  mockThreads[threadIndex] = {
    ...mockThreads[threadIndex],
    status,
    updatedAt: new Date(),
    ...(solution && { solution })
  };
  
  return mockThreads[threadIndex];
};

/**
 * Update thread solution
 * @param threadId The thread ID
 * @param solution The solution text
 * @returns The updated thread or undefined if not found
 */
export const updateThreadSolution = (
  threadId: string,
  solution: string
): IssueThread | undefined => {
  const threadIndex = mockThreads.findIndex(thread => thread.id === threadId);
  if (threadIndex === -1) return undefined;
  
  mockThreads[threadIndex] = {
    ...mockThreads[threadIndex],
    solution,
    updatedAt: new Date()
  };
  
  return mockThreads[threadIndex];
};