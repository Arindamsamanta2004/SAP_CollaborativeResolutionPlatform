/**
 * Interface for User data
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

/**
 * Enum for User roles
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  PLANNER = 'PLANNER',
  VIEWER = 'VIEWER'
}