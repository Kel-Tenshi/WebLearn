import { RequestItem, RequestStatus } from '../types';
import { request } from './http';

export const requestsApi = {
  getAll: () => request<RequestItem[]>('/api/requests'),
  create: (data: Partial<RequestItem>) =>
    request<RequestItem>('/api/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: RequestStatus) =>
    request<{ id: number; status: string }>(`/api/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
