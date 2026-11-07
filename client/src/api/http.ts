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

const REQUEST_TIMEOUT_MS = 15000;

function fallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Некорректный запрос (400)';
    case 401:
      return 'Сессия истекла или требуется авторизация (401)';
    case 403:
      return 'Недостаточно прав для выполнения действия (403)';
    case 404:
      return 'Запрашиваемый ресурс не найден (404)';
    case 409:
      return 'Запись с такими данными уже существует (409)';
    case 413:
      return 'Слишком большой размер запроса (413)';
    case 422:
      return 'Ошибка валидации данных (422)';
    case 429:
      return 'Слишком много запросов, попробуйте позже (429)';
    case 500:
      return 'Внутренняя ошибка сервера (500)';
    case 502:
      return 'Сервер временно недоступен (502)';
    case 503:
      return 'Сервис недоступен (503)';
    case 504:
      return 'Сервер не отвечает (504)';
    default:
      return `Ошибка запроса (${status})`;
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

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, { ...config, signal: options.signal || controller.signal });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new ApiError(0, 'Сервер не отвечает. Превышено время ожидания');
    }
    throw new ApiError(0, 'Сервер недоступен. Проверьте соединение с сетью');
  } finally {
    window.clearTimeout(timeout);
  }

  // Автоматический refresh токена при 401
  if (response.status === 401 && !isRetry && !url.startsWith('/auth/')) {
    try {
      const refreshRes = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });
      if (refreshRes.ok) {
        return await request<T>(url, options, true);
      }
    } catch {
      // Ошибку обновления обработаем как истёкшую сессию
    }

    // Сообщаем приложению, что сессия больше недействительна
    window.dispatchEvent(new Event('auth:expired'));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data && data.message) || fallbackMessage(response.status);
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}
