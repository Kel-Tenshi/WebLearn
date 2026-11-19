export type MaintenanceType = 'Плановое ТО' | 'Аварийный ремонт' | 'Калибровка/Поверка' | 'Модернизация';
export type MaintenanceStatus =
  | 'Запланировано'
  | 'Ожидает запчастей'
  | 'В процессе'
  | 'Завершено'
  | 'Отменено';

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
  performerName?: string | null;
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
  transferredByName?: string | null;
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
  createdByName?: string | null;
}
