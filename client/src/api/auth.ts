import { User } from '../types';
import { request } from './http';

export const authApi = {
  login: (login: string, password: string) =>
    request<{ ok: boolean; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    }),
  refresh: () => request<{ ok: boolean; user: User }>('/auth/refresh', { method: 'POST' }),
  logout: () => request<{ ok: boolean }>('/auth/logout', { method: 'DELETE' }),
  register: (login: string, password: string, fullName?: string) =>
    request<User>('/user/register', {
      method: 'POST',
      body: JSON.stringify({ login, password, fullName }),
    }),
};
