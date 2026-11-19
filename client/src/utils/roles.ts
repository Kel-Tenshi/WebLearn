import { UserRole } from '../types';

export const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Сотрудник',
  manager: 'Руководитель',
  admin: 'Администратор',
  root: 'Владелец системы',
};

// Роли с доступом к управленческим действиям (создание, смена статусов)
export function isManagerRole(role: UserRole): boolean {
  return role === 'manager' || role === 'admin' || role === 'root';
}

// Роли с доступом к разделу «Пользователи»
export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'root';
}

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role;
}
