import { User, UserRole } from '../types';
import { request } from './http';

export const userApi = {
  getMe: () => request<User>('/user/me'),
  updateProfile: (data: { fullName?: string | null; departmentId?: number | null }) =>
    request<User>('/user/me', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ ok: boolean; message: string }>('/user/me/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getUsers: () => request<User[]>('/user'),
  updateRole: (id: number, role: UserRole) =>
    request<{ id: number; role: UserRole }>(`/user/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
  deleteUser: (id: number) => request<{ message: string }>(`/user/${id}`, { method: 'DELETE' }),
  resetDb: () =>
    request<{ ok: boolean; message: string }>('/user/reset-db', { method: 'POST' }),
};
