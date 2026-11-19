import { AuditStatus, Category, Department, InventoryAudit, LocationItem, Supplier } from '../types';
import { request } from './http';

export const directoryApi = {
  getDepartments: () => request<Department[]>('/api/directory/departments'),
  createDepartment: (data: { name: string; code: string; headName?: string }) =>
    request<Department>('/api/directory/departments', { method: 'POST', body: JSON.stringify(data) }),
  updateDepartment: (id: number, data: { name: string; code: string; headName?: string }) =>
    request<Department>(`/api/directory/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDepartment: (id: number) =>
    request<{ message: string }>(`/api/directory/departments/${id}`, { method: 'DELETE' }),

  getLocations: () => request<LocationItem[]>('/api/directory/locations'),
  createLocation: (data: { name: string; building: string; room?: string; departmentId?: number | null }) =>
    request<LocationItem>('/api/directory/locations', { method: 'POST', body: JSON.stringify(data) }),
  updateLocation: (
    id: number,
    data: { name: string; building: string; room?: string; departmentId?: number | null }
  ) =>
    request<LocationItem>(`/api/directory/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLocation: (id: number) =>
    request<{ message: string }>(`/api/directory/locations/${id}`, { method: 'DELETE' }),

  getCategories: () => request<Category[]>('/api/directory/categories'),
  createCategory: (data: { name: string; code: string; description?: string }) =>
    request<Category>('/api/directory/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: { name: string; code: string; description?: string }) =>
    request<Category>(`/api/directory/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: number) =>
    request<{ message: string }>(`/api/directory/categories/${id}`, { method: 'DELETE' }),

  getSuppliers: () => request<Supplier[]>('/api/directory/suppliers'),
  createSupplier: (data: Partial<Supplier>) =>
    request<Supplier>('/api/directory/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: number, data: Partial<Supplier>) =>
    request<Supplier>(`/api/directory/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id: number) =>
    request<{ message: string }>(`/api/directory/suppliers/${id}`, { method: 'DELETE' }),

  getAudits: () => request<InventoryAudit[]>('/api/directory/audits'),
  createAudit: (data: { locationId: number; auditor?: string; notes?: string }) =>
    request<InventoryAudit>('/api/directory/audits', { method: 'POST', body: JSON.stringify(data) }),
  updateAuditStatus: (id: number, status: AuditStatus, notes?: string) =>
    request<{ ok: boolean; status: string }>(`/api/directory/audits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
};
