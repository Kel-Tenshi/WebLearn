export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: number;
  login: string;
  role: UserRole;
  fullName?: string | null;
  departmentId?: number | null;
}

export type EquipmentStatus = 'Работает' | 'В ремонте' | 'Простой' | 'Списано' | 'На консервации';

export interface Equipment {
  id: number;
  invNumber: string;
  serialNumber?: string | null;
  name: string;
  categoryId?: number | null;
  locationId?: number | null;
  status: EquipmentStatus;
  purchaseCost?: number;
  commissioningDate?: string | null;
  categoryName?: string | null;
  locationName?: string | null;
  departmentName?: string | null;
}

export type RequestType = 'Перемещение' | 'Списание' | 'Закупка' | 'Ремонт';
export type RequestPriority = 'Низкий' | 'Средний' | 'Высокий' | 'Критический';
export type RequestStatus = 'На согласовании' | 'Одобрено' | 'Отклонено' | 'Выполнено';

export interface RequestItem {
  id: number;
  type: RequestType;
  title: string;
  applicant: string;
  equipmentId?: number | null;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  equipmentName?: string | null;
  invNumber?: string | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  headName?: string | null;
}

export interface LocationItem {
  id: number;
  name: string;
  building: string;
  room?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string | null;
}

export interface Supplier {
  id: number;
  name: string;
  inn?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
}

export type AuditStatus = 'В процессе' | 'Завершена' | 'Выявлены расхождения';

export interface InventoryAudit {
  id: number;
  auditDate: string;
  locationId: number;
  auditor: string;
  status: AuditStatus;
  notes?: string | null;
  locationName?: string;
}

export type MaintenanceType = 'Плановое ТО' | 'Аварийный ремонт' | 'Калибровка/Поверка' | 'Модернизация';
export type MaintenanceStatus = 'Запланировано' | 'В процессе' | 'Завершено' | 'Отменено';

export interface MaintenanceLog {
  id: number;
  equipmentId: number;
  maintenanceType: MaintenanceType;
  performer: string;
  cost: number;
  startDate: string;
  endDate?: string | null;
  status: MaintenanceStatus;
  description?: string | null;
  equipmentName?: string;
  invNumber?: string;
}

export type TransferStatus = 'В пути' | 'Принято' | 'Отклонено';

export interface Transfer {
  id: number;
  equipmentId: number;
  fromLocationId?: number | null;
  toLocationId: number;
  transferredBy: string;
  transferDate: string;
  reason?: string | null;
  status: TransferStatus;
  equipmentName?: string;
  invNumber?: string;
  fromLocationName?: string;
  toLocationName?: string;
}

export type OrderStatus = 'Черновик' | 'Согласован' | 'В доставке' | 'Получен' | 'Отменён';

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId?: number | null;
  title: string;
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  createdBy: string;
  supplierName?: string;
}