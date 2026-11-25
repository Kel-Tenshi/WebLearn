// Справочные списки для фильтров и сортировки на клиенте.
// Значения совпадают с серверными константами (Server/constants.js).

import {
  AuditStatus,
  EquipmentStatus,
  MaintenanceStatus,
  MaintenanceType,
  OrderStatus,
  RequestPriority,
  RequestStatus,
  RequestType,
  TransferStatus,
  UserRole,
} from '../types';
import { ROLE_LABELS } from '../utils/roles';

export const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  'Работает',
  'В ремонте',
  'Простой',
  'Списано',
  'На консервации',
];

export const REQUEST_TYPES: RequestType[] = ['Перемещение', 'Списание', 'Закупка', 'Ремонт'];

export const REQUEST_PRIORITIES: RequestPriority[] = [
  'Низкий',
  'Средний',
  'Высокий',
  'Критический',
];

export const REQUEST_STATUSES: RequestStatus[] = [
  'На согласовании',
  'Одобрено',
  'В работе',
  'Выполнено',
  'Отклонено',
  'Отменено',
];

export const MAINTENANCE_TYPES: MaintenanceType[] = [
  'Плановое ТО',
  'Аварийный ремонт',
  'Калибровка/Поверка',
  'Модернизация',
];

export const MAINTENANCE_STATUSES: MaintenanceStatus[] = [
  'Запланировано',
  'Ожидает запчастей',
  'В процессе',
  'Завершено',
  'Отменено',
];

export const TRANSFER_STATUSES: TransferStatus[] = ['В пути', 'Принято', 'Отклонено'];

export const ORDER_STATUSES: OrderStatus[] = [
  'Черновик',
  'Согласован',
  'В доставке',
  'Получен',
  'Отменён',
];

export const AUDIT_STATUSES: AuditStatus[] = [
  'В процессе',
  'Завершена',
  'Выявлены расхождения',
];

export const USER_ROLES: UserRole[] = ['employee', 'manager', 'admin', 'root'];

export const toOptions = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

export const ROLE_OPTIONS = USER_ROLES.map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}));

// Числовой вес для сортировки приоритетов и статусов в «естественном» порядке.
export const PRIORITY_RANK: Record<RequestPriority, number> = {
  'Низкий': 1,
  'Средний': 2,
  'Высокий': 3,
  'Критический': 4,
};

export const REQUEST_STATUS_RANK: Record<RequestStatus, number> = {
  'На согласовании': 1,
  'Одобрено': 2,
  'В работе': 3,
  'Выполнено': 4,
  'Отклонено': 5,
  'Отменено': 6,
};

export const USER_ROLE_RANK: Record<UserRole, number> = {
  'employee': 1,
  'manager': 2,
  'admin': 3,
  'root': 4,
};
