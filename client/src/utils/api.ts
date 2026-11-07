import {
  User, UserRole, Equipment, RequestItem,
  Department, LocationItem, Category, Supplier, InventoryAudit, AuditStatus,
  MaintenanceLog, Transfer, PurchaseOrder, MaintenanceStatus, OrderStatus, RequestStatus
} from './types';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(url: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkErr: any) {
    throw new ApiError(0, 'Сервер недоступен. Проверьте соединение с сетью');
  }

  // Автоматический refresh токена при 401
  if (response.status === 401 && !isRetry && !url.startsWith('/auth/')) {
    try {
      const refreshRes = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });
      if (refreshRes.ok) {
        return await request<T>(url, options, true);
      }
    } catch {
      // Игнорируем ошибку обновления
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = data && data.message ? data.message : '';
    if (!message) {
      switch (response.status) {
        case 400: message = 'Некорректный запрос (400)'; break;
        case 401: message = 'Сессия истекла или требуется авторизация (401)'; break;
        case 403: message = 'Недостаточно прав для выполнения действия (403)'; break;
        case 404: message = 'Запрашиваемый ресурс не найден (404)'; break;
        case 409: message = 'Запись с такими данными уже существует (409)'; break;
        case 500: message = 'Внутренняя ошибка сервера (500)'; break;
        default: message = `Ошибка запроса (${response.status})`;
      }
    }
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

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

export const userApi = {
  getMe: () => request<User>('/user/me'),
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

export const equipmentApi = {
  getAll: () => request<Equipment[]>('/api/equipment'),
  getById: (id: number) => request<Equipment>(`/api/equipment/${id}`),
  create: (data: Partial<Equipment>) =>
    request<Equipment>('/api/equipment', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Equipment>) =>
    request<Equipment>(`/api/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<{ message: string }>(`/api/equipment/${id}`, { method: 'DELETE' }),
};

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

export const directoryApi = {
  getDepartments: () => request<Department[]>('/api/directory/departments'),
  createDepartment: (data: { name: string; code: string; headName?: string }) =>
    request<Department>('/api/directory/departments', { method: 'POST', body: JSON.stringify(data) }),

  getLocations: () => request<LocationItem[]>('/api/directory/locations'),
  createLocation: (data: { name: string; building: string; room?: string; departmentId?: number | null }) =>
    request<LocationItem>('/api/directory/locations', { method: 'POST', body: JSON.stringify(data) }),

  getCategories: () => request<Category[]>('/api/directory/categories'),
  createCategory: (data: { name: string; code: string; description?: string }) =>
    request<Category>('/api/directory/categories', { method: 'POST', body: JSON.stringify(data) }),

  getSuppliers: () => request<Supplier[]>('/api/directory/suppliers'),
  createSupplier: (data: Partial<Supplier>) =>
    request<Supplier>('/api/directory/suppliers', { method: 'POST', body: JSON.stringify(data) }),

  getAudits: () => request<InventoryAudit[]>('/api/directory/audits'),
  createAudit: (data: { locationId: number; auditor?: string; notes?: string }) =>
    request<InventoryAudit>('/api/directory/audits', { method: 'POST', body: JSON.stringify(data) }),
  updateAuditStatus: (id: number, status: AuditStatus, notes?: string) =>
    request<{ ok: boolean; status: string }>(`/api/directory/audits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
};

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

  getOrders: () => request<PurchaseOrder[]>('/api/operations/orders'),
  createOrder: (data: Partial<PurchaseOrder>) =>
    request<PurchaseOrder>('/api/operations/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    request<{ ok: boolean; status: string }>(`/api/operations/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};