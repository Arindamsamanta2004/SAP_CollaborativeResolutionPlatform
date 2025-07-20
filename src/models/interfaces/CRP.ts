/**
 * Interface for CRP (Capacity Requirements Planning) data
 */
export interface CRP {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CRPStatus;
  workCenter: string;
  capacity: number;
  utilization: number;
  requirements: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enum for CRP status
 */
export enum CRPStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}