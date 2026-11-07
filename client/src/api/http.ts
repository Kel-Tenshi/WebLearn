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

export async function request<T>(
  url: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
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
