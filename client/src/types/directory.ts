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
