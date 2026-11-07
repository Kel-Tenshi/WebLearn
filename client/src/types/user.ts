export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: number;
  login: string;
  role: UserRole;
  fullName?: string | null;
  departmentId?: number | null;
}
