/**
 * Type definitions for the SAP CRP Demo application
 */

// User interface
export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

// Ticket urgency levels
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

// Ticket complexity estimates
export type ComplexityEstimate = 'Low' | 'Medium' | 'High';

// Ticket status types
export type TicketStatus = 'Submitted' | 'Classified' | 'In Progress' | 'Resolved';

// Thread status types
export type ThreadStatus = 'Open' | 'In Progress' | 'Resolved';

// Engineer availability status
export type AvailabilityStatus = 'Available' | 'Busy' | 'Offline';

// Recommended routing action
export type RecommendedAction = 'Standard' | 'CRP';

// Affected SAP systems
export type AffectedSystem =
  | 'SAP ERP'
  | 'SAP S/4HANA'
  | 'SAP SuccessFactors'
  | 'SAP Ariba'
  | 'SAP Concur'
  | 'SAP Fieldglass'
  | 'SAP Customer Experience'
  | 'SAP Business Technology Platform';

// Skill types for engineers and tickets
export type SkillType =
  | 'Database'
  | 'Frontend'
  | 'Backend'
  | 'Network'
  | 'Security'
  | 'DevOps'
  | 'Integration'
  | 'Analytics'
  | 'Mobile'
  | 'Cloud'
  | 'UX';

// File attachment interface
export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// AI Classification metadata
export interface AIClassification {
  urgencyScore: number; // 0-100
  complexityEstimate: ComplexityEstimate;
  skillTags: SkillType[];
  recommendedAction: RecommendedAction;
  confidenceScore: number; // 0-100
}

// Ticket interface
export interface Ticket {
  id: string;
  subject: string;
  description: string;
  urgency: UrgencyLevel;
  affectedSystem: AffectedSystem;
  attachments: Attachment[];
  aiClassification?: AIClassification;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
  threads?: IssueThread[];
  assignedLeadId?: string;
  resolution?: string;
  resolvedAt?: Date;
}

// Issue Thread interface
export interface IssueThread {
  id: string;
  parentTicketId: string;
  title: string;
  description: string;
  requiredSkills: SkillType[];
  assignedEngineerId: string | null;
  status: ThreadStatus;
  priority: number; // 1-10, with 10 being highest
  chatEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  solution?: string;
}

// Engineer expertise mapping
export interface ExpertiseMap {
  [skill: string]: number; // 0-100 proficiency
}

// Engineer interface
export interface Engineer {
  id: string;
  name: string;
  skills: SkillType[];
  availability: AvailabilityStatus;
  currentWorkload: number; // 0-100
  expertise: ExpertiseMap;
  avatar?: string;
  email?: string;
  department?: string;
  isLeadEngineer?: boolean;
}

// CRP (Customer Resolution Process) interface
export interface CRP {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedEngineers: string[]; // Engineer IDs
  relatedTicketIds: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedEffort?: number; // In hours
  actualEffort?: number; // In hours
}

// Work Center interface
export interface WorkCenter {
  id: string;
  name: string;
  description: string;
  location: string;
  capacity: number;
  currentLoad: number;
  status: 'Active' | 'Maintenance' | 'Offline';
}