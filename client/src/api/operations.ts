import {
  MaintenanceLog,
  MaintenanceStatus,
  OrderStatus,
  PurchaseOrder,
  Transfer,
  TransferStatus,
} from '../types';
import { request } from './http';

export const operationsApi = {
  getMaintenance: () => request<MaintenanceLog[]>('/api/operations/maintenance'),
  createMaintenance: (data: Partial<MaintenanceLog>) =>
    request<MaintenanceLog>('/api/operations/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenanceStatus: (id: number, status: MaintenanceStatus, endDate?: string) =>
    request<{ ok: boolean; status: string }>(`/api/operations/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, endDate }),
    }),

  getTransfers: () => request<Transfer[]>('/api/operations/transfers'),
  createTransfer: (data: { equipmentId: number; toLocationId: number; reason?: string }) =>
    request<Transfer>('/api/operations/transfers', { method: 'POST', body: JSON.stringify(data) }),
  updateTransferStatus: (id: number, status: TransferStatus) =>
    request<{ ok: boolean; status: string }>(`/api/operations/transfers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getOrders: () => request<PurchaseOrder[]>('/api/operations/orders'),
  createOrder: (data: Partial<PurchaseOrder>) =>
    request<PurchaseOrder>('/api/operations/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    request<{ ok: boolean; status: string }>(`/api/operations/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
