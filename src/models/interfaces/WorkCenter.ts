/**
 * Interface for Work Center data
 */
export interface WorkCenter {
  id: string;
  name: string;
  description: string;
  capacity: number;
  availableCapacity: number;
  utilizationPercentage: number;
  status: WorkCenterStatus;
}

/**
 * Enum for Work Center status
 */
export enum WorkCenterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}