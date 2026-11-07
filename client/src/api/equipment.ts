import { Equipment } from '../types';
import { request } from './http';

export const equipmentApi = {
  getAll: () => request<Equipment[]>('/api/equipment'),
  getById: (id: number) => request<Equipment>(`/api/equipment/${id}`),
  create: (data: Partial<Equipment>) =>
    request<Equipment>('/api/equipment', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Equipment>) =>
    request<Equipment>(`/api/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ message: string }>(`/api/equipment/${id}`, { method: 'DELETE' }),
};
